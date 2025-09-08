# Tài liệu API Backend

Tổng hợp các endpoint phục vụ ứng dụng. Các router được gắn trong [`api/index.js`](../api/index.js) và triển khai bằng [Hono](https://hono.dev/).

Cấu hình runtime và các binding (D1, R2, AI, biến môi trường...) được khai báo trong [`wrangler.toml`](../wrangler.toml).

## Xác thực & người dùng
- `POST /api/auth/login` – đăng nhập, trả JWT
- `POST /api/auth/logout` – đăng xuất
- `GET /api/users` – danh sách người dùng
- `POST /api/users` – tạo người dùng mới
- `PUT /api/users/:id` – cập nhật
- `DELETE /api/users/:id` – xoá
- **Mã nguồn**: [`api/routes/auth.js`](../api/routes/auth.js), [`api/routes/user.js`](../api/routes/user.js)
- **Cấu hình liên quan**:
  - `JWT_SECRET`, `JWT_EXPIRES_IN` trong `wrangler.toml`
  - Binding `DB` cho D1 database

## Tin tức & nội dung
- `GET /api/news` – liệt kê bài viết
- `POST /api/news` – tạo bài mới
- `PUT /api/news/:id` – cập nhật
- `DELETE /api/news/:id` – xoá
- `GET /api/about` – lấy nội dung trang "Giới thiệu"
- `PUT /api/about` – cập nhật nội dung
- **Mã nguồn**: [`api/routes/news.js`](../api/routes/news.js), [`api/routes/about.js`](../api/routes/about.js)
- **Cấu hình**: binding `DB`

## Danh mục sản phẩm & sản phẩm
- `GET /api/parent_categories` – danh mục cấp 1
- `GET /api/sub_categories` – danh mục cấp 2
- `GET /api/products` – liệt kê sản phẩm
- `POST /api/products` – tạo sản phẩm
- `PUT /api/products/:id` – cập nhật
- `DELETE /api/products/:id` – xoá
- **Mã nguồn**: [`api/routes/parent_categories.js`](../api/routes/parent_categories.js), [`api/routes/sub_categories.js`](../api/routes/sub_categories.js), [`api/routes/products.js`](../api/routes/products.js)
- **Cấu hình**: binding `DB`

## Liên hệ & banner
- `POST /api/contacts` – lưu form liên hệ
- `GET /api/banner` – lấy banner
- `POST /api/banner` – cập nhật/đăng banner
- **Mã nguồn**: [`api/routes/contact.js`](../api/routes/contact.js), [`api/routes/banner.js`](../api/routes/banner.js)
- **Cấu hình**:
  - Binding `DB`
  - Biến môi trường email `RESEND_API_KEY`, `FROM_EMAIL`, `CONTACT_TO`

## SEO & phân tích nội dung
- `POST /api/seo/generate-content` – tạo bài viết từ keyword
- `POST /api/seo/generate-seo` – phân tích nội dung và đề xuất SEO
- **Mã nguồn**: [`api/routes/seo.js`](../api/routes/seo.js)
- **Cấu hình**:
  - Binding `AI` để gọi mô hình Cloudflare AI
  - Hàm tiện ích [`src/utils/textClean.js`](../src/utils/textClean.js)

## Tải tệp & xử lý ảnh
- `POST /api/upload-image` – tải ảnh lên R2, trả URL
- `POST /api/editor-upload` – upload từ trình soạn thảo
- `POST /api/watermark` – thêm watermark khi tải ảnh
- **Mã nguồn**: [`api/routes/upload-image.js`](../api/routes/upload-image.js), [`api/routes/editor-upload.js`](../api/routes/editor-upload.js), [`api/routes/watermark.js`](../api/routes/watermark.js)
- **Cấu hình**: binding `IMAGES` (R2 bucket)

## Dịch thuật & GA4
- `POST /api/translate` – dịch nội dung qua Google Gemini
- `POST /api/ga4/event` – gửi sự kiện GA4
- **Mã nguồn**: [`api/routes/translate.js`](../api/routes/translate.js), [`api/routes/ga4.js`](../api/routes/ga4.js)
- **Cấu hình**:
  - `GA4_PROPERTY_ID` trong `wrangler.toml`
  - Binding `AI` cho API dịch

## Sitemap & robots
- `GET /sitemap.xml` – tạo sitemap động
- `GET /robots.txt` – phục vụ robots.txt tĩnh
- **Mã nguồn**: [`api/routes/seo-sitemap.js`](../api/routes/seo-sitemap.js), [`functions/robots.txt.ts`](../functions/robots.txt.ts), [`functions/sitemap.xml.ts`](../functions/sitemap.xml.ts)
- **Cấu hình**: none ngoài binding `DB` cho sitemap động

Tất cả endpoint sử dụng middleware và cấu hình chung trong `api/index.js` (kiểm tra kết nối DB, CORS, bảo vệ bằng JWT...).

