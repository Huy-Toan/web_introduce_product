-- Migration number: 0012   2025-08-19T10:15:00.000Z
-- Create translations tables for parent_categories, subcategories, products

PRAGMA foreign_keys = ON;

------------------------------------------------------------
-- PARENT CATEGORIES TRANSLATIONS
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS parent_categories_translations (
  parent_id   INTEGER     NOT NULL,
  locale      VARCHAR(10) NOT NULL,       -- 'vi', 'en', 'ja', ...
  name        TEXT,                       -- tên danh mục lớn (dịch)
  description TEXT,                       -- mô tả (dịch)
  created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (parent_id, locale),
  FOREIGN KEY (parent_id)
    REFERENCES parent_categories(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_parent_categories_tr_parent
  ON parent_categories_translations(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_categories_tr_locale
  ON parent_categories_translations(locale);

------------------------------------------------------------
-- SUBCATEGORIES TRANSLATIONS
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subcategories_translations (
  sub_id      INTEGER     NOT NULL,
  locale      VARCHAR(10) NOT NULL,
  name        TEXT,                       -- tên danh mục nhỏ (dịch)
  description TEXT,                       -- mô tả (dịch)
  created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (sub_id, locale),
  FOREIGN KEY (sub_id)
    REFERENCES subcategories(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subcategories_tr_sub
  ON subcategories_translations(sub_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_tr_locale
  ON subcategories_translations(locale);

------------------------------------------------------------
-- PRODUCTS TRANSLATIONS
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products_translations (
  product_id  INTEGER     NOT NULL,
  locale      VARCHAR(10) NOT NULL,
  title       TEXT,                       -- tiêu đề SP (dịch)
  description TEXT,                       -- mô tả ngắn (dịch)
  content     TEXT,                       -- nội dung chi tiết (dịch, Markdown/HTML tuỳ bạn)
  created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (product_id, locale),
  FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_tr_product
  ON products_translations(product_id);
CREATE INDEX IF NOT EXISTS idx_products_tr_locale
  ON products_translations(locale);

----------------------------------------------------
-- NEWS TRANSLATIONS
----------------------------------------------------
CREATE TABLE IF NOT EXISTS news_translations (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  news_id          INTEGER NOT NULL,
  locale           TEXT NOT NULL,
  title            TEXT NOT NULL,
  slug             TEXT NOT NULL,
  content          TEXT NOT NULL,
  meta_description TEXT,
  keywords         TEXT,
  updated_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%f','now')),
  UNIQUE (news_id, locale),
  FOREIGN KEY (news_id) REFERENCES news(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_news_slug_locale
  ON news_translations(locale, slug);
CREATE INDEX IF NOT EXISTS idx_news_translations_news
  ON news_translations(news_id);

----------------------------------------------------
-- ABOUT_US TRANSLATIONS
----------------------------------------------------
CREATE TABLE IF NOT EXISTS about_us_translations (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  about_id   INTEGER NOT NULL,
  locale     TEXT NOT NULL,
  title      TEXT NOT NULL,
  content    TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%f','now')),
  UNIQUE (about_id, locale),
  FOREIGN KEY (about_id) REFERENCES about_us(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_about_us_translations_about
  ON about_us_translations(about_id);

----------------------------------------------------
-- BANNERS TRANSLATIONS
CREATE TABLE IF NOT EXISTS banners_translations (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  banner_id  INTEGER NOT NULL,
  locale     TEXT NOT NULL, -- ví dụ: 'vi', 'en', 'ja'
  content    TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(banner_id, locale),
  FOREIGN KEY (banner_id) REFERENCES banners(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_banners_translations_banner
  ON banners_translations(banner_id);

----------------------------------------------------
CREATE TABLE IF NOT EXISTS fields_translations (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  field_id  INTEGER NOT NULL,
  locale    TEXT NOT NULL,
  name      TEXT NOT NULL,
  content   TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(field_id, locale),
  FOREIGN KEY (field_id) REFERENCES fields(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_fields_translations_field
  ON fields_translations(field_id);
----------------------------------------------------

CREATE TABLE IF NOT EXISTS certifications_partners_translations (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  cp_id         INTEGER NOT NULL,
  locale        TEXT NOT NULL,
  name          TEXT NOT NULL,
  content       TEXT NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(cp_id, locale),
  FOREIGN KEY (cp_id) REFERENCES certifications_partners(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_certifications_partners_translations_cp
  ON certifications_partners_translations(cp_id);