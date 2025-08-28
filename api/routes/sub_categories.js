// src/routes/subCategoriesRouter.js
import { Hono } from "hono";

const DEFAULT_LOCALE = "vi";
const getLocale = (c) =>
  (c.req.query("locale") || DEFAULT_LOCALE).toLowerCase();

const hasDB = (env) => Boolean(env?.DB) || Boolean(env?.DB_AVAILABLE);

const slugify = (s = "") =>
  s
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export const subCategoriesRouter = new Hono();

/* ---------------------------------------------
 * Helper: resolve subcategory id from idOrSlug
 * - Hỗ trợ: id số, slug gốc, slug dịch (theo ?locale)
 * --------------------------------------------- */
async function resolveSubId(c, idOrSlug) {
  const isNumeric = /^\d+$/.test(idOrSlug);
  if (isNumeric) return Number(idOrSlug);

  const locale = getLocale(c);
  const findSql = `
    SELECT sc.id
    FROM subcategories sc
    LEFT JOIN subcategories_translations sct
      ON sct.sub_id = sc.id AND sct.locale = ?
    WHERE sc.slug = ? OR sct.slug = ?
    LIMIT 1
  `;
  const row = await c.env.DB
    .prepare(findSql)
    .bind(locale, idOrSlug, idOrSlug)
    .first();
  return row?.id ?? null;
}

/**
 * GET /api/subcategories
 * Query:
 *  - locale=vi|en|...
 *  - parent_id: number
 *  - parent_slug: string (hỗ trợ slug dịch)
 *  - q: string (search i18n, gồm slug)
 *  - with_counts=1
 *  - limit, offset
 */
subCategoriesRouter.get("/", async (c) => {
  const { parent_id, parent_slug, limit, offset, q, with_counts } = c.req.query();
  try {
    if (!hasDB(c.env)) {
      return c.json({ subcategories: [], source: "fallback", count: 0 });
    }

    const locale = getLocale(c);
    const conds = [];
    const params = [locale, locale];

    if (parent_id) {
      conds.push("sc.parent_id = ?");
      params.push(Number(parent_id));
    }
    if (parent_slug) {
      conds.push("(pc.slug = ? OR pct.slug = ?)");
      params.push(String(parent_slug), String(parent_slug));
    }
    if (q && q.trim()) {
      const kw = `%${q.trim()}%`;
      conds.push(`(
        (sct.name IS NOT NULL AND sct.name LIKE ?)
        OR (sct.description IS NOT NULL AND sct.description LIKE ?)
        OR (sct.slug IS NOT NULL AND sct.slug LIKE ?)
        OR (sct.name IS NULL AND sc.name LIKE ?)
        OR (sct.description IS NULL AND sc.description LIKE ?)
        OR (sct.slug IS NULL AND sc.slug LIKE ?)
      )`);
      params.push(kw, kw, kw, kw, kw, kw);
    }

    const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
    const hasLimit = Number.isFinite(Number(limit));
    const hasOffset = Number.isFinite(Number(offset));
    const limitSql = hasLimit ? " LIMIT ?" : "";
    const offsetSql = hasOffset ? " OFFSET ?" : "";

    if (hasLimit) params.push(Number(limit));
    if (hasOffset) params.push(Number(offset));

    const sql = `
      SELECT
        sc.id,
        sc.parent_id,
        COALESCE(sct.name, sc.name)               AS name,
        COALESCE(sct.slug, sc.slug)               AS slug,
        COALESCE(sct.description, sc.description) AS description,
        sc.image_url,
        sc.created_at,
        COALESCE(pct.name, pc.name)               AS parent_name,
        COALESCE(pct.slug, pc.slug)               AS parent_slug
      FROM subcategories sc
      LEFT JOIN subcategories_translations sct
        ON sct.sub_id = sc.id AND sct.locale = ?
      JOIN parent_categories pc ON pc.id = sc.parent_id
      LEFT JOIN parent_categories_translations pct
        ON pct.parent_id = pc.id AND pct.locale = ?
      ${where}
      ORDER BY sc.created_at DESC
      ${limitSql}
      ${offsetSql}
    `;

    const result = await c.env.DB.prepare(sql).bind(...params).all();
    let subcategories = result?.results ?? [];

    // with_counts (giữ nguyên logic)
    if (String(with_counts) === "1" && subcategories.length) {
      const ids = subcategories.map(s => s.id);
      const placeholders = ids.map(() => "?").join(",");
      const cntSql = `
        SELECT sc.id AS sub_id, COUNT(p.id) AS product_count
        FROM subcategories sc
        LEFT JOIN products p ON p.subcategory_id = sc.id
        WHERE sc.id IN (${placeholders})
        GROUP BY sc.id
      `;
      const cntRes = await c.env.DB.prepare(cntSql).bind(...ids).all();
      const counts = (cntRes?.results ?? []).reduce((acc, r) => {
        acc[r.sub_id] = r.product_count || 0;
        return acc;
      }, {});
      subcategories = subcategories.map(s => ({ ...s, product_count: counts[s.id] || 0 }));
    }

    // build full URL từ key
    const base = (c.env.DISPLAY_BASE_URL || c.env.PUBLIC_R2_URL || "").replace(/\/+$/, "");
    subcategories = subcategories.map(s => ({
      ...s,
      image_url: s.image_url ? `${base}/${s.image_url}` : null,
    }));

    return c.json({
      subcategories,
      count: subcategories.length,
      source: "database",
      locale
    });
  } catch (err) {
    console.error("Error fetching subcategories:", err);
    return c.json({ error: "Failed to fetch subcategories" }, 500);
  }
});


