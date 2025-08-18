import { Hono } from "hono";

const hasDB = (env) => Boolean(env?.DB) || Boolean(env?.DB_AVAILABLE);

const fieldRouter = new Hono();

// GET /api/fields
fieldRouter.get("/", async (c) => {
  try {
    if (!hasDB(c.env)) {
      return c.json({ ok: true, items: [], count: 0, source: "fallback" });
    }

    const sql = `
      SELECT id, name, content, image_url, created_at
      FROM fields
      ORDER BY created_at DESC
    `;
    const result = await c.env.DB.prepare(sql).all();
    const items = result?.results ?? [];
    return c.json({ ok: true, items, count: items.length, source: "database" });
  } catch (err) {
    console.error("Error fetching fields:", err);
    return c.json({ ok: false, error: "Failed to fetch fields" }, 500);
  }
});

// GET /api/fields/:id
fieldRouter.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ ok: false, error: "Invalid id" }, 400);

  try {
    if (!hasDB(c.env)) return c.json({ ok: false, error: "No database" }, 503);

    const item = await c.env.DB
      .prepare("SELECT id, name, content, image_url, created_at FROM fields WHERE id = ?")
      .bind(id)
      .first();

    if (!item) return c.json({ ok: false, error: "Not found" }, 404);
    return c.json({ ok: true, item });
  } catch (e) {
    return c.json({ ok: false, error: "Failed to fetch field" }, 500);
  }
});

// POST /api/fields
fieldRouter.post("/", async (c) => {
  try {
    if (!hasDB(c.env)) return c.json({ ok: false, error: "No database" }, 503);

    const { name, content, image_url } = await c.req.json();
    if (!name || typeof name !== "string") {
      return c.json({ ok: false, error: "name is required" }, 400);
    }

    const result = await c.env.DB
      .prepare("INSERT INTO fields (name, content, image_url) VALUES (?, ?, ?)")
      .bind(name, content ?? null, image_url ?? null)
      .run();

    const item = await c.env.DB
      .prepare("SELECT id, name, content, image_url, created_at FROM fields WHERE id = ?")
      .bind(result.meta.last_row_id)
      .first();

    return c.json({ ok: true, item }, 201);
  } catch (e) {
    console.error(e);
    return c.json({ ok: false, error: "Failed to create field" }, 500);
  }
});

// PUT /api/fields/:id
fieldRouter.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ ok: false, error: "Invalid id" }, 400);

  try {
    if (!hasDB(c.env)) return c.json({ ok: false, error: "No database" }, 503);

    const { name, content, image_url } = await c.req.json();
    // name không bắt buộc khi update, nhưng nếu gửi thì phải là string
    if (name !== undefined && typeof name !== "string") {
      return c.json({ ok: false, error: "name must be string" }, 400);
    }

    await c.env.DB
      .prepare("UPDATE fields SET name = COALESCE(?, name), content = COALESCE(?, content), image_url = COALESCE(?, image_url) WHERE id = ?")
      .bind(name ?? null, content ?? null, image_url ?? null, id)
      .run();

    const item = await c.env.DB
      .prepare("SELECT id, name, content, image_url, created_at FROM fields WHERE id = ?")
      .bind(id)
      .first();

    return c.json({ ok: true, item });
  } catch (e) {
    return c.json({ ok: false, error: "Failed to update field" }, 500);
  }
});

// DELETE /api/fields/:id
fieldRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ ok: false, error: "Invalid id" }, 400);

  try {
    if (!hasDB(c.env)) return c.json({ ok: false, error: "No database" }, 503);

    await c.env.DB.prepare("DELETE FROM fields WHERE id = ?").bind(id).run();
    return c.json({ ok: true });
  } catch (e) {
    return c.json({ ok: false, error: "Failed to delete field" }, 500);
  }
});

export default fieldRouter;
