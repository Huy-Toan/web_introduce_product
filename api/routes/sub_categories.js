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

/**
 * GET /api/subcategories
 * Query:
 *  - locale=vi|en|...
 *  - parent_id: number
 *  - parent_slug: string
 *  - q: string (search i18n)
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
    // 1st param: sct.locale, 2nd: pct.locale
    const params = [locale, locale];

    if (parent_id) {
      conds.push("sc.parent_id = ?");
      params.push(Number(parent_id));
    }
    if (parent_slug) {
      conds.push("pc.slug = ?");
      params.push(String(parent_slug));
    }
    if (q && q.trim()) {
      const kw = `%${q.trim()}%`;
      conds.push(`(
        (sct.name IS NOT NULL AND sct.name LIKE ?)
        OR (sct.description IS NOT NULL AND sct.description LIKE ?)
        OR (sct.name IS NULL AND sc.name LIKE ?)
        OR (sct.description IS NULL AND sc.description LIKE ?)
      )`);
      params.push(kw, kw, kw, kw);
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
        COALESCE(sct.name, sc.name) AS name,
        sc.slug,
        COALESCE(sct.description, sc.description) AS description,
        sc.image_url,
        sc.created_at,
        COALESCE(pct.name, pc.name) AS parent_name,
        pc.slug AS parent_slug
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
 */
subCategoriesRouter.get("/:idOrSlug", async (c) => {
  const idOrSlug = c.req.param("idOrSlug");
  const { with_counts } = c.req.query();
  try {
    if (!hasDB(c.env)) return c.json({ error: "Database not available" }, 503);

    const locale = getLocale(c);
    const isNumeric = /^\d+$/.test(idOrSlug);

    const sql = `
      SELECT
        sc.id,
        sc.parent_id,
        COALESCE(sct.name, sc.name) AS name,
        sc.slug,
        COALESCE(sct.description, sc.description) AS description,
        sc.image_url,
        sc.created_at,
        COALESCE(pct.name, pc.name) AS parent_name,
        pc.slug AS parent_slug
      FROM subcategories sc
      LEFT JOIN subcategories_translations sct
        ON sct.sub_id = sc.id AND sct.locale = ?
      JOIN parent_categories pc ON pc.id = sc.parent_id
      LEFT JOIN parent_categories_translations pct
        ON pct.parent_id = pc.id AND pct.locale = ?
      WHERE ${isNumeric ? "sc.id = ?" : "sc.slug = ?"}
      LIMIT 1
    `;
    const subcat = await c.env.DB.prepare(sql)
      .bind(locale, locale, isNumeric ? Number(idOrSlug) : idOrSlug)
      .first();

    if (!subcat) return c.json({ error: "Subcategory not found" }, 404);

    if (String(with_counts) === "1") {
      const cnt = await c.env.DB
        .prepare(`SELECT COUNT(*) AS product_count FROM products WHERE subcategory_id = ?`)
        .bind(subcat.id)
        .first();
      subcat.product_count = Number(cnt?.product_count || 0);
    }

    return c.json({ subcategory: subcat, source: "database", locale });
  } catch (err) {
    console.error("Error fetching subcategory:", err);
    return c.json({ error: "Failed to fetch subcategory" }, 500);
  }
});

