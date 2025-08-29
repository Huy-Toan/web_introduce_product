// api/route/about.js
import { Hono } from "hono";

/** Utils */
const DEFAULT_LOCALE = "vi";
const getLocale = (c) =>
  (c.req.query("locale") || DEFAULT_LOCALE).toLowerCase();

const hasDB = (env) => Boolean(env?.DB) || Boolean(env?.DB_AVAILABLE);

export const aboutRouter = new Hono();

/** Fallback sample */
const fallbackAbout = [
  {
    id: 1,
    title: "About Our Library",
    content:
      "We are a community-driven library offering a wide range of books to readers of all ages.",
    image_url: "/images/about/library.jpg",
  },
];

/** Merge 1 item theo locale (JOIN + fallback) */
async function getMergedAboutById(db, id, locale) {
  const sql = `
    SELECT
      a.id,
      COALESCE(at.title,   a.title)   AS title,
      COALESCE(at.content, a.content) AS content,
      a.image_url,
      a.created_at
    FROM about_us a
    LEFT JOIN about_us_translations at
      ON at.about_id = a.id AND at.locale = ?
    WHERE a.id = ?
    LIMIT 1
  `;
  return db.prepare(sql).bind(locale, id).first();
}

aboutRouter.get("/", async (c) => {
  try {
    if (!hasDB(c.env)) {
      return c.json({ about: fallbackAbout, source: "fallback" });
    }
    const locale = getLocale(c);
    const sql = `
      SELECT
        a.id,
        COALESCE(at.title,   a.title)   AS title,
        COALESCE(at.content, a.content) AS content,
        a.image_url,      -- KEY trong DB
        a.created_at
      FROM about_us a
      LEFT JOIN about_us_translations at
        ON at.about_id = a.id AND at.locale = ?
      ORDER BY a.id ASC
    `;
    const { results = [] } = await c.env.DB.prepare(sql).bind(locale).all();

    // build full URL
    const base =
      (c.env.PUBLIC_R2_URL ||c.env.INTERNAL_R2_URL || "").replace(/\/+$/, "");
    const about = results.map(r => ({
      ...r,
      image_url: r.image_url ? `${base}/${r.image_url}` : null
    }));

    return c.json({ about, source: "database", locale });
  } catch (e) {
    console.error("Error fetching about list:", e);
    return c.json({ error: "Failed to fetch about us" }, 500);
  }
});

/** DETAIL: GET /api/about/:id?locale=en */
aboutRouter.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB(c.env)) return c.json({ error: "Database not available" }, 503);
    const locale = getLocale(c);

    const item = await getMergedAboutById(c.env.DB, id, locale);

    if (!item) return c.json({ error: "Not found" }, 404);

    // build full URL cho detail
    const base =
      (c.env.PUBLIC_R2_URL || c.env.INTERNAL_R2_URL ||  "").replace(/\/+$/, "");
    const about = {
      ...item,
      image_url: item.image_url ? `${base}/${item.image_url}` : null
    };

    return c.json({ about, source: "database", locale });
  } catch (e) {
    console.error("Error fetching about detail:", e);
    return c.json({ error: "Failed to fetch about" }, 500);
  }
});


/**
 * CREATE: POST /api/about
 * Body:
 * {
 *   title: string,
 *   content: string,
 *   image_url?: string,
 *   translations?: { en?: { title, content }, ja?: { ... } }
 * }
 */
aboutRouter.post("/", async (c) => {
  try {
    if (!hasDB(c.env)) return c.json({ error: "Database not available" }, 503);

    const body = await c.req.json();
    const { title, content, image_url, translations } = body || {};
    if (!title || !content) {
      return c.json({ error: "Missing required fields: title, content" }, 400);
    }

    // Insert base row
    const sql = `
      INSERT INTO about_us (title, content, image_url)
      VALUES (?, ?, ?)
    `;
    const res = await c.env.DB
      .prepare(sql)
      .bind(title, content, image_url || null)
      .run();
    if (!res.success) throw new Error("Insert failed");

    const newId = res.meta?.last_row_id;

    // Upsert translations nếu có
    if (translations && typeof translations === "object") {
      const upsertT = `
        INSERT INTO about_us_translations(about_id, locale, title, content)
        VALUES (?1, ?2, ?3, ?4)
        ON CONFLICT(about_id, locale) DO UPDATE SET
          title=excluded.title,
          content=excluded.content,
          updated_at=strftime('%Y-%m-%d %H:%M:%f','now')
      `;
      for (const [lc, tr] of Object.entries(translations)) {
        await c.env.DB
          .prepare(upsertT)
          .bind(newId, String(lc).toLowerCase(), tr?.title ?? "", tr?.content ?? "")
          .run();
      }
    }

    const locale = getLocale(c);
    const item = await getMergedAboutById(c.env.DB, newId, locale);
    return c.json({ about: item, source: "database", locale }, 201);
  } catch (e) {
    console.error("Error creating about:", e);
    return c.json({ error: "Failed to create about" }, 500);
  }
});

