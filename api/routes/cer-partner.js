// api/routes/certifications_partners.js
import { Hono } from "hono";

const DEFAULT_LOCALE = "vi";
const getLocale = (c) =>
  (c.req.query("locale") || DEFAULT_LOCALE).toLowerCase();
const hasDB = (env) => Boolean(env?.DB) || Boolean(env?.DB_AVAILABLE);
const normalizeType = (t) => (t || "").toString().trim().toLowerCase();

export const cerPartnerRouter = new Hono();

/** Merge 1 item theo locale (JOIN + fallback) */
async function getMergedById(db, id, locale) {
  const sql = `
    SELECT
      c.id,
      COALESCE(ct.name,    c.name)    AS name,
      c.type,
      COALESCE(ct.content, c.content) AS content,
      c.image_url,
      c.created_at
    FROM certifications_partners c
    LEFT JOIN certifications_partners_translations ct
      ON ct.cp_id = c.id AND ct.locale = ?
    WHERE c.id = ?
    LIMIT 1
  `;
  return db.prepare(sql).bind(locale, id).first();
}

/** LIST: GET /api/cp?locale=en */
cerPartnerRouter.get("/", async (c) => {
  try {
    if (!hasDB(c.env)) {
      return c.json({ ok: true, items: [], count: 0, source: "fallback" });
    }
    const locale = getLocale(c);
    const sql = `
      SELECT
        c.id,
        COALESCE(ct.name,    c.name)    AS name,
        c.type,
        COALESCE(ct.content, c.content) AS content,
        c.image_url,   -- KEY
        c.created_at
      FROM certifications_partners c
      LEFT JOIN certifications_partners_translations ct
        ON ct.cp_id = c.id AND ct.locale = ?
      ORDER BY c.created_at DESC
    `;
    const { results = [] } = await c.env.DB.prepare(sql).bind(locale).all();

    const base = (c.env.DISPLAY_BASE_URL || c.env.PUBLIC_R2_URL || "").replace(/\/+$/, "");
    const items = results.map(r => ({
      ...r,
      image_url: r.image_url ? `${base}/${r.image_url}` : null
    }));

    return c.json({ ok: true, items, count: items.length, source: "database", locale });
  } catch (err) {
    console.error("Error fetching certifications_partners:", err);
    return c.json({ ok: false, error: "Failed to fetch items" }, 500);
  }
});

/** LIST by type: GET /api/cp/type/:type?locale=en */
cerPartnerRouter.get("/type/:type", async (c) => {
  try {
    if (!hasDB(c.env)) {
      return c.json({ ok: true, items: [], count: 0, source: "fallback" });
    }
    const t = normalizeType(c.req.param("type"));
    const locale = getLocale(c);

    const sql = `
      SELECT
        c.id,
        COALESCE(ct.name,    c.name)    AS name,
        c.type,
        COALESCE(ct.content, c.content) AS content,
        c.image_url,   -- KEY
        c.created_at
      FROM certifications_partners c
      LEFT JOIN certifications_partners_translations ct
        ON ct.cp_id = c.id AND ct.locale = ?
      WHERE c.type = ?
      ORDER BY c.created_at DESC
    `;
    const { results = [] } = await c.env.DB.prepare(sql).bind(locale, t).all();

    const base = (c.env.DISPLAY_BASE_URL || c.env.PUBLIC_R2_URL || "").replace(/\/+$/, "");
    const items = results.map(r => ({
      ...r,
      image_url: r.image_url ? `${base}/${r.image_url}` : null
    }));

    return c.json({ ok: true, items, count: items.length, type: t, locale });
  } catch (e) {
    console.error(e);
    return c.json({ ok: false, error: "Failed to fetch by type" }, 500);
  }
});

/** DETAIL: GET /api/cp/:id?locale=en */
cerPartnerRouter.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ ok: false, error: "Invalid id" }, 400);
  try {
    if (!hasDB(c.env)) return c.json({ ok: false, error: "No database" }, 503);
    const locale = getLocale(c);
    const raw = await getMergedById(c.env.DB, id, locale);
    if (!raw) return c.json({ ok: false, error: "Not found" }, 404);

    const base = (c.env.DISPLAY_BASE_URL || c.env.PUBLIC_R2_URL || "").replace(/\/+$/, "");
    const item = {
      ...raw,
      image_url: raw.image_url ? `${base}/${raw.image_url}` : null
    };

    return c.json({ ok: true, item, source: "database", locale });
  } catch (e) {
    console.error(e);
    return c.json({ ok: false, error: "Failed to fetch item" }, 500);
  }
});


/**
 * CREATE: POST /api/cp
 * Body:
 * {
 *   name: string,
 *   type: "certification" | "partner" | ...,
 *   content: string,
 *   image_url?: string,
 *   translations?: { en?: { name, content }, ja?: {...} }
 * }
 */
