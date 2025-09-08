# Bản đồ chức năng và tệp mã

Tài liệu này mô tả ngắn gọn các chức năng chính của dự án và vị trí tệp mã hiện thực chúng. Danh sách được chia thành **Back‑end** (API/Workers) và **Front‑end** (ứng dụng React).

## Back-end (thư mục `api/`)
| Tệp | Chức năng chính |
| --- | --------------- |
| `api/index.js` | Khởi tạo ứng dụng Hono, cấu hình middleware (kiểm tra DB, CORS, bảo vệ admin), gắn toàn bộ router API và điểm health‑check. |
| `api/routes/auth.js` | Đăng nhập/đăng xuất admin, tạo JWT và quản lý session người dùng. |
| `api/routes/user.js` | CRUD người dùng, yêu cầu quyền `users.manage`. |
| `api/routes/banner.js` | Quản lý banner trang chủ: tạo, cập nhật, xoá, lấy danh sách. |
| `api/routes/about.js` | Lưu nội dung trang "Giới thiệu" theo nhiều ngôn ngữ. |
| `api/routes/news.js` | Quản lý bài viết tin tức với hỗ trợ slug và bản dịch đa ngôn ngữ. |
| `api/routes/field.js` | CRUD lĩnh vực/ dịch vụ của doanh nghiệp. |
| `api/routes/contact.js` | Nhận và lưu liên hệ từ form người dùng. |
| `api/routes/products.js` | CRUD sản phẩm, nhập xuất Excel, chuẩn hoá ảnh sản phẩm. |
| `api/routes/parent_categories.js` | Danh mục sản phẩm cấp 1 và bản dịch. |
| `api/routes/sub_categories.js` | Danh mục sản phẩm cấp 2, liên kết với parent category. |
| `api/routes/cer-partner.js` | Đối tác chứng nhận (certification partners). |
| `api/routes/upload-image.js` | Tải ảnh lên R2 Storage, trả về URL. |
| `api/routes/editor-upload.js` | Upload tệp từ trình soạn thảo (WYSIWYG). |
| `api/routes/translate.js` | Gọi API dịch tự động (Google Gemini) cho nội dung. |
| `api/routes/seo.js` | Quản lý meta SEO và API tạo nội dung (`/generate-content`, `/generate-seo`). |
| `api/routes/seo-sitemap.js` | Tạo sitemap động và trả về trang SEO root. |
| `api/routes/ga4.js` | Ghi sự kiện Google Analytics 4 từ phía server. |
| `api/routes/watermark.js` | Thêm watermark vào ảnh được gửi lên. |
| `api/routes/migrate_0012.js` | Các endpoint hỗ trợ migrate và cập nhật schema DB. |
| `api/admin/admin.js` | API riêng cho trang quản trị (dashboard, thống kê, chat...). |
| `api/auth/authMidleware.js` | Middleware xác thực JWT và kiểm tra quyền. |
| `api/utils/*` | Hàm tiện ích: băm mật khẩu, tạo slug, xử lý ảnh... |

Ngoài ra còn có các Worker độc lập trong thư mục `functions/`:
- `functions/robots.txt.ts` và `functions/sitemap.xml.ts`: phục vụ robots.txt và sitemap tĩnh.
- `functions/wa/webhook.js`: webhook xử lý tin nhắn WhatsApp.

## Front-end (thư mục `src/`)
| Tệp/Thư mục | Chức năng chính |
| ------------ | ---------------- |
| `src/main.jsx` | Gắn React vào DOM, cấu hình router. |
| `src/App.jsx` | Định nghĩa tuyến đường (routes) và layout chung. |
| `src/pages/Home.jsx` | Trang chủ: tải banner, danh mục sản phẩm, tin tức, lĩnh vực, đối tác và thiết lập SEO. |
| `src/pages/AboutUs.jsx` | Hiển thị nội dung "Giới thiệu" từ API. |
| `src/pages/News.jsx` & `src/pages/NewsDetail.jsx` | Danh sách và chi tiết bài viết tin tức. |
| `src/pages/Product.jsx` & `src/pages/ProductDetail.jsx` | Danh sách sản phẩm theo danh mục và trang chi tiết sản phẩm. |
| `src/pages/Field.jsx` | Giới thiệu các lĩnh vực dịch vụ. |
| `src/pages/Contact.jsx` | Form liên hệ gửi dữ liệu lên `/api/contacts`. |
| `src/pages/UserChat.jsx` | Hộp chat realtime giữa người dùng và admin. |
| `src/pages/admin/login.jsx` | Màn hình đăng nhập quản trị. |
| `src/pages/admin/AdminDashboard.jsx` | Dashboard quản trị: tổng quan dữ liệu, liên kết đến các module quản lý. |
| `src/pages/admin/AdminChat.jsx` | Giao diện chat cho admin tiếp nhận tin nhắn khách hàng. |
| `src/components/*` | Các thành phần dùng chung (navigation, banner, footer, card sản phẩm, widget WhatsApp, SEO meta...). |
| `src/context/*` | Context quản lý ngôn ngữ (`TContext`), trạng thái người dùng, v.v. |
| `src/hooks/*` | Custom hooks (ví dụ `useScrollTop`, hook chat...). |
| `src/lib/*` | Thư viện tiện ích như xử lý URL, SEO, dịch i18n. |
| `src/utils/*` | Hàm phụ trợ phía client (định dạng, lọc dữ liệu...). |
| `src/i18n.js` & `src/locales/` | Cấu hình đa ngôn ngữ i18next và file dịch. |

Tài liệu này giúp nhanh chóng định vị nơi hiện thực từng chức năng để phục vụ bảo trì và phát triển tiếp theo.

