-- Migration number: 0012 	 2025-08-20T11:56:39.146Z
CREATE TABLE IF NOT EXISTS messages (
                                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                                        chat_id TEXT,
                                        direction TEXT,
                                        wa_from TEXT,
                                        wa_to   TEXT,
                                        type TEXT,
                                        body TEXT,
                                        ts INTEGER
);
CREATE INDEX IF NOT EXISTS idx_messages_chat_ts ON messages(chat_id, ts);
