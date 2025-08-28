-- Migration number: 0004        2025-08-13T09:07:06.341Z
-- Ensure users table exists before inserting default accounts
CREATE TABLE IF NOT EXISTS users (
                                     id INTEGER PRIMARY KEY AUTOINCREMENT,
                                     name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
INSERT INTO users (name, email, password, role) VALUES
-- Toàn quyền hệ thống
('Nguyễn Super Admin', 'superadmin@example.com', 'Temp@12345', 'superadmin'),

-- Quản trị tổng (quản lý cấu hình chung, phê duyệt cao nhất)
('Trần Quản Trị', 'admin@example.com', 'Temp@12345', 'admin'),

-- Quản lý nội dung: bài viết, danh mục, media
('Lê Content Manager', 'content.admin@example.com', 'Temp@12345', 'content_manager'),

-- Quản lý người dùng: tạo/sửa/xoá user, reset mật khẩu
('Phạm User Manager', 'user.admin@example.com', 'Temp@12345', 'user_manager'),

-- Duyệt bình luận, xử lý báo cáo vi phạm
('Đỗ Moderator', 'moderator@example.com', 'Temp@12345', 'moderator'),

-- Soạn thảo & xuất bản nội dung trong phạm vi được cấp
('Vũ Biên Tập', 'editor@example.com', 'Temp@12345', 'editor'),

-- Hỗ trợ khách hàng: chỉ xem user & tạo ticket, không có quyền xoá
('Hoàng Hỗ Trợ', 'support@example.com', 'Temp@12345', 'support'),

-- Xem và thao tác nghiệp vụ thanh toán/đơn hàng
('Bùi Tài Chính', 'finance@example.com', 'Temp@12345', 'finance'),

-- Chỉ đọc để audit/log, không được chỉnh sửa
('Mai Kiểm Toán', 'auditor@example.com', 'Temp@12345', 'auditor'),

-- Người dùng thường
('Ngô Người Dùng', 'user@example.com', 'Temp@12345', 'user');