/**
 * GET /api/subcategories/:idOrSlug
 * Query: locale, with_counts
 * - Hỗ trợ resolve bằng slug dịch
 */
subCategoriesRouter.get("/:idOrSlug", async (c) => {
  const idOrSlug = c.req.param("idOrSlug");
  const { with_counts } = c.req.query();
  try {
    if (!hasDB(c.env)) return c.json({ error: "Database not available" }, 503);

    const locale = getLocale(c);
    const subId = await resolveSubId(c, idOrSlug);
    if (!subId) return c.json({ error: "Subcategory not found" }, 404);

    const sql = `
      SELECT
        sc.id,
        sc.parent_id,
        COALESCE(sct.name, sc.name)               AS name,
        COALESCE(sct.slug, sc.slug)               AS slug,
        COALESCE(sct.description, sc.description) AS description,
        sc.image_url,
        sc.created_at,
        COALESCE(pct.name, pc.name)               AS parent_name,
        COALESCE(pct.slug, pc.slug)               AS parent_slug
      FROM subcategories sc
      LEFT JOIN subcategories_translations sct
        ON sct.sub_id = sc.id AND sct.locale = ?
      JOIN parent_categories pc ON pc.id = sc.parent_id
      LEFT JOIN parent_categories_translations pct
        ON pct.parent_id = pc.id AND pct.locale = ?
      WHERE sc.id = ?
      LIMIT 1
    `;
    const raw = await c.env.DB
      .prepare(sql)
      .bind(locale, locale, subId)
      .first();

    if (!raw) return c.json({ error: "Subcategory not found" }, 404);

    let product_count = undefined;
    if (String(with_counts) === "1") {
      const cnt = await c.env.DB
        .prepare(`SELECT COUNT(*) AS product_count FROM products WHERE subcategory_id = ?`)
        .bind(raw.id)
        .first();
      product_count = Number(cnt?.product_count || 0);
    }

    // build full URL từ key
    const base = (c.env.DISPLAY_BASE_URL || c.env.PUBLIC_R2_URL || "").replace(/\/+$/, "");
    const subcategory = {
      ...raw,
      image_url: raw.image_url ? `${base}/${raw.image_url}` : null,
      ...(product_count !== undefined ? { product_count } : {}),
    };

    return c.json({ subcategory, source: "database", locale });
  } catch (err) {
    console.error("Error fetching subcategory:", err);
    return c.json({ error: "Failed to fetch subcategory" }, 500);
  }
});


/**
 * POST /api/subcategories
 * body: { parent_id, name, slug?, description?, image_url?, translations? }
 * translations: { en?: { name?, slug?, description? }, ... }
 */
