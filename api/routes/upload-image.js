// api/upload-image.js (Next.js API route)
// hoặc routes/upload.js (Express.js)

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Cấu hình R2 Cloudflare
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// Cấu hình multer để xử lý file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP)'));
    }
  },
});

// Middleware để xử lý file upload
const uploadMiddleware = upload.single('image');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Xử lý file upload
    await new Promise((resolve, reject) => {
      uploadMiddleware(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    if (!req.file) {
      return res.status(400).json({ error: 'Không có file nào được upload' });
    }

    // Tạo tên file unique
    const fileExtension = path.extname(req.file.originalname);
    const fileName = `books/${uuidv4()}${fileExtension}`;

    // Upload lên R2 Cloudflare
    const uploadParams = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      // Cấu hình để file có thể truy cập public
      ACL: 'public-read',
    };

    await r2Client.send(new PutObjectCommand(uploadParams));

    // Tạo URL public cho file
    const publicUrl = `https://${process.env.R2_CUSTOM_DOMAIN}/${fileName}`;
    // Hoặc nếu chưa có custom domain:
    // const publicUrl = `https://${process.env.R2_BUCKET_NAME}.${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com/${fileName}`;

    res.status(200).json({
      success: true,
      url: publicUrl,
      fileName: fileName,
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Có lỗi xảy ra khi upload ảnh',
      details: error.message 
    });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};