cerPartnerRouter.post("/", async (c) => {
  try {
    if (!hasDB(c.env)) return c.json({ ok: false, error: "No database" }, 503);

    const body = await c.req.json();
    const { name, type, content, image_url, translations } = body || {};
    const t = normalizeType(type);

    if (!name || typeof name !== "string") return c.json({ ok: false, error: "name is required" }, 400);
    if (!t) return c.json({ ok: false, error: "type is required" }, 400);
    if (!content || typeof content !== "string")
      return c.json({ ok: false, error: "content is required" }, 400);

    const ins = await c.env.DB
      .prepare("INSERT INTO certifications_partners (name, type, content, image_url) VALUES (?, ?, ?, ?)")
      .bind(name, t, content, image_url ?? null)
      .run();
    if (!ins.success) throw new Error("Insert failed");

    const newId = ins.meta?.last_row_id;

    // Upsert translations nếu có
    if (translations && typeof translations === "object") {
      const upsertT = `
        INSERT INTO certifications_partners_translations(cp_id, locale, name, content)
        VALUES (?1, ?2, ?3, ?4)
        ON CONFLICT(cp_id, locale) DO UPDATE SET
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
    const item = await getMergedById(c.env.DB, newId, locale);
    return c.json({ ok: true, item, locale }, 201);
  } catch (e) {
    console.error(e);
    return c.json({ ok: false, error: "Failed to create item" }, 500);
  }
});

/**
 * UPDATE base + (optional) translations: PUT /api/cp/:id
 * Body tương tự POST; có thể kèm translations để upsert
 */
cerPartnerRouter.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ ok: false, error: "Invalid id" }, 400);

  try {
    if (!hasDB(c.env)) return c.json({ ok: false, error: "No database" }, 503);

    const body = await c.req.json();
    const name = Object.prototype.hasOwnProperty.call(body, "name") ? body.name : undefined;
    const type = Object.prototype.hasOwnProperty.call(body, "type") ? normalizeType(body.type) : undefined;
    const content = Object.prototype.hasOwnProperty.call(body, "content") ? body.content : undefined;
    const image_url = Object.prototype.hasOwnProperty.call(body, "image_url") ? body.image_url : undefined;
    const translations = body?.translations;

    if (name !== undefined && typeof name !== "string") return c.json({ ok: false, error: "name must be string" }, 400);
    if (type !== undefined && !type) return c.json({ ok: false, error: "type cannot be empty" }, 400);
    if (content !== undefined && typeof content !== "string")
      return c.json({ ok: false, error: "content must be string" }, 400);

    // Update base nếu có field
    const sets = [];
    const params = [];
    if (name !== undefined) { sets.push("name = ?"); params.push(name); }
    if (type !== undefined) { sets.push("type = ?"); params.push(type); }
    if (content !== undefined) { sets.push("content = ?"); params.push(content); }
    if (image_url !== undefined) { sets.push("image_url = ?"); params.push(image_url); }

    if (sets.length) {
      const sql = `UPDATE certifications_partners SET ${sets.join(", ")} WHERE id = ?`;
      params.push(id);
      const res = await c.env.DB.prepare(sql).bind(...params).run();
      if ((res.meta?.changes || 0) === 0) return c.json({ ok: false, error: "Not found" }, 404);
    }

    // Upsert translations nếu có
    if (translations && typeof translations === "object") {
      const upsertT = `
        INSERT INTO certifications_partners_translations(cp_id, locale, name, content)
        VALUES (?1, ?2, ?3, ?4)
        ON CONFLICT(cp_id, locale) DO UPDATE SET
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
    const item = await getMergedById(c.env.DB, id, locale);
    return c.json({ ok: true, item, locale });
  } catch (e) {
    console.error(e);
    return c.json({ ok: false, error: "Failed to update item" }, 500);
  }
});

/** UPDATE translations only: PUT /api/cp/:id/translations */
cerPartnerRouter.put("/:id/translations", async (c) => {
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
      INSERT INTO certifications_partners_translations(cp_id, locale, name, content)
      VALUES (?1, ?2, ?3, ?4)
      ON CONFLICT(cp_id, locale) DO UPDATE SET
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

/** GET translations map: GET /api/cp/:id/translations */
cerPartnerRouter.get("/:id/translations", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ ok: false, error: "Invalid id" }, 400);
  try {
    if (!hasDB(c.env)) return c.json({ ok: false, error: "No database" }, 503);

    const sql = `
      SELECT locale, name, content
      FROM certifications_partners_translations
      WHERE cp_id = ?
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

/** DELETE /api/cp/:id */
cerPartnerRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ ok: false, error: "Invalid id" }, 400);
  try {
    if (!hasDB(c.env)) return c.json({ ok: false, error: "No database" }, 503);
    await c.env.DB.prepare("DELETE FROM certifications_partners WHERE id = ?").bind(id).run();
    // ON DELETE CASCADE trong schema sẽ tự xoá translations
    return c.json({ ok: true });
  } catch (e) {
    console.error(e);
    return c.json({ ok: false, error: "Failed to delete item" }, 500);
  }
});

export default cerPartnerRouter;