subCategoriesRouter.post("/", async (c) => {
  try {
    if (!hasDB(c.env)) return c.json({ error: "Database not available" }, 503);

    const body = await c.req.json();
    const { parent_id, name, slug: rawSlug, description, image_url, translations } = body || {};

    if (!parent_id) return c.json({ error: "Missing required field: parent_id" }, 400);
    if (!name?.trim()) return c.json({ error: "Missing required field: name" }, 400);

    // Validate parent exists
    const parent = await c.env.DB
      .prepare("SELECT id FROM parent_categories WHERE id = ?")
      .bind(Number(parent_id))
      .first();
    if (!parent) return c.json({ error: "parent_id not found" }, 400);

    const slug = (rawSlug?.trim() || slugify(name)).toLowerCase();

    const sql = `
      INSERT INTO subcategories (parent_id, name, slug, description, image_url)
      VALUES (?, ?, ?, ?, ?)
    `;
    const res = await c.env.DB
      .prepare(sql)
      .bind(
        Number(parent_id),
        name.trim(),
        slug,
        description || null,
        image_url || null
      )
      .run();

    if (!res.success) throw new Error("Insert failed");
    const newId = res.meta?.last_row_id;

    // Upsert translations (kèm slug)
    if (translations && typeof translations === "object") {
      const upsertT = `
        INSERT INTO subcategories_translations(sub_id, locale, name, slug, description)
        VALUES (?1, ?2, ?3, ?4, ?5)
        ON CONFLICT(sub_id, locale) DO UPDATE SET
          name        = COALESCE(excluded.name, name),
          slug        = COALESCE(excluded.slug, slug),
          description = COALESCE(excluded.description, description),
          updated_at  = CURRENT_TIMESTAMP
      `;
      for (const [lc, tr] of Object.entries(translations)) {
        const tName = tr?.name ?? null;
        const tSlug = tr?.slug ? slugify(tr.slug) : tName ? slugify(tName) : null;
        await c.env.DB
          .prepare(upsertT)
          .bind(newId, String(lc).toLowerCase(), tName, tSlug, tr?.description ?? null)
          .run();
      }
    }

    const locale = getLocale(c);
    const subcat = await c.env.DB
      .prepare(
        `SELECT
           sc.id,
           sc.parent_id,
           COALESCE(sct.name, sc.name)               AS name,
           COALESCE(sct.slug, sc.slug)               AS slug,
           COALESCE(sct.description, sc.description) AS description,
           sc.image_url,
           sc.created_at,
           COALESCE(pct.name, pc.name)               AS parent_name,
           COALESCE(pct.slug, pc.slug)               AS parent_slug
         FROM subcategories sc
         LEFT JOIN subcategories_translations sct
           ON sct.sub_id = sc.id AND sct.locale = ?
         JOIN parent_categories pc ON pc.id = sc.parent_id
         LEFT JOIN parent_categories_translations pct
           ON pct.parent_id = pc.id AND pct.locale = ?
         WHERE sc.id = ?`
      )
      .bind(locale, locale, newId)
      .first();

    return c.json({ subcategory: subcat, source: "database", locale }, 201);
  } catch (err) {
    console.error("Error creating subcategory:", err);
    const msg =
      String(err?.message || "").toLowerCase().includes("unique") ||
        String(err).toLowerCase().includes("unique")
        ? "Name or Slug already exists in this parent"
        : "Failed to create subcategory";
    return c.json({ error: msg }, 500);
  }
});

/**
 * PUT /api/subcategories/:id
 * body: { parent_id?, name?, slug?, description?, image_url?, translations? }
 * translations: { en?: { name?, slug?, description? }, ... }
 */
