-- Migration number: 0006 	 2025-08-14T08:59:23.518Z
-- migrations/001_init.sql
-- Bật foreign keys
PRAGMA foreign_keys = ON;

----------------------------------------------------
-- Bảng categories
----------------------------------------------------
CREATE TABLE categories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        VARCHAR(100) NOT NULL UNIQUE,
  slug        VARCHAR(150) UNIQUE,
  description TEXT,
  image_url   VARCHAR(255),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_categories_slug ON categories(slug);

----------------------------------------------------
-- Bảng products
----------------------------------------------------
CREATE TABLE products (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  title        VARCHAR(255) NOT NULL,
  slug         VARCHAR(255) NOT NULL UNIQUE,
  description  TEXT,
  content      TEXT NOT NULL,
  image_url    VARCHAR(255),
  category_id  INTEGER,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);

CREATE TRIGGER products_updated_at
AFTER UPDATE ON products
FOR EACH ROW
BEGIN
  UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_created_at ON products(created_at DESC);

----------------------------------------------------
-- Seed categories mẫu
----------------------------------------------------
INSERT INTO categories (name, slug, description, image_url) VALUES
('Trái cây tươi', 'trai-cay-tuoi', 'Các loại trái cây tươi ngon, an toàn.', '/promotion1.jpg'),
('Nông sản khô', 'nong-san-kho', 'Các sản phẩm nông sản khô chất lượng.', '/promotion2.jpg'),
('Đặc sản vùng miền', 'dac-san-vung-mien', 'Đặc sản nổi tiếng khắp các vùng miền Việt Nam.', '/promotion3.jpg');
