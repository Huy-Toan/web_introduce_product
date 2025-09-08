// src/routes/adminCreateTable.ts
import { Hono } from "hono";

export const adminCreateTable = new Hono();

adminCreateTable.post("/create-dino-table", async (c) => {
  try {
    if (!c.env.DB) return c.json({ error: "DB not available" }, 500);

    const sql = `
      CREATE TABLE IF NOT EXISTS dinosaurs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        period TEXT,
        diet TEXT,
        discovered_at TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%f','now'))
      );
    `;
    await c.env.DB.exec(sql);

    return c.json({ success: true, message: "Table dinosaurs created (or already exists)" });
  } catch (err) {
    console.error("Error creating table:", err);
    return c.json({ error: "Failed to create table" }, 500);
  }
});
