-- Migration number: 0011   2025-08-19T10:00:00.000Z

-- Xoá bảng cũ
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;

-- Danh mục lớn
CREATE TABLE IF NOT EXISTS parent_categories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        VARCHAR(100) NOT NULL UNIQUE,
  slug        VARCHAR(150) NOT NULL UNIQUE,
  description TEXT,
  image_url   VARCHAR(255),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Danh mục nhỏ (thuộc về 1 danh mục lớn)
CREATE TABLE IF NOT EXISTS subcategories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  parent_id   INTEGER NOT NULL,
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(150) NOT NULL,
  description TEXT,
  image_url   VARCHAR(255),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES parent_categories(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  UNIQUE (parent_id, name),
  UNIQUE (parent_id, slug)
);

-- Sản phẩm gắn với danh mục nhỏ
CREATE TABLE IF NOT EXISTS products (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  title          VARCHAR(255) NOT NULL,
  slug           VARCHAR(255) NOT NULL UNIQUE,
  description    TEXT,
  content        TEXT NOT NULL,
  image_url      VARCHAR(255),
  subcategory_id INTEGER,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subcategory_id) REFERENCES subcategories(id)
    ON UPDATE CASCADE ON DELETE SET NULL
);

-- Index hữu ích
CREATE INDEX IF NOT EXISTS idx_subcategories_parent ON subcategories(parent_id);
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subcategory_id);
