import { Hono } from "hono";

/** Utils */
const DEFAULT_LOCALE = "vi";
const getLocale = (c) => (c.req.query("locale") || DEFAULT_LOCALE).toLowerCase();

const hasDB = (env) => Boolean(env?.DB) || Boolean(env?.DB_AVAILABLE);

const slugify = (s = "") =>
  s
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

/** Resolve news_id theo slug với ưu tiên theo locale, rồi fallback canonical */
async function resolveNewsIdBySlug(db, slug, locale) {
  const sql = `
    SELECT n.id
    FROM news_translations nt
    JOIN news n ON n.id = nt.news_id
    WHERE nt.locale = ? AND nt.slug = ?
    UNION
    SELECT n2.id
    FROM news n2
    WHERE n2.slug = ?
    LIMIT 1
  `;
  const row = await db.prepare(sql).bind(locale, slug, slug).first();
  return row?.id || null;
}

/** Merge fields theo locale (JOIN + fallback) cho 1 news id */
async function getMergedNewsById(db, id, locale) {
  const sql = `
    SELECT
      n.id,
      COALESCE(nt.title, n.title)                 AS title,
      COALESCE(nt.slug, n.slug)                   AS slug,
      COALESCE(nt.content, n.content)             AS content,
      COALESCE(nt.meta_description, n.meta_description) AS meta_description,
      COALESCE(nt.keywords, n.keywords)           AS keywords,
      n.image_url,
      n.published_at,
      n.created_at,
      n.updated_at
    FROM news n
    LEFT JOIN news_translations nt
      ON nt.news_id = n.id AND nt.locale = ?
    WHERE n.id = ?
    LIMIT 1
  `;
  return db.prepare(sql).bind(locale, id).first();
}

/** Lấy toàn bộ translations cho 1 news_id */
async function getAllTranslations(db, newsId) {
  const trRes = await db.prepare(
    `SELECT locale, title, slug, content, meta_description, keywords FROM news_translations WHERE news_id = ?`
  ).bind(newsId).all();
  const translationsObj = {};
  for (const r of trRes.results || []) {
    translationsObj[r.locale] = {
      title: r.title || "",
      slug: r.slug || "",
      content: r.content || "",
      meta_description: r.meta_description ?? null,
      keywords: r.keywords ?? null,
    };
  }
  return translationsObj;
}

export const newsRouter = new Hono();

/**
 * GET /api/news?locale=en
 * Danh sách bài viết theo locale
 */
newsRouter.get("/", async (c) => {
  try {
    if (!hasDB(c.env)) return c.json({ error: "No database" }, 500);
    const locale = getLocale(c);

    const sql = `
      SELECT
        n.id,
        COALESCE(nt.title, n.title)                 AS title,
        COALESCE(nt.slug, n.slug)                   AS slug,
        COALESCE(nt.content, n.content)             AS content,
        COALESCE(nt.meta_description, n.meta_description) AS meta_description,
        COALESCE(nt.keywords, n.keywords)           AS keywords,
        n.image_url,
        n.published_at,
        n.created_at,
        n.updated_at
      FROM news n
      LEFT JOIN news_translations nt
        ON nt.news_id = n.id AND nt.locale = ?
      ORDER BY COALESCE(n.published_at, n.created_at) DESC
    `;
    const params = [locale];
    const { results = [] } = await c.env.DB.prepare(sql).bind(...params).all();
    return c.json({
      news: results,
      count: results.length,
      source: "database",
      locale,
      debug: { sql, params },
    });
  } catch (err) {
    console.error("Error fetching news:", err);
    return c.json({ error: "Failed to fetch news", source: "error_fallback" }, 500);
  }
});

/**
 * GET /api/news/:idOrSlug?locale=en
 * Lấy 1 bài viết theo ID hoặc slug (ưu tiên slug theo locale)
 */
