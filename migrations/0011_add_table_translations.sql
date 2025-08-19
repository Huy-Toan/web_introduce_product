-- migrations/0011_add_tablae_translations.sql
PRAGMA foreign_keys = ON;

----------------------------------------------------
-- PRODUCT TRANSLATIONS
----------------------------------------------------
CREATE TABLE IF NOT EXISTS product_translations (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id        INTEGER NOT NULL,
  locale            TEXT NOT NULL,            -- vi, en, ...
  title             TEXT NOT NULL,
  slug              TEXT NOT NULL,            -- slug theo từng locale
  short_description TEXT DEFAULT '',
  content           TEXT DEFAULT '',
  updated_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%f','now')),
  UNIQUE (product_id, locale),
  FOREIGN KEY (product_id) REFERENCES products(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_product_slug_locale
  ON product_translations(locale, slug);
CREATE INDEX IF NOT EXISTS idx_product_translations_product
  ON product_translations(product_id);

----------------------------------------------------
-- CATEGORY TRANSLATIONS
----------------------------------------------------
CREATE TABLE IF NOT EXISTS category_translations (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  locale      TEXT NOT NULL,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL,
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%f','now')),
  UNIQUE (category_id, locale),
  FOREIGN KEY (category_id) REFERENCES categories(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_category_slug_locale
  ON category_translations(locale, slug);
CREATE INDEX IF NOT EXISTS idx_category_translations_category
  ON category_translations(category_id);

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