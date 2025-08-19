// api/routes/fields.js
import { Hono } from "hono";

const DEFAULT_LOCALE = "vi";
const getLocale = (c) =>
  (c.req.query("locale") || DEFAULT_LOCALE).toLowerCase();

const hasDB = (env) => Boolean(env?.DB) || Boolean(env?.DB_AVAILABLE);

export const fieldRouter = new Hono();

/** Merge 1 field theo locale (JOIN + fallback) */
async function getMergedFieldById(db, id, locale) {
  const sql = `
    SELECT
      f.id,
      COALESCE(ft.name,    f.name)    AS name,
      COALESCE(ft.content, f.content) AS content,
      f.image_url,
      f.created_at
    FROM fields f
    LEFT JOIN fields_translations ft
      ON ft.field_id = f.id AND ft.locale = ?
    WHERE f.id = ?
    LIMIT 1
  `;
  return db.prepare(sql).bind(locale, id).first();
}

/** LIST: GET /api/fields?locale=en */
fieldRouter.get("/", async (c) => {
  try {
    if (!hasDB(c.env)) {
      return c.json({ ok: true, items: [], count: 0, source: "fallback" });
    }
    const locale = getLocale(c);
    const sql = `
      SELECT
        f.id,
        COALESCE(ft.name,    f.name)    AS name,
        COALESCE(ft.content, f.content) AS content,
        f.image_url,
        f.created_at
      FROM fields f
      LEFT JOIN fields_translations ft
        ON ft.field_id = f.id AND ft.locale = ?
      ORDER BY f.created_at DESC
    `;
    const { results = [] } = await c.env.DB.prepare(sql).bind(locale).all();
    return c.json({
      ok: true,
      items: results,
      count: results.length,
      source: "database",
      locale,
    });
  } catch (err) {
    console.error("Error fetching fields:", err);
    return c.json({ ok: false, error: "Failed to fetch fields" }, 500);
  }
});

/** DETAIL: GET /api/fields/:id?locale=en */
fieldRouter.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ ok: false, error: "Invalid id" }, 400);

  try {
    if (!hasDB(c.env)) return c.json({ ok: false, error: "No database" }, 503);
    const locale = getLocale(c);
    const item = await getMergedFieldById(c.env.DB, id, locale);
    if (!item) return c.json({ ok: false, error: "Not found" }, 404);
    return c.json({ ok: true, item, source: "database", locale });
  } catch (e) {
    console.error(e);
    return c.json({ ok: false, error: "Failed to fetch field" }, 500);
  }
});

/**
 * CREATE: POST /api/fields
 * Body:
 * {
 *   name: string,
 *   content?: string,
 *   image_url?: string,
 *   translations?: { en?: { name, content }, ja?: { ... } }
 * }
 */
fieldRouter.post("/", async (c) => {
  try {
    if (!hasDB(c.env)) return c.json({ ok: false, error: "No database" }, 503);

    const body = await c.req.json();
    const { name, content, image_url, translations } = body || {};
    if (!name || typeof name !== "string") {
      return c.json({ ok: false, error: "name is required" }, 400);
    }

    const ins = await c.env.DB
      .prepare("INSERT INTO fields (name, content, image_url) VALUES (?, ?, ?)")
      .bind(name, content ?? null, image_url ?? null)
      .run();
    if (!ins.success) throw new Error("Insert failed");

    const newId = ins.meta?.last_row_id;

    // Upsert translations nếu có
    if (translations && typeof translations === "object") {
      const upsertT = `
        INSERT INTO fields_translations(field_id, locale, name, content)
        VALUES (?1, ?2, ?3, ?4)
        ON CONFLICT(field_id, locale) DO UPDATE SET
          name=excluded.name,
          content=excluded.content,
          updated_at=strftime('%Y-%m-%d %H:%M:%f','now')
      `;
      for (const [lc, tr] of Object.entries(translations)) {
        await c.env.DB
          .prepare(upsertT)
          .bind(newId, String(lc).toLowerCase(), tr?.name ?? "", tr?.content ?? "")
          .run();
      }
    }

    const locale = getLocale(c);
    const item = await getMergedFieldById(c.env.DB, newId, locale);
    return c.json({ ok: true, item, source: "database", locale }, 201);
  } catch (e) {
    console.error(e);
    return c.json({ ok: false, error: "Failed to create field" }, 500);
  }
});

/**
 * UPDATE base + (optional) translations: PUT /api/fields/:id
 * Body giống POST; có thể kèm translations để upsert
 */