/**
 * POST /api/subcategories
 * body: { parent_id, name, slug?, description?, image_url?, translations? }
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

    // Upsert translations nếu có
    if (translations && typeof translations === "object") {
      const upsertT = `
        INSERT INTO subcategories_translations(sub_id, locale, name, description)
        VALUES (?1, ?2, ?3, ?4)
        ON CONFLICT(sub_id, locale) DO UPDATE SET
          name=COALESCE(excluded.name, name),
          description=COALESCE(excluded.description, description),
          updated_at=CURRENT_TIMESTAMP
      `;
      for (const [lc, tr] of Object.entries(translations)) {
        await c.env.DB
          .prepare(upsertT)
          .bind(newId, String(lc).toLowerCase(), tr?.name ?? null, tr?.description ?? null)
          .run();
      }
    }

    const locale = getLocale(c);
    const subcat = await c.env.DB
      .prepare(
        `SELECT
           sc.id,
           sc.parent_id,
           COALESCE(sct.name, sc.name) AS name,
           sc.slug,
           COALESCE(sct.description, sc.description) AS description,
           sc.image_url,
           sc.created_at,
           COALESCE(pct.name, pc.name) AS parent_name,
           pc.slug AS parent_slug
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
      params.push(slug);
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

    // Upsert translations nếu có
    if (translations && typeof translations === "object") {
      const upsertT = `
        INSERT INTO subcategories_translations(sub_id, locale, name, description)
        VALUES (?1, ?2, ?3, ?4)
        ON CONFLICT(sub_id, locale) DO UPDATE SET
          name=COALESCE(excluded.name, name),
          description=COALESCE(excluded.description, description),
          updated_at=CURRENT_TIMESTAMP
      `;
      for (const [lc, tr] of Object.entries(translations)) {
        await c.env.DB
          .prepare(upsertT)
          .bind(id, String(lc).toLowerCase(), tr?.name ?? null, tr?.description ?? null)
          .run();
      }
    }

    const locale = getLocale(c);
    const subcat = await c.env.DB
      .prepare(
        `SELECT
           sc.id,
           sc.parent_id,
           COALESCE(sct.name, sc.name) AS name,
           sc.slug,
           COALESCE(sct.description, sc.description) AS description,
           sc.image_url,
           sc.created_at,
           COALESCE(pct.name, pc.name) AS parent_name,
           pc.slug AS parent_slug
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
 * body: { translations: { en:{name?,description?}, ja:{...} } }
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
      INSERT INTO subcategories_translations(sub_id, locale, name, description)
      VALUES (?1, ?2, ?3, ?4)
      ON CONFLICT(sub_id, locale) DO UPDATE SET
        name=COALESCE(excluded.name, name),
        description=COALESCE(excluded.description, description),
        updated_at=CURRENT_TIMESTAMP
    `;
    for (const [lc, tr] of Object.entries(translations)) {
      await c.env.DB
        .prepare(upsertT)
        .bind(id, String(lc).toLowerCase(), tr?.name ?? null, tr?.description ?? null)
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
 * -> { translations: { locale: { name, description } } }
 */
subCategoriesRouter.get("/:id/translations", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB(c.env)) return c.json({ error: "Database not available" }, 503);

    const sql = `
      SELECT locale, name, description
      FROM subcategories_translations
      WHERE sub_id = ?
      ORDER BY locale ASC
    `;
    const { results = [] } = await c.env.DB.prepare(sql).bind(id).all();
    const translations = {};
    for (const row of results) {
      translations[row.locale] = {
        name: row.name || "",
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
 */
subCategoriesRouter.get("/:slug/products", async (c) => {
  const slug = c.req.param("slug");
  try {
    if (!hasDB(c.env)) {
      return c.json({ products: [], source: "fallback", count: 0 });
    }
    const locale = getLocale(c);

    const sql = `
      SELECT
        p.id,
        COALESCE(pt.title, p.title)               AS title,
        p.slug                                    AS product_slug,
        COALESCE(pt.description, p.description)   AS description,
        COALESCE(pt.content, p.content)           AS content,
        p.image_url,
        p.created_at,
        p.updated_at,
        s.id      AS subcategory_id,
        COALESCE(sct.name, s.name) AS subcategory_name,
        s.slug    AS subcategory_slug,
        pc.id     AS parent_id,
        COALESCE(pct.name, pc.name) AS parent_name,
        pc.slug   AS parent_slug
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
      WHERE s.slug = ?
      ORDER BY p.created_at DESC
    `;
    const res = await c.env.DB.prepare(sql).bind(locale, locale, locale, slug).all();
    const products = res?.results ?? [];
    return c.json({ products, count: products.length, source: "database", locale });
  } catch (err) {
    console.error("Error fetching products by subcategory:", err);
    return c.json({ error: "Failed to fetch products by subcategory" }, 500);
  }
});

export default subCategoriesRouter;