subCategoriesRouter.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB(c.env)) return c.json({ error: "Database not available" }, 503);

    const body = await c.req.json();
    const { parent_id, name, slug, description, image_url, translations } = body || {};

    // Validate parent nếu có truyền
    if (parent_id !== undefined && parent_id !== null) {
      const parent = await c.env.DB
        .prepare("SELECT id FROM parent_categories WHERE id = ?")
        .bind(Number(parent_id))
        .first();
      if (!parent) return c.json({ error: "parent_id not found" }, 400);
    }

    const sets = [];
    const params = [];

    if (parent_id !== undefined) {
      sets.push("parent_id = ?");
      params.push(parent_id === null ? null : Number(parent_id));
    }
    if (name !== undefined) {
      sets.push("name = ?");
      params.push(name);
    }
    if (slug !== undefined) {
      sets.push("slug = ?");
      params.push(slugify(slug));
    }
    if (description !== undefined) {
      sets.push("description = ?");
      params.push(description);
    }
    if (image_url !== undefined) {
      sets.push("image_url = ?");
      params.push(image_url);
    }

    if (sets.length) {
      const sql = `UPDATE subcategories SET ${sets.join(", ")} WHERE id = ?`;
      params.push(id);
      const res = await c.env.DB.prepare(sql).bind(...params).run();
      if ((res.meta?.changes || 0) === 0) return c.json({ error: "Subcategory not found" }, 404);
    }

    // Upsert translations (kèm slug)
    if (translations && typeof translations === "object") {
      const upsertT = `
        INSERT INTO subcategories_translations(sub_id, locale, name, slug, description)
        VALUES (?1, ?2, ?3, ?4, ?5)
        ON CONFLICT(sub_id, locale) DO UPDATE SET
          name        = COALESCE(excluded.name, name),
          slug        = COALESCE(excluded.slug, slug),
          description = COALESCE(excluded.description, description),
          updated_at  = CURRENT_TIMESTAMP
      `;
      for (const [lc, tr] of Object.entries(translations)) {
        const tName = tr?.name ?? null;
        const tSlug = tr?.slug ? slugify(tr.slug) : tName ? slugify(tName) : null;
        await c.env.DB
          .prepare(upsertT)
          .bind(id, String(lc).toLowerCase(), tName, tSlug, tr?.description ?? null)
          .run();
      }
    }

    const locale = getLocale(c);
    const subcat = await c.env.DB
      .prepare(
        `SELECT
           sc.id,
           sc.parent_id,
           COALESCE(sct.name, sc.name)               AS name,
           COALESCE(sct.slug, sc.slug)               AS slug,
           COALESCE(sct.description, sc.description) AS description,
           sc.image_url,
           sc.created_at,
           COALESCE(pct.name, pc.name)               AS parent_name,
           COALESCE(pct.slug, pc.slug)               AS parent_slug
         FROM subcategories sc
         LEFT JOIN subcategories_translations sct
           ON sct.sub_id = sc.id AND sct.locale = ?
         JOIN parent_categories pc ON pc.id = sc.parent_id
         LEFT JOIN parent_categories_translations pct
           ON pct.parent_id = pc.id AND pct.locale = ?
         WHERE sc.id = ?`
      )
      .bind(locale, locale, id)
      .first();

    return c.json({ subcategory: subcat, source: "database", locale });
  } catch (err) {
    console.error("Error updating subcategory:", err);
    const msg =
      String(err?.message || "").toLowerCase().includes("unique") ||
        String(err).toLowerCase().includes("unique")
        ? "Name or Slug already exists in this parent"
        : "Failed to update subcategory";
    return c.json({ error: msg }, 500);
  }
});

/**
 * PUT /api/subcategories/:id/translations
 * body: { translations: { en:{name?,slug?,description?}, ja:{...} } }
 */
subCategoriesRouter.put("/:id/translations", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB(c.env)) return c.json({ error: "Database not available" }, 503);
    const body = await c.req.json();
    const translations = body?.translations;
    if (!translations || typeof translations !== "object") {
      return c.json({ error: "Missing translations" }, 400);
    }

    const upsertT = `
      INSERT INTO subcategories_translations(sub_id, locale, name, slug, description)
      VALUES (?1, ?2, ?3, ?4, ?5)
      ON CONFLICT(sub_id, locale) DO UPDATE SET
        name        = COALESCE(excluded.name, name),
        slug        = COALESCE(excluded.slug, slug),
        description = COALESCE(excluded.description, description),
        updated_at  = CURRENT_TIMESTAMP
    `;
    for (const [lc, tr] of Object.entries(translations)) {
      const tName = tr?.name ?? null;
      const tSlug = tr?.slug ? slugify(tr.slug) : tName ? slugify(tName) : null;
      await c.env.DB
        .prepare(upsertT)
        .bind(id, String(lc).toLowerCase(), tName, tSlug, tr?.description ?? null)
        .run();
    }
    return c.json({ ok: true });
  } catch (err) {
    console.error("Error upserting subcategory translations:", err);
    return c.json({ error: "Failed to upsert translations" }, 500);
  }
});

