import { Hono } from "hono";

const hasDB = (env) => Boolean(env?.DB) || Boolean(env?.DB_AVAILABLE);
const normalizeType = (t) => (t || "").toString().trim().toLowerCase();

const cerPartnerRouter = new Hono();

// GET /api/cp  → trả tất cả
cerPartnerRouter.get("/", async (c) => {
  try {
    if (!hasDB(c.env)) {
      return c.json({ ok: true, items: [], count: 0, source: "fallback" });
    }

    const sql = `
      SELECT id, name, type, content, image_url, created_at
      FROM certifications_partners
      ORDER BY created_at DESC
    `;
    const result = await c.env.DB.prepare(sql).all();
    const items = result?.results ?? [];
    return c.json({ ok: true, items, count: items.length, source: "database" });
  } catch (err) {
    console.error("Error fetching certifications_partners:", err);
    return c.json({ ok: false, error: "Failed to fetch items" }, 500);
  }
});

// GET /api/cp/type/:type  → lọc theo type
cerPartnerRouter.get("/type/:type", async (c) => {
  try {
    if (!hasDB(c.env)) {
      return c.json({ ok: true, items: [], count: 0, source: "fallback" });
    }
    const t = normalizeType(c.req.param("type"));

    const sql = `
      SELECT id, name, type, content, image_url, created_at
      FROM certifications_partners
      WHERE type = ?
      ORDER BY created_at DESC
    `;
    const result = await c.env.DB.prepare(sql).bind(t).all();
    const items = result?.results ?? [];
    return c.json({ ok: true, items, count: items.length, type: t });
  } catch (e) {
    return c.json({ ok: false, error: "Failed to fetch by type" }, 500);
  }
});

// GET /api/cp/:id
cerPartnerRouter.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ ok: false, error: "Invalid id" }, 400);

  try {
    if (!hasDB(c.env)) return c.json({ ok: false, error: "No database" }, 503);

    const item = await c.env.DB
      .prepare("SELECT id, name, type, content, image_url, created_at FROM certifications_partners WHERE id = ?")
      .bind(id)
      .first();

    if (!item) return c.json({ ok: false, error: "Not found" }, 404);
    return c.json({ ok: true, item });
  } catch (e) {
    return c.json({ ok: false, error: "Failed to fetch item" }, 500);
  }
});

// POST /api/cp
cerPartnerRouter.post("/", async (c) => {
  try {
    if (!hasDB(c.env)) return c.json({ ok: false, error: "No database" }, 503);

    const { name, type, content, image_url } = await c.req.json();
    const t = normalizeType(type);

    if (!name || typeof name !== "string") return c.json({ ok: false, error: "name is required" }, 400);
    if (!t) return c.json({ ok: false, error: "type is required" }, 400);
    if (!content || typeof content !== "string") return c.json({ ok: false, error: "content is required" }, 400);

    const result = await c.env.DB
      .prepare("INSERT INTO certifications_partners (name, type, content, image_url) VALUES (?, ?, ?, ?)")
      .bind(name, t, content, image_url ?? null)
      .run();

    const item = await c.env.DB
      .prepare("SELECT id, name, type, content, image_url, created_at FROM certifications_partners WHERE id = ?")
      .bind(result.meta.last_row_id)
      .first();

    return c.json({ ok: true, item }, 201);
  } catch (e) {
    console.error(e);
    return c.json({ ok: false, error: "Failed to create item" }, 500);
  }
});

// PUT /api/cp/:id
cerPartnerRouter.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ ok: false, error: "Invalid id" }, 400);

  try {
    if (!hasDB(c.env)) return c.json({ ok: false, error: "No database" }, 503);

    const body = await c.req.json();
    const name = body.hasOwnProperty("name") ? body.name : undefined;
    const type = body.hasOwnProperty("type") ? normalizeType(body.type) : undefined;
    const content = body.hasOwnProperty("content") ? body.content : undefined;
    const image_url = body.hasOwnProperty("image_url") ? body.image_url : undefined;

    if (name !== undefined && typeof name !== "string") return c.json({ ok: false, error: "name must be string" }, 400);
    if (type !== undefined && !type) return c.json({ ok: false, error: "type cannot be empty" }, 400);
    if (content !== undefined && typeof content !== "string") return c.json({ ok: false, error: "content must be string" }, 400);

    await c.env.DB
      .prepare(`
        UPDATE certifications_partners
        SET
          name = COALESCE(?, name),
          type = COALESCE(?, type),
          content = COALESCE(?, content),
          image_url = COALESCE(?, image_url)
        WHERE id = ?
      `)
      .bind(name ?? null, type ?? null, content ?? null, image_url ?? null, id)
      .run();

    const item = await c.env.DB
      .prepare("SELECT id, name, type, content, image_url, created_at FROM certifications_partners WHERE id = ?")
      .bind(id)
      .first();

    return c.json({ ok: true, item });
  } catch (e) {
    return c.json({ ok: false, error: "Failed to update item" }, 500);
  }
});

// DELETE /api/cp/:id
cerPartnerRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ ok: false, error: "Invalid id" }, 400);

  try {
    if (!hasDB(c.env)) return c.json({ ok: false, error: "No database" }, 503);
    await c.env.DB.prepare("DELETE FROM certifications_partners WHERE id = ?").bind(id).run();
    return c.json({ ok: true });
  } catch (e) {
    return c.json({ ok: false, error: "Failed to delete item" }, 500);
  }
});

export default cerPartnerRouter;