newsRouter.get("/:idOrSlug", async (c) => {
  const idOrSlug = c.req.param("idOrSlug");
  try {
    if (!hasDB(c.env)) return c.json({ error: "No database" }, 500);
    const locale = getLocale(c);

    let newsId = null;
    if (/^\d+$/.test(idOrSlug)) {
      newsId = Number(idOrSlug);
    } else {
      newsId = await resolveNewsIdBySlug(c.env.DB, idOrSlug, locale);
    }
    if (!newsId) return c.json({ error: "Not found" }, 404);

    const item = await getMergedNewsById(c.env.DB, newsId, locale);
    if (!item) return c.json({ error: "Not found" }, 404);

    // Trả về translations cho chi tiết
    const translations = await getAllTranslations(c.env.DB, newsId);

    return c.json({ news: { ...item, translations }, source: "database", locale });
  } catch (err) {
    console.error("Error fetching news by id/slug:", err);
    return c.json({ error: "Failed to fetch news" }, 500);
  }
});

/**
 * POST /api/news
 * Body:
 * {
 *   title: string,
 *   slug?: string,
 *   content: string,
 *   image_url?: string,
 *   meta_description?: string,
 *   keywords?: string,
 *   published_at?: string | null,
 *   translations?: {
 *     en?: { title: string, slug?: string, content?: string, meta_description?: string, keywords?: string },
 *     ja?: {...}
 *   }
 * }
 */