/**
 * UPDATE base + (optional) translations: PUT /api/about/:id
 * Body fields giống POST; có thể kèm translations để upsert
 */
aboutRouter.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB(c.env)) return c.json({ error: "Database not available" }, 503);

    const body = await c.req.json();
    const { title, content, image_url, translations } = body || {};

    // Update base nếu có field
    const sets = [];
    const params = [];
    if (title !== undefined) { sets.push("title = ?"); params.push(title); }
    if (content !== undefined) { sets.push("content = ?"); params.push(content); }
    if (image_url !== undefined) { sets.push("image_url = ?"); params.push(image_url); }

    if (sets.length) {
      const sql = `UPDATE about_us SET ${sets.join(", ")} WHERE id = ?`;
      params.push(id);
      const res = await c.env.DB.prepare(sql).bind(...params).run();
      if ((res.meta?.changes || 0) === 0) return c.json({ error: "Not found" }, 404);
    }

    // Upsert translations nếu có
    if (translations && typeof translations === "object") {
      const upsertT = `
        INSERT INTO about_us_translations(about_id, locale, title, content)
        VALUES (?1, ?2, ?3, ?4)
        ON CONFLICT(about_id, locale) DO UPDATE SET
          title=excluded.title,
          content=excluded.content,
          updated_at=strftime('%Y-%m-%d %H:%M:%f','now')
      `;
      for (const [lc, tr] of Object.entries(translations)) {
        await c.env.DB
          .prepare(upsertT)
          .bind(id, String(lc).toLowerCase(), tr?.title ?? "", tr?.content ?? "")
          .run();
      }
    }

    const locale = getLocale(c);
    const item = await getMergedAboutById(c.env.DB, id, locale);
    return c.json({ about: item, source: "database", locale });
  } catch (e) {
    console.error("Error updating about:", e);
    return c.json({ error: "Failed to update about" }, 500);
  }
});

/**
 * UPDATE translations only: PUT /api/about/:id/translations
 * Body: { translations: { en:{title,content}, ... } }
 */
aboutRouter.put("/:id/translations", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB(c.env)) return c.json({ error: "Database not available" }, 503);

    const body = await c.req.json();
    const translations = body?.translations;
    if (!translations || typeof translations !== "object") {
      return c.json({ error: "Missing translations" }, 400);
    }

    const upsertT = `
      INSERT INTO about_us_translations(about_id, locale, title, content)
      VALUES (?1, ?2, ?3, ?4)
      ON CONFLICT(about_id, locale) DO UPDATE SET
        title=excluded.title,
        content=excluded.content,
        updated_at=strftime('%Y-%m-%d %H:%M:%f','now')
    `;
    for (const [lc, tr] of Object.entries(translations)) {
      await c.env.DB
        .prepare(upsertT)
        .bind(id, String(lc).toLowerCase(), tr?.title ?? "", tr?.content ?? "")
        .run();
    }
    return c.json({ ok: true });
  } catch (e) {
    console.error("Error upserting about translations:", e);
    return c.json({ error: "Failed to upsert translations" }, 500);
  }
});

/** DELETE /api/about/:id */
aboutRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB(c.env)) return c.json({ error: "Database not available" }, 503);

    const existing = await c.env.DB
      .prepare("SELECT id FROM about_us WHERE id = ?")
      .bind(id)
      .first();
    if (!existing) return c.json({ error: "Not found" }, 404);

    await c.env.DB.prepare("DELETE FROM about_us WHERE id = ?").bind(id).run();
    return c.json({ success: true });
  } catch (e) {
    console.error("Error deleting about:", e);
    return c.json({ error: "Failed to delete about" }, 500);
  }
});
// dịch
aboutRouter.get("/:id/translations", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    const sql = `
      SELECT locale, title, content
      FROM about_us_translations
      WHERE about_id = ?
      ORDER BY locale ASC
    `;
    const { results = [] } = await c.env.DB.prepare(sql).bind(id).all();
    const translations = {};
    for (const r of results) {
      translations[r.locale] = { title: r.title || "", content: r.content || "" };
    }
    return c.json({ translations });
  } catch (e) {
    console.error(e);
    return c.json({ error: "Failed to fetch translations" }, 500);
  }
});

export default aboutRouter;