// api/upload-image.js
import { Hono } from 'hono';

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
  'image/jpg':  'jpg',
  'image/png':  'png',
  'image/gif':  'gif',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

function clamp01(n) { if (!Number.isFinite(n)) return 0.95; return Math.max(0, Math.min(1, n)); }
function toAnchor(p) { return p === 'tl' ? { top: 0, left: 0 } : p === 'tr' ? { top: 0, right: 0 } : p === 'bl' ? { bottom: 0, left: 0 } : { bottom: 0, right: 0 }; }
function withWatermarkKey(k) { const i = k.lastIndexOf('.'); return i < 0 ? `${k}-wm` : `${k.slice(0, i)}-wm${k.slice(i)}`; }
function mimeFromKeyOrType(nameOrMime = 'image/jpeg') {
  // ưu tiên theo đuôi file; fallback MIME input
  const s = String(nameOrMime).toLowerCase();
  const m1 = s.match(/\.(jpe?g|png|webp|avif|gif)$/)?.[1];
  if (m1 === 'jpg' || m1 === 'jpeg') return 'image/jpeg';
  if (m1 === 'png') return 'image/png';
  if (m1 === 'webp') return 'image/webp';
  if (m1 === 'avif') return 'image/avif';
  if (m1 === 'gif') return 'image/gif';

  // từ MIME
  if (s.includes('jpeg')) return 'image/jpeg';
  if (s.includes('png')) return 'image/png';
  if (s.includes('webp')) return 'image/webp';
  if (s.includes('avif')) return 'image/avif';
  if (s.includes('gif')) return 'image/gif';
  return 'image/jpeg';
}

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
      return c.json({ error: 'Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP, AVIF)' }, 400);
    }
    if (file.size > 5 * 1024 * 1024) {
      return c.json({ error: 'Kích thước ảnh không được vượt quá 5MB!' }, 400);
    }

    const urlObj = new URL(c.req.url);

    // 1) Lấy tên SEO mong muốn: form seoName -> query seoName -> tên file (không đuôi) -> 'image'
    const rawSeoName =
      formData.get('seoName') ||
      urlObj.searchParams.get('seoName') ||
      (file.name ? file.name.replace(/\.[^.]+$/, '') : 'image');

    const baseSlug = toSlug(rawSeoName) || 'image';

    // (Tuỳ chọn) prefix "thư mục" từ form/query/env (ví dụ: products, banners/2025/08)
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

    // Tạo key ứng viên
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
        if (!head) break;
        const suffix = Math.random().toString(36).slice(2, 6);
        key = buildKey(`${baseSlug}-${suffix}`, false);
        tries++;
      }
    }

    // 4) Upload lên R2
    const r2 = c.env.IMAGES;
    const arrBuf = await file.arrayBuffer();
    await r2.put(key, arrBuf, {
      httpMetadata: {
        contentType: file.type,
        cacheControl: 'public, max-age=31536000, immutable',
        contentDisposition: `inline; filename="${key.split('/').pop()}"`,
      },
    });

    // ==== 4b) AUTO WATERMARK (tùy chọn) ====
    // Bật/tắt theo ENV AUTO_WATERMARK, hoặc query/form ?wm=0/1
    const wmParam = (formData.get('wm') ?? urlObj.searchParams.get('wm')) ?? '';
    const wmEnabledDefault = String(c.env.AUTO_WATERMARK || '1') === '1';
    const wmEnabled = wmParam === '0' ? false : (wmParam === '1' ? true : wmEnabledDefault);

    let wmKey = null;
    if (wmEnabled) {
      try {
        // cấu hình watermark
        const pos = (formData.get('pos') || urlObj.searchParams.get('pos') || c.env.WM_POS || 'tr').toString().toLowerCase();
        const logoWidth = parseInt(formData.get('logoWidth') || urlObj.searchParams.get('logoWidth') || c.env.WM_LOGO_WIDTH || '180', 10);
        const opacity = clamp01(parseFloat(formData.get('opacity') || urlObj.searchParams.get('opacity') || c.env.WM_OPACITY || '0.95'));
        const logoKey = (formData.get('logoKey') || urlObj.searchParams.get('logoKey') || c.env.LOGO_KEY || 'itxeasy-logo.png').toString();

        // lấy ảnh nguồn & logo từ R2
        const [srcObj, logoObj] = await Promise.all([r2.get(key), r2.get(logoKey)]);
        if (!srcObj?.body) throw new Error(`Source not found: ${key}`);
        if (!logoObj?.body) throw new Error(`Logo not found in R2: ${logoKey}`);

        // chuẩn bị overlay từ logo (Images binding: .transform, không phải .resize)
        const logoBuf = await logoObj.arrayBuffer();
        const overlay = c.env.IMGPROC.input(logoBuf).transform({ width: logoWidth });

        const anchor = toAnchor(pos);
        const margin = 16;
        const outMime = mimeFromKeyOrType(key || file.type);

        const out = await c.env.IMGPROC
          .input(srcObj.body)
          .draw(overlay, {
            opacity,
            ...anchor,
            top: anchor.top !== undefined ? margin : undefined,
            right: anchor.right !== undefined ? margin : undefined,
            bottom: anchor.bottom !== undefined ? margin : undefined,
            left: anchor.left !== undefined ? margin : undefined,
          })
          .output({ format: outMime }) // yêu cầu MIME đầy đủ
          .blob();

        wmKey = withWatermarkKey(key);
        await r2.put(wmKey, out, {
          httpMetadata: { contentType: outMime, cacheControl: 'public, max-age=31536000, immutable' }
        });

      } catch (e) {
        // Nếu watermark lỗi, vẫn trả ảnh gốc để FE không gãy
        console.warn('[upload-image] watermark failed:', e);
      }
    }

    // 5) Build URL trả về
    if (!c.env.INTERNAL_R2_URL && !c.env.PUBLIC_R2_URL) {
      return c.json({ error: 'Thiếu biến môi trường INTERNAL_R2_URL hoặc PUBLIC_R2_URL' }, 500);
    }
    const storageBase = (c.env.INTERNAL_R2_URL || c.env.PUBLIC_R2_URL).replace(/\/+$/, '');
    const displayBase = (c.env.PUBLIC_R2_URL || storageBase).replace(/\/+$/, '');

    const finalKey = wmKey || key;
    const storageUrl = `${storageBase}/${finalKey}`;
    const displayUrl = `${displayBase}/${finalKey}`;

    return c.json({
      success: true,
      image_key: finalKey,           // key cuối cùng (ưu tiên -wm nếu có)
      original_key: key,             // key gốc (để debug/ghi DB nếu muốn)
      wm_applied: Boolean(wmKey),    // có chèn watermark không
      wm_key: wmKey || null,
      displayUrl,
      fileName: finalKey.split('/').pop(),
      alt: baseSlug,
      prefix,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return c.json({
      error: 'Có lỗi xảy ra khi upload ảnh',
      details: error?.message || String(error),
    }, 500);
  }
});

export default uploadImageRouter;