// api/upload-image.js
import { Hono } from 'hono';

// UUID v4
function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

// slug tiếng Việt -> không dấu, chữ thường, - thay khoảng trắng
function toSlug(s = '', maxLen = 80) {
  return String(s)
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // bỏ dấu
    .replace(/[^a-z0-9\s-_.]/g, '')                  // bỏ ký tự lạ
    .replace(/\s+/g, '-')                            // space -> -
    .replace(/-+/g, '-')                             // gộp --
    .replace(/^[-.]+|[-.]+$/g, '')                   // bỏ -/. ở đầu/cuối
    .slice(0, maxLen)
    .replace(/[-.]+$/g, '');                         // tránh kết thúc bằng - hoặc .
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
    const rawSeoName =
      formData.get('seoName') ||
      urlObj.searchParams.get('seoName') ||
      (file.name ? file.name.replace(/\.[^.]+$/, '') : 'image');

    const baseSlug = toSlug(rawSeoName) || 'image';

    const extFromName = (file.name && file.name.includes('.')) ? file.name.split('.').pop() : '';
    const ext = (extFromName || EXT_BY_MIME[file.type] || 'jpg').toLowerCase();

    const addId = String(c.env.ADD_RANDOM_ID || '').toLowerCase() === 'true';
    const shortId = Math.random().toString(36).slice(2, 8);
    const fileName = addId ? `${baseSlug}-${shortId}.${ext}` : `${baseSlug}.${ext}`;

    const r2 = c.env.IMAGES;
    await r2.put(fileName, await file.arrayBuffer(), {
      httpMetadata: {
        contentType: file.type,
        cacheControl: 'public, max-age=31536000, immutable',
        contentDisposition: `inline; filename="${fileName}"`,
      },
    });

    if (!c.env.PUBLIC_R2_URL) {
      return c.json({ error: 'Thiếu PUBLIC_R2_URL trong cấu hình môi trường' }, 500);
    }
    const baseUrl = c.env.PUBLIC_R2_URL.replace(/\/+$/, '');
    const publicUrl = `${baseUrl}/${fileName}`;

    return c.json({
      success: true,
      url: publicUrl,
      fileName,        
      alt: baseSlug,
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
