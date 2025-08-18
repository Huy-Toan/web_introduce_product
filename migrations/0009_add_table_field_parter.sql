-- Migration number: 0009 	 2025-08-18T09:57:21.701Z
-- Bảng lĩnh vực
CREATE TABLE IF NOT EXISTS fields (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  content    TEXT,
  image_url  TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Bảng chứng nhận & đối tác
CREATE TABLE IF NOT EXISTS certifications_partners (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  type       TEXT NOT NULL, 
  content    TEXT NOT NULL,
  image_url  TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
