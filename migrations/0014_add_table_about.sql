-- Migration number: 0014 	 2025-08-27T15:55:27.827Z
CREATE TABLE about_us (
                          id INTEGER PRIMARY KEY AUTOINCREMENT,
                          title VARCHAR(255) NOT NULL,
                          content TEXT NOT NULL,
                          image_url VARCHAR(255),
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);