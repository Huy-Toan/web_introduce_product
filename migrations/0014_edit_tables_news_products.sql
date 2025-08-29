-- Migration number: 0012   2025-08-29T10:00:00.000Z
-- Purpose:
--   - Add 'views' to products + news
--   - Add 'images_json' to products and backfill from legacy 'image_url'
--   - Ensure 'updated_at' auto-updates on products

BEGIN TRANSACTION;

----------------------------------------------------------------------
-- 1) Add views column
----------------------------------------------------------------------
ALTER TABLE products ADD COLUMN views INTEGER NOT NULL DEFAULT 0;
ALTER TABLE news     ADD COLUMN views INTEGER NOT NULL DEFAULT 0;

----------------------------------------------------------------------
-- 2) Add images_json column (JSON stored as TEXT)
----------------------------------------------------------------------
ALTER TABLE products
  ADD COLUMN images_json TEXT
  CHECK (images_json IS NULL OR json_valid(images_json));

----------------------------------------------------------------------
-- 3) Backfill from legacy image_url -> images_json
--    Format: [{"url": "...", "is_primary": 1, "sort_order": 0}]
----------------------------------------------------------------------
UPDATE products
SET images_json = json(
  '[{"url":' || quote(image_url) || ',"is_primary":1,"sort_order":0}]'
)
WHERE
  (images_json IS NULL OR trim(images_json) = '')
  AND image_url IS NOT NULL
  AND trim(image_url) <> '';

----------------------------------------------------------------------
-- 4) Ensure updated_at is auto-maintained on products
----------------------------------------------------------------------
DROP TRIGGER IF EXISTS products_updated_at;

CREATE TRIGGER products_updated_at
AFTER UPDATE ON products
FOR EACH ROW
BEGIN
  UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

COMMIT;
