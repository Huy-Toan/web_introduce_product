-- DROP các bảng nếu đã tồn tại
DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS news;
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

-- Tạo bảng news
CREATE TABLE news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(255),
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO news (title, content, image_url) VALUES
('Thư viện ra mắt giao diện mới', 'Chúng tôi vừa cập nhật lại giao diện website để mang lại trải nghiệm tốt hơn cho bạn đọc.', '/images/books/remains-of-the-day.jpg'),
('Sự kiện tháng 9: Tặng sách miễn phí', 'Trong tháng 9, bạn đọc đến thư viện sẽ có cơ hội nhận sách miễn phí khi đăng ký thành viên mới.', '/images/books/left-hand-of-darkness.jpg'),
('Cập nhật danh mục sách khoa học viễn tưởng', 'Bổ sung hơn 50 tựa sách mới thuộc thể loại Sci-Fi từ các tác giả nổi tiếng.', '/images/books/my-brilliant-friend.jpg');

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