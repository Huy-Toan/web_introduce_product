// api/upload-image.js
import { Hono } from 'hono';

// UUID v4 (không bắt buộc dùng nếu bạn thích tên SEO thuần)
function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
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
  'image/jpg':  'jpg',
  'image/png':  'png',
  'image/gif':  'gif',
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
      c.env.R2_PREFIX || ''; // nếu muốn cố định prefix qua env
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
      // thử tối đa 3 lần để thêm suffix khi đã tồn tại
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
    await r2.put(key, await file.arrayBuffer(), {
      httpMetadata: {
        contentType: file.type,
        cacheControl: 'public, max-age=31536000, immutable',
        contentDisposition: `inline; filename="${key.split('/').pop()}"`,
      },
    });

    if (!c.env.PUBLIC_R2_URL) {
      return c.json({ error: 'Thiếu PUBLIC_R2_URL trong cấu hình môi trường' }, 500);
    }
    const storageBase = c.env.PUBLIC_R2_URL.replace(/\/+$/, '');
    const displayBase = (c.env.DISPLAY_BASE_URL || storageBase).replace(/\/+$/, '');

    const storageUrl = `${storageBase}/${key}`;
    const displayUrl = `${displayBase}/${key}`;

    return c.json({
      success: true,
      image_key: key,     
      url: storageUrl,      
      displayUrl,       
      fileName: key.split('/').pop(),
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
