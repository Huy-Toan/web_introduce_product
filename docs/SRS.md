# AllXone Software Requirements Specification (SRS)

## 1. Giới thiệu
### 1.1 Mục đích
Tài liệu này mô tả yêu cầu chức năng và phi chức năng của dự án **AllXone** – mẫu ứng dụng
fullstack sử dụng React và Cloudflare Workers để xây dựng thư viện trực tuyến và các tiện ích
quản trị nội dung.

### 1.2 Phạm vi
Hệ thống bao gồm giao diện web cho người dùng và bảng điều khiển cho quản trị viên.
Dữ liệu được lưu trữ trong cơ sở dữ liệu Cloudflare D1 và tệp media trên Cloudflare R2.

### 1.3 Thuật ngữ
- **D1**: Cơ sở dữ liệu SQLite trên Cloudflare.
- **R2**: Dịch vụ lưu trữ đối tượng của Cloudflare.
- **Worker**: Cloudflare Worker xử lý yêu cầu HTTP.

### 1.4 Tài liệu tham khảo
- [Thiết kế hệ thống](SYSTEM_DESIGN.md)
- [README](../README.md)

## 2. Mô tả tổng quan
### 2.1 Bối cảnh sản phẩm
Ứng dụng hoạt động hoàn toàn trên hạ tầng Cloudflare, bao gồm Frontend React build bằng
Vite và API viết bằng Hono chạy trong Workers.

### 2.2 Lớp người dùng
- **Khách truy cập**: xem nội dung, gửi liên hệ.
- **Quản trị viên**: đăng nhập, quản lý nội dung và cấu hình hệ thống.

### 2.3 Môi trường vận hành
- Cloudflare Workers cho logic server.
- Cloudflare D1 cho cơ sở dữ liệu quan hệ.
- Cloudflare R2 cho lưu trữ hình ảnh.
- Được phát triển bằng Node.js và công cụ Vite.

### 2.4 Giới hạn và phụ thuộc
- Hệ thống phụ thuộc vào các dịch vụ của Cloudflare.
- Email dựa trên dịch vụ Resend.
- Phân tích lưu lượng dựa trên GA4.

## 3. Yêu cầu chức năng
### 3.1 Nội dung công khai
- Người dùng có thể xem bài viết **news** và **products** theo danh mục.
- Hỗ trợ đa ngôn ngữ thông qua hệ thống **translations**.
- Cung cấp sitemap, robots và metadata SEO.

### 3.2 Liên hệ
- Biểu mẫu liên hệ gửi email tới quản trị viên.
- Tin nhắn được lưu trong bảng `contact_messages`.

### 3.3 Xác thực và quản trị
- Quản trị viên đăng nhập qua endpoint `/auth` để nhận token.
- Quản trị viên có thể tạo, chỉnh sửa, xoá:
  - Bài viết, sản phẩm.
  - Danh mục cha và con.
  - Banner, đối tác (partners).
  - Bản dịch nội dung.
- Tải lên hình ảnh vào R2, tự động đóng watermark nếu cần.

### 3.4 Phân tích và thống kê
- Gửi sự kiện tới Google Analytics 4 thông qua endpoint `ga4`.
- Ghi lại dữ liệu truy cập cơ bản.

## 4. Yêu cầu phi chức năng
- **Bảo mật**: sử dụng token JWT; chỉ quản trị viên đã xác thực mới truy cập API quản trị.
- **Hiệu năng**: phản hồi dưới 200ms cho yêu cầu đọc thông thường.
- **Khả năng mở rộng**: tận dụng hạ tầng toàn cầu của Cloudflare để phục vụ người dùng.
- **Quốc tế hoá**: i18next hỗ trợ nhiều ngôn ngữ giao diện.
- **Khả năng triển khai**: cung cấp script deploy tự động qua GitHub và Wrangler.

## 5. Giao diện bên ngoài
- **HTTP API** chạy trên Cloudflare Workers theo framework Hono.
- **Email API**: Resend dùng để gửi email liên hệ.
- **WhatsApp**: tạo liên kết liên hệ với số điện thoại cấu hình.

## 6. Các yêu cầu tương lai
- Thêm trang quản trị UI hoàn chỉnh.
- Tích hợp thanh toán cho sản phẩm số.
- Bổ sung kiểm thử tự động và lint sạch hoàn toàn.