newsRouter.post("/", async (c) => {
  try {
    if (!hasDB(c.env)) return c.json({ error: "No database" }, 500);

    const body = await c.req.json();
    const {
      title,
      slug: rawSlug,
      content,
      image_url,
      meta_description,
      keywords,
      published_at,
      translations,
    } = body || {};

    if (!title || !content) return c.json({ error: "Missing title/content" }, 400);

    const baseSlug = rawSlug?.trim() || slugify(title);

    // Insert base news
    const sql = `
      INSERT INTO news (title, slug, content, meta_description, keywords, image_url, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const runRes = await c.env.DB
      .prepare(sql)
      .bind(
        title,
        baseSlug,
        content,
        meta_description || null,
        keywords || null,
        image_url || null,
        published_at ?? null
      )
      .run();

    if (!runRes.success) return c.json({ error: "Insert failed" }, 500);
    const newId = runRes.meta?.last_row_id;

    // Upsert translations nếu có
    if (translations && typeof translations === "object") {
      const upsertT = `
        INSERT INTO news_translations(news_id, locale, title, slug, content, meta_description, keywords)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
        ON CONFLICT(news_id, locale) DO UPDATE SET
          title=excluded.title,
          slug=excluded.slug,
          content=excluded.content,
          meta_description=excluded.meta_description,
          keywords=excluded.keywords,
          updated_at=strftime('%Y-%m-%d %H:%M:%f','now')
      `;
      for (const [lc, tr] of Object.entries(translations)) {
        await c.env.DB.prepare(upsertT).bind(
          newId,
          lc,
          tr.title || null,
          tr.slug || null,
          tr.content || null,
          tr.meta_description || null,
          tr.keywords || null
        ).run();
      }
    }

    const locale = getLocale(c);
    const item = await getMergedNewsById(c.env.DB, newId, locale);
    const translationsObj = await getAllTranslations(c.env.DB, newId);

    return c.json({ news: { ...item, translations: translationsObj }, source: "database", locale }, 201);
  } catch (err) {
    console.error("Error adding news:", err);
    const msg = String(err?.message || "").toLowerCase().includes("unique")
      ? "Slug already exists"
      : "Failed to add news";
    return c.json({ error: msg }, 500);
  }
});

/**
 * PUT /api/news/:id
 * Cập nhật base + (optional) translations
 */
newsRouter.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB(c.env)) return c.json({ error: "No database" }, 500);

    const body = await c.req.json();
    const {
      title,
      slug,
      content,
      image_url,
      meta_description,
      keywords,
      published_at,
      translations,
    } = body || {};

    // Update base nếu có field
    const sets = [];
    const params = [];

    if (title !== undefined) { sets.push("title = ?"); params.push(title); }
    if (slug !== undefined) { sets.push("slug = ?"); params.push(slug); }
    if (content !== undefined) { sets.push("content = ?"); params.push(content); }
    if (meta_description !== undefined) { sets.push("meta_description = ?"); params.push(meta_description); }
    if (keywords !== undefined) { sets.push("keywords = ?"); params.push(keywords); }
    if (image_url !== undefined) { sets.push("image_url = ?"); params.push(image_url); }
    if (published_at !== undefined) { sets.push("published_at = ?"); params.push(published_at); }

    if (sets.length > 0) {
      const sql = `UPDATE news SET ${sets.join(", ")}, updated_at=strftime('%Y-%m-%d %H:%M:%f','now') WHERE id = ?`;
      params.push(id);
      await c.env.DB.prepare(sql).bind(...params).run();
    }

    // Upsert translations nếu có
    if (translations && typeof translations === "object") {
      const upsertT = `
        INSERT INTO news_translations(news_id, locale, title, slug, content, meta_description, keywords)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
        ON CONFLICT(news_id, locale) DO UPDATE SET
          title=excluded.title,
          slug=excluded.slug,
          content=excluded.content,
          meta_description=excluded.meta_description,
          keywords=excluded.keywords,
          updated_at=strftime('%Y-%m-%d %H:%M:%f','now')
      `;
      for (const [lc, tr] of Object.entries(translations)) {
        await c.env.DB.prepare(upsertT).bind(
          id,
          lc,
          tr.title || null,
          tr.slug || null,
          tr.content || null,
          tr.meta_description || null,
          tr.keywords || null
        ).run();
      }
    }

    const locale = getLocale(c);
    const item = await getMergedNewsById(c.env.DB, id, locale);
    const translationsObj = await getAllTranslations(c.env.DB, id);

    return c.json({ news: { ...item, translations: translationsObj }, source: "database", locale });
  } catch (err) {
    console.error("Error updating news:", err);
    return c.json({ error: "Failed to update news" }, 500);
  }
});

/**
 * PUT /api/news/:id/translations
 * Body: { translations: { en:{title,slug,content,meta_description,keywords}, ... } }
 */
newsRouter.put("/:id/translations", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB(c.env)) return c.json({ error: "No database" }, 500);
    const body = await c.req.json();
    const { translations } = body || {};
    if (!translations || typeof translations !== "object") return c.json({ error: "Missing translations" }, 400);

    const upsertT = `
      INSERT INTO news_translations(news_id, locale, title, slug, content, meta_description, keywords)
      VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
      ON CONFLICT(news_id, locale) DO UPDATE SET
        title=excluded.title,
        slug=excluded.slug,
        content=excluded.content,
        meta_description=excluded.meta_description,
        keywords=excluded.keywords,
        updated_at=strftime('%Y-%m-%d %H:%M:%f','now')
    `;
    for (const [lc, tr] of Object.entries(translations)) {
      await c.env.DB.prepare(upsertT).bind(
        id,
        lc,
        tr.title || null,
        tr.slug || null,
        tr.content || null,
        tr.meta_description || null,
        tr.keywords || null
      ).run();
    }

    const translationsObj = await getAllTranslations(c.env.DB, id);
    return c.json({ translations: translationsObj, news_id: id });
  } catch (err) {
    console.error("Error updating translations:", err);
    return c.json({ error: "Failed to update translations" }, 500);
  }
});

/**
 * GET /api/news/:id/translations
 * Lấy toàn bộ translations theo id
 */
newsRouter.get("/:id/translation", async (c) => {
  const id = c.req.param("id")
  const locale = (c.req.query("locale") || "vi").toLowerCase()

  try {
    const row = await c.env.DB.prepare(
      `SELECT 
        n.id,
        nt.locale,
        nt.title,
        nt.slug,
        nt.content,
        nt.meta_description,
        nt.keywords,
        nt.updated_at
       FROM news n
       JOIN news_translations nt ON nt.news_id = n.id
       WHERE n.id = ? AND nt.locale = ?`
    )
      .bind(id, locale)
      .first()

    if (!row) {
      return c.json({ error: "Translation not found" }, 404)
    }

    return c.json(row)
  } catch (err) {
    console.error(err)
    return c.json({ error: "Internal server error" }, 500)
  }
})

/**
 * DELETE /api/news/:id
 * Xoá bài viết (CASCADE sẽ xoá translations nếu ON DELETE CASCADE)
 */
newsRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB(c.env)) return c.json({ error: "No database" }, 500);
    await c.env.DB.prepare(`DELETE FROM news WHERE id = ?`).bind(id).run();
    return c.json({ success: true, id });
  } catch (err) {
    console.error("Error deleting news:", err);
    return c.json({ error: "Failed to delete news" }, 500);
  }
});

export default newsRouter;