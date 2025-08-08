// import { Hono } from 'hono';

// function uuidv4() {
//   return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
//     (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
//   );
// }

// const uploadNewsImageRouter = new Hono();

// uploadNewsImageRouter.post('/', async (c) => {
//   try {
//     const formData = await c.req.formData();
//     const file = formData.get('image');

//     if (!file || typeof file === 'string') {
//       return c.json({ error: 'Không có file nào được upload' }, 400);
//     }

//     const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
//     if (!allowedTypes.includes(file.type)) {
//       return c.json({ error: 'Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP)' }, 400);
//     }

//     if (file.size > 5 * 1024 * 1024) {
//       return c.json({ error: 'Kích thước ảnh không được vượt quá 5MB!' }, 400);
//     }

//     const ext = file.name.split('.').pop();
//     const fileName = `news/${uuidv4()}.${ext}`;

//     const r2 = c.env.IMAGES;
//     await r2.put(fileName, await file.arrayBuffer(), {
//       httpMetadata: { contentType: file.type },
//     });

//     if (!c.env.PUBLIC_R2_URL) {
//       return c.json({ error: 'Thiếu PUBLIC_R2_URL trong cấu hình môi trường' }, 500);
//     }

//     const baseUrl = c.env.PUBLIC_R2_URL.replace(/\/+$/, '');
//     const publicUrl = `${baseUrl}/${fileName}`;

//     return c.json({
//       success: true,
//       url: publicUrl,
//       fileName,
//     });
//   } catch (error) {
//     console.error('Upload error:', error);
//     return c.json({ error: 'Lỗi khi upload ảnh', details: error.message }, 500);
//   }
// });

// export default uploadNewsImageRouter;
