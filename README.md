# AllXone

Ứng dụng web toàn stack được xây dựng bằng React, Cloudflare Workers, D1 SQLite và R2
lưu trữ. Dự án giúp bạn triển khai một thư viện trực tuyến nhỏ với khả năng quản lý nội dung,
lưu trữ hình ảnh và các tiện ích mở rộng khác.

## Tổng quan dự án

- **Công nghệ chính**: React, Vite, Cloudflare Workers, D1, R2, TailwindCSS
- **Mục đích**: cung cấp mẫu dự án để triển khai nhanh một ứng dụng fullstack trên hạ tầng Cloudflare
- **Cấu trúc thư mục**:
  - `src/` – mã nguồn phía client và server
  - `functions/` – các Cloudflare Worker functions
  - `migrations/` – các tệp migration cho D1
  - `public/` – tài nguyên tĩnh

## Chạy và phát triển local

```bash
npm install         # cài đặt phụ thuộc
npm run dev         # chạy môi trường phát triển
npm run lint        # kiểm tra lint trước khi commit
```

## Biến môi trường

Tạo file `.env` và thiết lập các biến sau:

| Tên biến | Mô tả |
| --- | --- |
| `VITE_WA_PHONE` | Số điện thoại dùng cho liên hệ qua WhatsApp |
| `VITE_WA_BASEMSG` | Tin nhắn mặc định khi mở WhatsApp |
| `VITE_WA_UTM` | Chuỗi UTM đính kèm khi gửi tin |
| `VITE_API_BASE_URL` | URL API backend |
| `RESEND_API_KEY` | API key của dịch vụ Resend |
| `FROM_EMAIL` | Địa chỉ email gửi đi |
| `CONTACT_TO` | Địa chỉ email nhận liên hệ |
| `BRAND_NAME` | Tên thương hiệu hiển thị trong email |
| `VITE_GA4_ID` | Mã đo lường Google Analytics 4 |
| `VITE_GA_ALLOWED_HOSTS` | Danh sách host được phép gửi dữ liệu GA4 |

Khi triển khai lên Cloudflare, cần thêm các secrets như `CLOUDFLARE_ACCOUNT_ID`,
`R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` và `PUBLIC_R2_URL` trong phần
Environment Variables của Pages.

## Tài liệu

- [Tài liệu yêu cầu (SRS)](docs/SRS.md)
- [Thiết kế hệ thống](docs/SYSTEM_DESIGN.md)
- [Bản đồ chức năng & tệp mã](docs/FEATURE_MAP.md)

## Hướng dẫn Deploy dự án lên Cloudflare thông qua GitHub

### Yêu cầu trước khi bắt đầu

- Tài khoản GitHub
- Tài khoản Cloudflare (miễn phí)
- Node.js đã cài đặt trên máy
- Git đã cài đặt

## Bước 1: Fork và Clone dự án

```bash
# Fork dự án trên GitHub UI, sau đó clone về máy

# Cài đặt dependencies
npm install
```

## Bước 2: Cài đặt Wrangler CLI

```bash
# Cài đặt Wrangler globally
npm install -g wrangler

# Đăng nhập Cloudflare
wrangler login
```

## Bước 3: Tạo D1 Database

```bash
# Tạo database mới
wrangler d1 create react-fullstack-db
```

**Quan trọng**: Lệnh trên sẽ trả về `database_id`, copy ID này!

Ví dụ output:
```
✅ Successfully created DB 'react-fullstack-db'!
📋 Created your database using D1's new storage backend.
   Database ID: a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

## Bước 4: Tạo R2 Bucket

```bash
# Tạo R2 bucket cho việc lưu trữ images
wrangler r2 bucket create react-fullstack-images
```

## Bước 5: Cập nhật cấu hình

Mở file `wrangler.toml` và thay đổi `database_id`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "react-fullstack-db"
database_id = "PASTE_YOUR_NEW_DATABASE_ID_HERE"  # ← Thay đổi dòng này
```

## Bước 6: Setup Database Schema

```bash
# Nếu dự án có file init.sql
wrangler d1 execute react-fullstack-db --file=./init.sql

# Nếu dùng migrations
wrangler d1 migrations apply react-fullstack-db
```

## Bước 7: Test Local (Optional)

```bash
# Chạy development server để test
wrangler dev

# Hoặc
npm run dev
```

## Bước 8: Commit thay đổi

```bash
git add wrangler.toml
git commit -m "Update database ID for deployment"
git push origin main
```

## Bước 9: Deploy qua Cloudflare Pages

### Cách 1: Sử dụng Cloudflare Dashboard

