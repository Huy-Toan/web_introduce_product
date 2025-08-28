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
('Nguyễn Super Admin', 'superadmin@example.com', '4eb1327d-d607-4018-af48-fe05d7798cac$78df21627204ce4f6af074f01bbbe813817612b9e1cf0299645fe094276b858f', 'superadmin'),

-- Quản trị tổng (quản lý cấu hình chung, phê duyệt cao nhất)
('Trần Quản Trị', 'admin@example.com','f28aff65-53bb-4d2d-b1bf-e065f6c7176d$695b3e72d6802a2101fd81d2ac6f47518087ec6a58faf0e187e479f035eb2586' , 'admin'),

-- Quản lý nội dung: bài viết, danh mục, media
('Lê Content Manager', 'content.admin@example.com', 'e0c943fe-74e4-4c1a-b8df-8ed26f5b0407$284986c8a337a66c0ae7bcad3222c4c2417ee45b1e1c8d7fd1361b8cd4e17b20', 'content_manager'),

-- Quản lý người dùng: tạo/sửa/xoá user, reset mật khẩu
('Phạm User Manager', 'user.admin@example.com', '364e073e-0250-4cd3-b0a7-a4cce211bdb4$42b69e9829b942dc4c7a199dcea03238d4b476edf2ccbd7bbf2b2284ba6bf313', 'user_manager'),


-- Người dùng thường
('Ngô Người Dùng', 'user@example.com', '011a0f1d-42ff-40f2-a8d5-ac421505dc3a$1e1260b740fd07b83705a088a5cb9cab71b0bb4affe6d72ca61cfabd56991557', 'user');