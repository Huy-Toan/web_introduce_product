import { Hono } from "hono";

const hasDB = (env) => Boolean(env?.DB) || Boolean(env?.DB_AVAILABLE);

const bannerRouter = new Hono();

// GET /api/banners
bannerRouter.get("/", async (c) => {
  try {
    if (!hasDB(c.env)) {
      return c.json({ ok: true, items: [], count: 0, source: "fallback" });
    }

    const sql = `
      SELECT id, content, image_url, created_at, updated_at
      FROM banners
      ORDER BY created_at DESC
    `;
    const result = await c.env.DB.prepare(sql).all();
    const items = result?.results ?? [];
    return c.json({ ok: true, items, count: items.length, source: "database" });
  } catch (err) {
    console.error("Error fetching banners:", err);
    return c.json({ ok: false, error: "Failed to fetch banners" }, 500);
  }
});

// GET /api/banners/:id
bannerRouter.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ ok: false, error: "Invalid id" }, 400);
  try {
    if (!hasDB(c.env)) return c.json({ ok: false, error: "No database" }, 503);
    const item = await c.env.DB
      .prepare("SELECT id, content, image_url, created_at, updated_at FROM banners WHERE id = ?")
      .bind(id)
      .first();
    if (!item) return c.json({ ok: false, error: "Not found" }, 404);
    return c.json({ ok: true, item });
  } catch (e) {
    return c.json({ ok: false, error: "Failed to fetch banner" }, 500);
  }
});

// POST /api/banners
bannerRouter.post("/", async (c) => {
  try {
    if (!hasDB(c.env)) return c.json({ ok: false, error: "No database" }, 503);
    const { content, image_url } = await c.req.json();
    if (!content || typeof content !== "string") {
      return c.json({ ok: false, error: "content is required" }, 400);
    }
    const result = await c.env.DB
      .prepare("INSERT INTO banners (content, image_url) VALUES (?, ?)")
      .bind(content, image_url || null)
      .run();

    const item = await c.env.DB
      .prepare("SELECT id, content, image_url, created_at, updated_at FROM banners WHERE id = ?")
      .bind(result.meta.last_row_id)
      .first();

    return c.json({ ok: true, item }, 201);
  } catch (e) {
    console.error(e);
    return c.json({ ok: false, error: "Failed to create banner" }, 500);
  }
});

// PUT /api/banners/:id
bannerRouter.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ ok: false, error: "Invalid id" }, 400);
  try {
    if (!hasDB(c.env)) return c.json({ ok: false, error: "No database" }, 503);
    const { content, image_url } = await c.req.json();
    await c.env.DB
      .prepare("UPDATE banners SET content = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .bind(content ?? null, image_url ?? null, id)
      .run();

    const item = await c.env.DB
      .prepare("SELECT id, content, image_url, created_at, updated_at FROM banners WHERE id = ?")
      .bind(id)
      .first();

    return c.json({ ok: true, item });
  } catch (e) {
    return c.json({ ok: false, error: "Failed to update banner" }, 500);
  }
});

// DELETE /api/banners/:id
bannerRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ ok: false, error: "Invalid id" }, 400);
  try {
    if (!hasDB(c.env)) return c.json({ ok: false, error: "No database" }, 503);
    await c.env.DB.prepare("DELETE FROM banners WHERE id = ?").bind(id).run();
    return c.json({ ok: true });
  } catch (e) {
    return c.json({ ok: false, error: "Failed to delete banner" }, 500);
  }
});

export default bannerRouter;
