PRAGMA foreign_keys = ON;
-- Xoá bảng translation cũ nếu tồn tại
DROP TABLE IF EXISTS parent_categories_translations;
DROP TABLE IF EXISTS subcategories_translations;
DROP TABLE IF EXISTS products_translations;

------------------------------------------------------------
-- PARENT CATEGORIES TRANSLATIONS
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS parent_categories_translations (
  parent_id   INTEGER     NOT NULL,
  locale      VARCHAR(10) NOT NULL,       -- 'vi', 'en', 'ja', ...
  name        TEXT,                       -- tên danh mục lớn (dịch)
  slug        VARCHAR(150) NOT NULL,      -- slug dịch
  description TEXT,                       -- mô tả (dịch)
  created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (parent_id, locale),
  FOREIGN KEY (parent_id)
    REFERENCES parent_categories(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  UNIQUE (parent_id, locale, slug)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_parent_categories_tr_parent
  ON parent_categories_translations(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_categories_tr_locale
  ON parent_categories_translations(locale);
CREATE INDEX IF NOT EXISTS idx_parent_categories_tr_slug
  ON parent_categories_translations(slug);

------------------------------------------------------------
-- SUBCATEGORIES TRANSLATIONS
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subcategories_translations (
  sub_id      INTEGER     NOT NULL,
  locale      VARCHAR(10) NOT NULL,
  name        TEXT,                       -- tên danh mục nhỏ (dịch)
  slug        VARCHAR(150) NOT NULL,      -- slug dịch
  description TEXT,                       -- mô tả (dịch)
  created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (sub_id, locale),
  FOREIGN KEY (sub_id)
    REFERENCES subcategories(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  UNIQUE (sub_id, locale, slug)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subcategories_tr_sub
  ON subcategories_translations(sub_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_tr_locale
  ON subcategories_translations(locale);
CREATE INDEX IF NOT EXISTS idx_subcategories_tr_slug
  ON subcategories_translations(slug);

------------------------------------------------------------
-- PRODUCTS TRANSLATIONS
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products_translations (
  product_id  INTEGER     NOT NULL,
  locale      VARCHAR(10) NOT NULL,
  title       TEXT,                       -- tiêu đề SP (dịch)
  slug        VARCHAR(255) NOT NULL,      -- slug dịch
  description TEXT,                       -- mô tả ngắn (dịch)
  content     TEXT,                       -- nội dung chi tiết (dịch, Markdown/HTML tuỳ bạn)
  created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (product_id, locale),
  FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  UNIQUE (product_id, locale, slug)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_tr_product
  ON products_translations(product_id);
CREATE INDEX IF NOT EXISTS idx_products_tr_locale
  ON products_translations(locale);
CREATE INDEX IF NOT EXISTS idx_products_tr_slug
  ON products_translations(slug);
