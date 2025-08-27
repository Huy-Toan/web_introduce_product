-- DROP các bảng nếu đã tồn tại
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS about_us;


-- Tạo bảng users
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Tạo bảng about_us
CREATE TABLE about_us (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO about_us (title, content, image_url) VALUES
('Về chúng tôi', 'Thư viện được thành lập với sứ mệnh lan tỏa tri thức và tình yêu sách đến mọi người.', '/images/books/brothers-karamazov.jpg'),
('Sứ mệnh của chúng tôi', 'Chúng tôi cung cấp môi trường đọc sách hiện đại, phong phú, hỗ trợ học tập và nghiên cứu hiệu quả.', '/images/books/east-of-eden.jpg');