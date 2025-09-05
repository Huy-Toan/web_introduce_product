import { Hono } from 'hono';

// UUID v4 (không bắt buộc dùng nếu bạn thích tên SEO thuần)
function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

// slug tiếng Việt -> không dấu, chữ thường, - thay khoảng trắng
function toSlug(s = '', maxLen = 80) {
  return String(s)
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-_.]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '')
    .slice(0, maxLen)
    .replace(/[-.]+$/g, '');
}

function sanitizePrefix(input = '') {
  return String(input || '')
    .toLowerCase()
    .replace(/[^a-z0-9/_-]+/g, '')
    .replace(/\.\.+/g, '')
    .replace(/\/{2,}/g, '/')
    .replace(/^\/+|\/+$/g, '');
}

const EXT_BY_MIME = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
};

const uploadImageRouter = new Hono();

uploadImageRouter.post('/', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('image');
    if (!file || typeof file === 'string') {
      return c.json({ error: 'Không có file nào được upload' }, 400);
    }

    const allowedTypes = Object.keys(EXT_BY_MIME);
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: 'Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP)' }, 400);
    }
    if (file.size > 5 * 1024 * 1024) {
      return c.json({ error: 'Kích thước ảnh không được vượt quá 5MB!' }, 400);
    }

    const urlObj = new URL(c.req.url);
    // === Params watermark (tuỳ chọn) ===
    const doWatermark = (urlObj.searchParams.get('watermark') ?? '1') !== '0'; // mặc định bật
    const pos = (urlObj.searchParams.get('pos') || 'br').toLowerCase();        // tl|tr|bl|br
    const logoWidth = parseInt(urlObj.searchParams.get('logoWidth') || '160', 10);
    const opacity = clamp01(parseFloat(urlObj.searchParams.get('opacity') || '0.95'));
    const logoPath = urlObj.searchParams.get('logo') || '/itxeasy-logo.png';   // từ public/

    // 1) Lấy tên SEO mong muốn
    const rawSeoName =
      formData.get('seoName') ||
      urlObj.searchParams.get('seoName') ||
      (file.name ? file.name.replace(/\.[^.]+$/, '') : 'image');

    const baseSlug = toSlug(rawSeoName) || 'image';

    // (Tuỳ chọn) prefix "thư mục" (vd: products, banners/2025/08)
    const rawFolder =
      formData.get('folder') ||
      urlObj.searchParams.get('folder') ||
      c.env.R2_PREFIX || '';
    const prefix = sanitizePrefix(rawFolder);

    // 2) Extension an toàn
    const extFromName = (file.name && file.name.includes('.')) ? file.name.split('.').pop() : '';
    const ext = (extFromName || EXT_BY_MIME[file.type] || 'jpg').toLowerCase();

    // 3) Tên file SEO + tránh trùng
    const addId = String(c.env.ADD_RANDOM_ID || '').toLowerCase() === 'true';
    const shortId = Math.random().toString(36).slice(2, 8);

    const buildKey = (slug, withId) => {
      const name = withId ? `${slug}-${shortId}.${ext}` : `${slug}.${ext}`;
      return prefix ? `${prefix}/${name}` : name;
    };

    let key = buildKey(baseSlug, addId);

    // Nếu KHÔNG bật ADD_RANDOM_ID, kiểm tra trùng và tự thêm suffix khi cần
    if (!addId) {
      let tries = 0;
      while (tries < 3) {
        const head = await c.env.IMAGES.head(key);
        if (!head) break; // chưa tồn tại -> dùng key này
        const suffix = Math.random().toString(36).slice(2, 6);
        key = buildKey(`${baseSlug}-${suffix}`, false);
        tries++;
      }
    }

    // 4) Upload lên R2
    const r2 = c.env.IMAGES;
    // lưu buffer một lần để dùng lại cho watermark, tránh đọc lại từ R2
    const buf = await file.arrayBuffer();

    await r2.put(key, buf, {
      httpMetadata: {
        contentType: file.type,
        cacheControl: 'public, max-age=31536000, immutable',
        contentDisposition: `inline; filename="${key.split('/').pop()}"`,
      },
    });

    // 4b) Auto watermark (nếu bật)
    let wmKey = null;
    if (doWatermark && c.env.IMGPROC && c.env.ASSETS) {
      // Lấy logo từ ASSETS (public/)
      const assetUrl = new URL(logoPath, c.req.url);
      const logoRes = await c.env.ASSETS.fetch(new Request(assetUrl.toString(), { method: 'GET' }));
      if (!logoRes.ok || !logoRes.body) {
        console.warn('Watermark: logo not found in ASSETS:', logoPath);
      } else {
        const overlay = c.env.IMGPROC.input(logoRes.body).resize({ width: logoWidth });
        const anchor = toAnchor(pos);
        const margin = 16;

        const out = await c.env.IMGPROC
          .input(buf) // dùng lại buffer ảnh vừa upload
          .draw(overlay, {
            opacity,
            ...anchor,
            top: anchor.top !== undefined ? margin : undefined,
            right: anchor.right !== undefined ? margin : undefined,
            bottom: anchor.bottom !== undefined ? margin : undefined,
            left: anchor.left !== undefined ? margin : undefined,
          })
          .output({ format: file.type })
          .blob();

        wmKey = withWatermarkKey(key);
        await r2.put(wmKey, out, {
          httpMetadata: {
            contentType: file.type,
            cacheControl: 'public, max-age=31536000, immutable',
          },
        });
      }
    }

    // 5) Trả về URL
    if (!c.env.INTERNAL_R2_URL && !c.env.PUBLIC_R2_URL) {
      return c.json({ error: 'Thiếu biến môi trường INTERNAL_R2_URL hoặc PUBLIC_R2_URL' }, 500);
    }
    const storageBase = (c.env.INTERNAL_R2_URL || c.env.PUBLIC_R2_URL).replace(/\/+$/, '');
    const displayBase = (c.env.PUBLIC_R2_URL || storageBase).replace(/\/+$/, '');

    const storageUrl = `${storageBase}/${key}`;
    const displayUrl = `${displayBase}/${key}`;
    const wmStorageUrl = wmKey ? `${storageBase}/${wmKey}` : null;
    const wmDisplayUrl = wmKey ? `${displayBase}/${wmKey}` : null;

    return c.json({
      success: true,
      // Gốc
      image_key: key,
      displayUrl,
      // Watermark (nếu có)
      wm_key: wmKey || undefined,
      wm_displayUrl: wmDisplayUrl || undefined,
      fileName: (wmKey || key).split('/').pop(),
      alt: baseSlug,
      prefix,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return c.json({
      error: 'Có lỗi xảy ra khi upload ảnh',
      details: error.message,
    }, 500);
  }
});

export default uploadImageRouter;

// ===== Helpers =====
function clamp01(n) {
  if (!Number.isFinite(n)) return 0.95;
  return Math.max(0, Math.min(1, n));
}
function toAnchor(pos) {
  switch (pos) {
    case 'tl': return { top: 0, left: 0 };
    case 'tr': return { top: 0, right: 0 };
    case 'bl': return { bottom: 0, left: 0 };
    case 'br':
    default: return { bottom: 0, right: 0 };
  }
}
function withWatermarkKey(k) {
  const i = k.lastIndexOf('.');
  return i < 0 ? `${k}-wm` : `${k.slice(0, i)}-wm${k.slice(i)}`;
}
