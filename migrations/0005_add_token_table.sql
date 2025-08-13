-- Migration number: 0005 	 2025-08-13T09:25:02.050Z
CREATE TABLE IF NOT EXISTS sessions (
                                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                                        user_id INTEGER NOT NULL,
                                        jti TEXT NOT NULL UNIQUE,
                                        expires_at INTEGER NOT NULL, -- epoch seconds
                                        revoked INTEGER DEFAULT 0,
                                        created_at INTEGER DEFAULT (strftime('%s','now'))
    );
CREATE INDEX IF NOT EXISTS idx_sessions_jti ON sessions(jti);