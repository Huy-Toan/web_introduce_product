// api/routes/createtable.js  (JS THUẦN)
import { Hono } from "hono";

export const adminCreateTable = new Hono();

// Tạo bảng "dinosaurs"
adminCreateTable.post("/create-dino-table", async (c) => {
  try {
    if (!c.env.DB) {
      return c.json({ error: "DB not available" }, 500);
    }

    const sql = `
      CREATE TABLE IF NOT EXISTS dinosaurs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        period TEXT,
        diet TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Dùng prepare().run() cho 1 câu DDL (ổn định hơn exec)
    await c.env.DB.prepare(sql).run();

    return c.json({
      success: true,
      message: "Table 'dinosaurs' created (or already exists)",
    });
  } catch (err) {
    console.error("Error creating table:", err);
    return c.json(
      {
        error: "Failed to create table",
        message: err && err.message ? err.message : String(err),
        stack: err && err.stack ? err.stack : null,
      },
      500
    );
  }
});

// (tuỳ chọn) liệt kê bảng để kiểm tra nhanh
adminCreateTable.get("/list-tables", async (c) => {
  try {
    if (!c.env.DB) return c.json({ error: "DB not available" }, 500);
    const rs = await c.env.DB
      .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
      .all();
    return c.json({ ok: true, tables: rs.results });
  } catch (err) {
    return c.json(
      { ok: false, message: err && err.message ? err.message : String(err) },
      500
    );
  }
});