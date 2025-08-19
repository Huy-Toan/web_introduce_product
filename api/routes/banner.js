// api/routes/banners.js
import { Hono } from "hono";

/** Utils */
const DEFAULT_LOCALE = "vi";
const getLocale = (c) =>
  (c.req.query("locale") || DEFAULT_LOCALE).toLowerCase();

const hasDB = (env) => Boolean(env?.DB) || Boolean(env?.DB_AVAILABLE);

export const bannerRouter = new Hono();

/** Merge 1 banner theo locale (JOIN + fallback) */
async function getMergedBannerById(db, id, locale) {
  const sql = `
    SELECT
      b.id,
      COALESCE(bt.content, b.content) AS content,
      b.image_url,
      b.created_at,
      b.updated_at
    FROM banners b
    LEFT JOIN banners_translations bt
      ON bt.banner_id = b.id AND bt.locale = ?
    WHERE b.id = ?
    LIMIT 1
  `;
  return db.prepare(sql).bind(locale, id).first();
}

/** LIST: GET /api/banners?locale=en */
bannerRouter.get("/", async (c) => {
  try {
    if (!hasDB(c.env)) {
      return c.json({ ok: true, items: [], count: 0, source: "fallback" });
    }
    const locale = getLocale(c);
    const sql = `
      SELECT
        b.id,
        COALESCE(bt.content, b.content) AS content,
        b.image_url,
        b.created_at,
        b.updated_at
      FROM banners b
      LEFT JOIN banners_translations bt
        ON bt.banner_id = b.id AND bt.locale = ?
      ORDER BY b.created_at DESC
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
    console.error("Error fetching banners:", err);
    return c.json({ ok: false, error: "Failed to fetch banners" }, 500);
  }
});

/** DETAIL: GET /api/banners/:id?locale=en */
bannerRouter.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ ok: false, error: "Invalid id" }, 400);
  try {
    if (!hasDB(c.env)) return c.json({ ok: false, error: "No database" }, 503);
    const locale = getLocale(c);
    const item = await getMergedBannerById(c.env.DB, id, locale);
    if (!item) return c.json({ ok: false, error: "Not found" }, 404);
    return c.json({ ok: true, item, source: "database", locale });
  } catch {
    return c.json({ ok: false, error: "Failed to fetch banner" }, 500);
  }
});

/**
 * CREATE: POST /api/banners
 * Body:
 * {
 *   content: string,
 *   image_url?: string,
 *   translations?: { en?: { content }, ja?: { content }, ... }
 * }
 */
bannerRouter.post("/", async (c) => {
  try {
    if (!hasDB(c.env)) return c.json({ ok: false, error: "No database" }, 503);
    const body = await c.req.json();
    const { content, image_url, translations } = body || {};
    if (!content || typeof content !== "string") {
      return c.json({ ok: false, error: "content is required" }, 400);
    }

    const ins = await c.env.DB
      .prepare(`INSERT INTO banners (content, image_url) VALUES (?, ?)`)
      .bind(content, image_url || null)
      .run();
    if (!ins.success) throw new Error("Insert failed");
    const newId = ins.meta?.last_row_id;

    // Upsert translations nếu có
    if (translations && typeof translations === "object") {
      const upsertT = `
        INSERT INTO banners_translations(banner_id, locale, content)
        VALUES (?1, ?2, ?3)
        ON CONFLICT(banner_id, locale) DO UPDATE SET
          content=excluded.content,
          updated_at=strftime('%Y-%m-%d %H:%M:%f','now')
      `;
      for (const [lc, tr] of Object.entries(translations)) {
        await c.env.DB
          .prepare(upsertT)
          .bind(newId, String(lc).toLowerCase(), tr?.content ?? "")
          .run();
      }
    }

    const locale = getLocale(c);
    const item = await getMergedBannerById(c.env.DB, newId, locale);
    return c.json({ ok: true, item, source: "database", locale }, 201);
  } catch (e) {
    console.error(e);
    return c.json({ ok: false, error: "Failed to create banner" }, 500);
  }
});

/**
 * UPDATE base + (optional) translations: PUT /api/banners/:id
 * Body giống POST; có thể kèm translations để upsert
 */
bannerRouter.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ ok: false, error: "Invalid id" }, 400);
  try {
    if (!hasDB(c.env)) return c.json({ ok: false, error: "No database" }, 503);

    const body = await c.req.json();
    const { content, image_url, translations } = body || {};

    // Update base nếu có field
    const sets = [];
    const params = [];
    if (content !== undefined) { sets.push("content = ?"); params.push(content); }
    if (image_url !== undefined) { sets.push("image_url = ?"); params.push(image_url); }
    if (sets.length) {
      const sql = `UPDATE banners SET ${sets.join(", ")}, updated_at=strftime('%Y-%m-%d %H:%M:%f','now') WHERE id = ?`;
      params.push(id);
      const res = await c.env.DB.prepare(sql).bind(...params).run();
      if ((res.meta?.changes || 0) === 0) return c.json({ ok: false, error: "Not found" }, 404);
    }

    // Upsert translations nếu có
    if (translations && typeof translations === "object") {
      const upsertT = `
        INSERT INTO banners_translations(banner_id, locale, content)
        VALUES (?1, ?2, ?3)
        ON CONFLICT(banner_id, locale) DO UPDATE SET
          content=excluded.content,
          updated_at=strftime('%Y-%m-%d %H:%M:%f','now')
      `;
      for (const [lc, tr] of Object.entries(translations)) {
        await c.env.DB
          .prepare(upsertT)
          .bind(id, String(lc).toLowerCase(), tr?.content ?? "")
          .run();
      }
    }

    const locale = getLocale(c);
    const item = await getMergedBannerById(c.env.DB, id, locale);
    return c.json({ ok: true, item, source: "database", locale });
  } catch (e) {
    console.error(e);
    return c.json({ ok: false, error: "Failed to update banner" }, 500);
  }
});

/**
 * UPDATE translations only: PUT /api/banners/:id/translations
 * Body: { translations: { en:{content}, ... } }
 */
bannerRouter.put("/:id/translations", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ ok: false, error: "Invalid id" }, 400);
  try {
    if (!hasDB(c.env)) return c.json({ ok: false, error: "No database" }, 503);
    const { translations } = (await c.req.json()) || {};
    if (!translations || typeof translations !== "object") {
      return c.json({ ok: false, error: "Missing translations" }, 400);
    }

    const upsertT = `
      INSERT INTO banners_translations(banner_id, locale, content)
      VALUES (?1, ?2, ?3)
      ON CONFLICT(banner_id, locale) DO UPDATE SET
        content=excluded.content,
        updated_at=strftime('%Y-%m-%d %H:%M:%f','now')
    `;
    for (const [lc, tr] of Object.entries(translations)) {
      await c.env.DB
        .prepare(upsertT)
        .bind(id, String(lc).toLowerCase(), tr?.content ?? "")
        .run();
    }
    return c.json({ ok: true });
  } catch (e) {
    console.error(e);
    return c.json({ ok: false, error: "Failed to upsert translations" }, 500);
  }
});

/** GET translations map: GET /api/banners/:id/translations */
bannerRouter.get("/:id/translations", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ ok: false, error: "Invalid id" }, 400);
  try {
    if (!hasDB(c.env)) return c.json({ ok: false, error: "No database" }, 503);
    const sql = `
      SELECT locale, content
      FROM banners_translations
      WHERE banner_id = ?
      ORDER BY locale ASC
    `;
    const { results = [] } = await c.env.DB.prepare(sql).bind(id).all();
    const translations = {};
    for (const r of results) {
      translations[r.locale] = { content: r.content || "" };
    }
    return c.json({ ok: true, translations });
  } catch (e) {
    console.error(e);
    return c.json({ ok: false, error: "Failed to fetch translations" }, 500);
  }
});

/** DELETE /api/banners/:id */
bannerRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ ok: false, error: "Invalid id" }, 400);
  try {
    if (!hasDB(c.env)) return c.json({ ok: false, error: "No database" }, 503);
    await c.env.DB.prepare("DELETE FROM banners WHERE id = ?").bind(id).run();
    // ON DELETE CASCADE sẽ xoá luôn translations (đã set trong schema)
    return c.json({ ok: true });
  } catch (e) {
    console.error(e);
    return c.json({ ok: false, error: "Failed to delete banner" }, 500);
  }
});

export default bannerRouter;
