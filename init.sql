-- DROP các bảng nếu đã tồn tại
DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS news;
DROP TABLE IF EXISTS about_us;

-- Tạo bảng books
CREATE TABLE books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    genre VARCHAR(50) DEFAULT 'Unknown',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert dữ liệu mẫu cho bảng books
INSERT INTO books (title, author, description, image_url, genre) VALUES
('The Brothers Karamazov', 'Fyodor Dostoevsky', 'A passionate philosophical novel set in 19th-century Russia, which explores ethical debates of God, free will, and morality.', '/images/books/brothers-karamazov.jpg', 'Literary Fiction'),
('East of Eden', 'John Steinbeck', 'A multigenerational family saga set in the Salinas Valley, California, exploring themes of good and evil through the intertwined stories of two families.', '/images/books/east-of-eden.jpg', 'Literary Fiction'),
('The Fifth Season', 'N.K. Jemisin', 'Set in a world where catastrophic climate change occurs regularly, this novel follows a woman searching for her daughter while navigating a society divided by powers.', '/images/books/fifth-season.jpg', 'Science Fiction & Fantasy'),
('Jane Eyre', 'Charlotte Brontë', 'A novel about a strong-willed orphan who becomes a governess, falls in love with her employer, and discovers his dark secret.', '/images/books/jane-eyre.jpg', 'Literary Fiction'),
('Anna Karenina', 'Leo Tolstoy', 'A complex novel of family life among the Russian aristocracy, focusing on an adulterous affair between Anna Karenina and Count Vronsky.', '/images/books/anna-karenina.jpg', 'Literary Fiction'),
('Giovanni''s Room', 'James Baldwin', 'A groundbreaking novel that follows an American man living in Paris as he grapples with his sexual identity and relationships.', '/images/books/giovannis-room.jpg', 'Historical Fiction'),
('My Brilliant Friend', 'Elena Ferrante', 'The first novel in the Neapolitan quartet that traces the friendship between Elena and Lila, from their childhood in a poor Naples neighborhood through their diverging paths in life.', '/images/books/my-brilliant-friend.jpg', 'Literary Fiction'),
('The Remains of the Day', 'Kazuo Ishiguro', 'The story of an English butler reflecting on his life of service and missed opportunities as he takes a road trip through the countryside.', '/images/books/remains-of-the-day.jpg', 'Historical Fiction'),
('The Left Hand of Darkness', 'Ursula K. Le Guin', 'A science fiction novel that follows an envoy sent to convince the ambisexual people of the planet Gethen to join an interplanetary collective.', '/images/books/left-hand-of-darkness.jpg', 'Science Fiction & Fantasy');

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