1. Đăng nhập [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Vào **Workers & Pages** > **Create application** > **Workers** > **Import a repository**
3. Click **Connect to Git**
4. Chọn GitHub repository của bạn
5. Configure build settings:
   - **Build command**: `npx wrangler deploy` (hoặc theo package.json)
   - **Build output directory**: `dist` hoặc bỏ trống
6. Click **Save and Deploy**

### Cách 2: Sử dụng GitHub Actions (Tự động)

Tạo file `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build project
        run: npm run build
      
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: your-project-name
          directory: dist
          # Optional: github token
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

## Bước 10: Cấu hình Bindings

Sau khi deploy thành công, cần bind database và R2 bucket:

1. Vào **Cloudflare Dashboard** > **Workers & Pages**
2. Click vào project vừa tạo
3. Vào **Settings** > **Functions** > **Bindings**
4. Add các bindings sau:

**D1 Database Binding:**
- Variable name: `DB`
- D1 database: `react-fullstack-db`

**R2 Bucket Binding:**
- Variable name: `IMAGES` 
- R2 bucket: `react-fullstack-images`

5. Click **Save**

## Bước 11: Cấu hình Environment Variables và Secrets

Vào **Settings** > **Environment Variables** > **Add Variable**:

### Secrets cần thêm:

1. **CLOUDFLARE_ACCOUNT_ID**
   - Type: Secret
   - Value: Account ID từ Cloudflare Dashboard (sidebar bên phải)

2. **PUBLIC_R2_URL**
   - Type: Secret  
   - Value: URL public của R2 bucket (format: `https://pub-xxxxx.r2.dev`)

3. **R2_ACCESS_KEY_ID** 
   - Type: Secret
   - Value: Lấy từ **R2** > **Manage R2 API tokens** > **Create API token**

4. **R2_BUCKET_NAME**
   - Type: Secret
   - Value: `react-fullstack-images`

5. **R2_SECRET_ACCESS_KEY**
   - Type: Secret
   - Value: Secret key đi cùng với R2_ACCESS_KEY_ID

### Cách lấy R2 API credentials:

1. Vào **Cloudflare Dashboard** > **R2 Object Storage**
2. Click **Manage R2 API tokens**
3. **Create API token** với permissions:
   - **Object Read & Write**
   - **Bucket:** `react-fullstack-images`
4. Copy Access Key ID và Secret Access Key

### Cách lấy PUBLIC_R2_URL:

1. Vào **R2** > **react-fullstack-images**
2. **Settings** > **Public access**
3. **Connect Custom Domain** hoặc dùng R2.dev subdomain
4. Copy URL (ví dụ: `https://pub-abc123.r2.dev`)

## Bước 12: Setup Database trên Production

```bash
# Chạy migrations trên production database
wrangler d1 migrations apply react-fullstack-db --remote

# Hoặc execute SQL trực tiếp
wrangler d1 execute react-fullstack-db --remote --file=./init.sql
```

## Bước 13: Redeploy để áp dụng bindings và secrets

Trigger một deployment mới:
- Push một commit nhỏ lên GitHub
- Hoặc click **Retry deployment** trong Cloudflare Dashboard

## Troubleshooting

### Lỗi "Database not found"
- Kiểm tra `database_id` trong `wrangler.toml` có đúng không
- Đảm bảo đã bind database trong Pages settings

### Lỗi "R2 bucket not accessible"
- Kiểm tra đã bind R2 bucket chưa
- Verify bucket name đúng trong `wrangler.toml`

### Build failed
- Kiểm tra Node.js version (khuyến nghị >= 18)
- Verify build command trong Pages settings
- Check dependencies trong `package.json`

## Các lệnh hữu ích

```bash
# Xem danh sách databases
wrangler d1 list

# Xem danh sách R2 buckets
wrangler r2 bucket list

# Query database
wrangler d1 execute react-fullstack-db --remote --command="SELECT * FROM users LIMIT 5"

# Xem logs của worker
wrangler tail

# Upload file lên R2
wrangler r2 object put react-fullstack-images/filename.jpg --file=./path/to/file.jpg
```

## Lưu ý quan trọng

- **Database ID** phải unique cho mỗi người
- Mỗi người cần tạo database và bucket riêng
- Không share database_id giữa các môi trường
- Luôn test local trước khi deploy
- Backup database trước khi thay đổi cấu trúc

## Kết quả

Sau khi hoàn thành, bạn sẽ có:
- ✅ Dự án được deploy tự động qua GitHub
- ✅ Database riêng với schema đầy đủ  
- ✅ R2 bucket để lưu trữ files
- ✅ Domain Cloudflare để truy cập ứng dụng

**Chúc mừng! Dự án của bạn đã sẵn sàng trên Cloudflare! 🚀**