/**
 * GET /api/subcategories/:id/translations
 * -> { translations: { locale: { name, slug, description } } }
 */
subCategoriesRouter.get("/:id/translations", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB(c.env)) return c.json({ error: "Database not available" }, 503);

    const sql = `
      SELECT locale, name, slug, description
      FROM subcategories_translations
      WHERE sub_id = ?
      ORDER BY locale ASC
    `;
    const { results = [] } = await c.env.DB.prepare(sql).bind(id).all();
    const translations = {};
    for (const row of results) {
      translations[row.locale] = {
        name: row.name || "",
        slug: row.slug || "",
        description: row.description || ""
      };
    }
    return c.json({ translations });
  } catch (err) {
    console.error("Error fetching subcategory translations:", err);
    return c.json({ error: "Failed to fetch translations" }, 500);
  }
});

/**
 * DELETE /api/subcategories/:id
 */
subCategoriesRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB(c.env)) return c.json({ error: "Database not available" }, 503);

    const existing = await c.env.DB
      .prepare("SELECT id FROM subcategories WHERE id = ?")
      .bind(id)
      .first();
    if (!existing) return c.json({ error: "Subcategory not found" }, 404);

    const res = await c.env.DB
      .prepare("DELETE FROM subcategories WHERE id = ?")
      .bind(id)
      .run();

    if ((res.meta?.changes || 0) > 0) {
      return c.json({ success: true, message: "Subcategory deleted successfully" });
    }
    return c.json({ error: "Subcategory not found" }, 404);
  } catch (err) {
    console.error("Error deleting subcategory:", err);
    return c.json({ error: "Failed to delete subcategory" }, 500);
  }
});

/**
 * GET /api/subcategories/:slug/products
 * Query: locale
 * - Hỗ trợ slug dịch: resolve sub_id trước, rồi lấy sản phẩm theo id
 */
subCategoriesRouter.get("/:slug/products", async (c) => {
  const slugOrId = c.req.param("slug");
  try {
    if (!hasDB(c.env)) {
      return c.json({ products: [], source: "fallback", count: 0 });
    }
    const locale = getLocale(c);

    const subId = await resolveSubId(c, slugOrId);
    if (!subId) return c.json({ products: [], count: 0, source: "database", locale });

    const sql = `
      SELECT
        p.id,
        COALESCE(pt.title, p.title)               AS title,
        COALESCE(pt.description, p.description)   AS description,
        COALESCE(pt.content, p.content)           AS content,
        p.slug                                    AS product_slug,
        p.image_url,              -- KEY trong DB
        p.created_at,
        p.updated_at,
        s.id      AS subcategory_id,
        COALESCE(sct.name, s.name)                AS subcategory_name,
        COALESCE(sct.slug, s.slug)                AS subcategory_slug,
        pc.id     AS parent_id,
        COALESCE(pct.name, pc.name)               AS parent_name,
        COALESCE(pct.slug, pc.slug)               AS parent_slug
      FROM products p
      LEFT JOIN products_translations pt
        ON pt.product_id = p.id AND pt.locale = ?
      JOIN subcategories s
        ON s.id = p.subcategory_id
      LEFT JOIN subcategories_translations sct
        ON sct.sub_id = s.id AND sct.locale = ?
      JOIN parent_categories pc
        ON pc.id = s.parent_id
      LEFT JOIN parent_categories_translations pct
        ON pct.parent_id = pc.id AND pct.locale = ?
      WHERE s.id = ?
      ORDER BY p.created_at DESC
    `;
    const res = await c.env.DB.prepare(sql).bind(locale, locale, locale, subId).all();
    const rows = res?.results ?? [];

    // Build full URL từ key
    const base = (c.env.DISPLAY_BASE_URL || c.env.PUBLIC_R2_URL || "").replace(/\/+$/, "");
    const products = rows.map(r => ({
      ...r,
      image_url: r.image_url ? `${base}/${r.image_url}` : null,
    }));

    return c.json({ products, count: products.length, source: "database", locale });
  } catch (err) {
    console.error("Error fetching products by subcategory:", err);
    return c.json({ error: "Failed to fetch products by subcategory" }, 500);
  }
});


export default subCategoriesRouter;