fieldRouter.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ ok: false, error: "Invalid id" }, 400);

  try {
    if (!hasDB(c.env)) return c.json({ ok: false, error: "No database" }, 503);

    const body = await c.req.json();
    const { name, content, image_url, translations } = body || {};

    // name không bắt buộc khi update, nhưng nếu gửi thì phải là string
    if (name !== undefined && typeof name !== "string") {
      return c.json({ ok: false, error: "name must be string" }, 400);
    }

    // Update base nếu có field
    const sets = [];
    const params = [];
    if (name !== undefined) { sets.push("name = ?"); params.push(name); }
    if (content !== undefined) { sets.push("content = ?"); params.push(content); }
    if (image_url !== undefined) { sets.push("image_url = ?"); params.push(image_url); }

    if (sets.length) {
      const sql = `UPDATE fields SET ${sets.join(", ")} WHERE id = ?`;
      params.push(id);
      const res = await c.env.DB.prepare(sql).bind(...params).run();
      if ((res.meta?.changes || 0) === 0) return c.json({ ok: false, error: "Not found" }, 404);
    }

    // Upsert translations nếu có
    if (translations && typeof translations === "object") {
      const upsertT = `
        INSERT INTO fields_translations(field_id, locale, name, content)
        VALUES (?1, ?2, ?3, ?4)
        ON CONFLICT(field_id, locale) DO UPDATE SET
          name=excluded.name,
          content=excluded.content,
          updated_at=strftime('%Y-%m-%d %H:%M:%f','now')
      `;
      for (const [lc, tr] of Object.entries(translations)) {
        await c.env.DB
          .prepare(upsertT)
          .bind(id, String(lc).toLowerCase(), tr?.name ?? "", tr?.content ?? "")
          .run();
      }
    }

    const locale = getLocale(c);
    const item = await getMergedFieldById(c.env.DB, id, locale);
    return c.json({ ok: true, item, source: "database", locale });
  } catch (e) {
    console.error(e);
    return c.json({ ok: false, error: "Failed to update field" }, 500);
  }
});

/**
 * UPDATE translations only: PUT /api/fields/:id/translations
 * Body: { translations: { en:{name,content}, ... } }
 */
fieldRouter.put("/:id/translations", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ ok: false, error: "Invalid id" }, 400);

  try {
    if (!hasDB(c.env)) return c.json({ ok: false, error: "No database" }, 503);

    const body = await c.req.json();
    const translations = body?.translations;
    if (!translations || typeof translations !== "object") {
      return c.json({ ok: false, error: "Missing translations" }, 400);
    }

    const upsertT = `
      INSERT INTO fields_translations(field_id, locale, name, content)
      VALUES (?1, ?2, ?3, ?4)
      ON CONFLICT(field_id, locale) DO UPDATE SET
        name=excluded.name,
        content=excluded.content,
        updated_at=strftime('%Y-%m-%d %H:%M:%f','now')
    `;
    for (const [lc, tr] of Object.entries(translations)) {
      await c.env.DB
        .prepare(upsertT)
        .bind(id, String(lc).toLowerCase(), tr?.name ?? "", tr?.content ?? "")
        .run();
    }
    return c.json({ ok: true });
  } catch (e) {
    console.error(e);
    return c.json({ ok: false, error: "Failed to upsert translations" }, 500);
  }
});

/** GET translations map: GET /api/fields/:id/translations */
fieldRouter.get("/:id/translations", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ ok: false, error: "Invalid id" }, 400);

  try {
    if (!hasDB(c.env)) return c.json({ ok: false, error: "No database" }, 503);

    const sql = `
      SELECT locale, name, content
      FROM fields_translations
      WHERE field_id = ?
      ORDER BY locale ASC
    `;
    const { results = [] } = await c.env.DB.prepare(sql).bind(id).all();
    const translations = {};
    for (const r of results) {
      translations[r.locale] = { name: r.name || "", content: r.content || "" };
    }
    return c.json({ ok: true, translations });
  } catch (e) {
    console.error(e);
    return c.json({ ok: false, error: "Failed to fetch translations" }, 500);
  }
});

/** DELETE /api/fields/:id */
fieldRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ ok: false, error: "Invalid id" }, 400);

  try {
    if (!hasDB(c.env)) return c.json({ ok: false, error: "No database" }, 503);
    await c.env.DB.prepare("DELETE FROM fields WHERE id = ?").bind(id).run();
    // ON DELETE CASCADE trong schema sẽ xoá translations tương ứng
    return c.json({ ok: true });
  } catch (e) {
    console.error(e);
    return c.json({ ok: false, error: "Failed to delete field" }, 500);
  }
});

export default fieldRouter;
