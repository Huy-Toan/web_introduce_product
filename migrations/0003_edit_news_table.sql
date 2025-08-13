-- Migration number: 0002 	 2025-08-12T15:51:59.292Z
DROP TABLE IF EXISTS news;

CREATE TABLE news (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    title           TEXT NOT NULL,
    slug            TEXT NOT NULL UNIQUE,
    content         TEXT NOT NULL,
    meta_description TEXT,
    keywords        TEXT,
    image_url       TEXT,
    published_at    TIMESTAMP,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER news_updated_at
AFTER UPDATE ON news
FOR EACH ROW
BEGIN
    UPDATE news SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE INDEX idx_news_slug ON news(slug);
CREATE INDEX idx_news_published_at ON news(published_at DESC);
