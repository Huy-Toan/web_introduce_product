// routes/editor-upload.js (Hono)
import { Hono } from 'hono';

function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

const editorUploadRouter = new Hono();

editorUploadRouter.post('/', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('editormd-image-file'); 

    if (!file || typeof file === 'string') {
      return c.json({ success: 0, message: 'Không có file nào được upload' }, 400);
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ success: 0, message: 'Chỉ chấp nhận JPEG, PNG, GIF, WebP' }, 400);
    }

    if (file.size > 5 * 1024 * 1024) {
      return c.json({ success: 0, message: 'Ảnh vượt quá 5MB!' }, 400);
    }

    // Tạo tên file unique
    const ext = file.name.split('.').pop();
    const fileName = `books/${uuidv4()}.${ext}`;

    // Upload lên R2
    const r2 = c.env.IMAGES;
    await r2.put(fileName, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type },
    });

    const baseUrl = c.env.PUBLIC_R2_URL.replace(/\/+$/, '');
    const publicUrl = `${baseUrl}/${fileName}`;

    // ✅ Format Editor.md cần
    return c.json({
      success: 1,
      message: 'OK',
      url: publicUrl,
      fileName, // giữ lại cho bạn dùng khi cần
    });
  } catch (error) {
    console.error('Upload error:', error);
    return c.json({ success: 0, message: error.message }, 500);
  }
});

export default editorUploadRouter;
