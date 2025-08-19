// src/routes/productsRouter.js
import { Hono } from "hono";

// Helpers
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

// Lấy chi tiết qua id hoặc slug (đã i18n)
const findProductByIdOrSlug = async (db, idOrSlug, locale) => {
  const isNumericId = /^\d+$/.test(idOrSlug);
  const sql = `
    SELECT
      p.id,
      COALESCE(pt.title, p.title)             AS title,
      p.slug                                  AS slug,
      COALESCE(pt.description, p.description) AS description,
      COALESCE(pt.content, p.content)         AS content,
      p.image_url,
      p.created_at,
      p.updated_at,

      s.id                                    AS subcategory_id,
      COALESCE(sct.name, s.name)              AS subcategory_name,
      s.slug                                  AS subcategory_slug,

      pc.id                                   AS parent_id,
      COALESCE(pct.name, pc.name)             AS parent_name,
      pc.slug                                 AS parent_slug
    FROM products p
    LEFT JOIN products_translations pt
      ON pt.product_id = p.id AND pt.locale = ?
    LEFT JOIN subcategories s
      ON s.id = p.subcategory_id
    LEFT JOIN subcategories_translations sct
      ON sct.sub_id = s.id AND sct.locale = ?
    LEFT JOIN parent_categories pc
      ON pc.id = s.parent_id
    LEFT JOIN parent_categories_translations pct
      ON pct.parent_id = pc.id AND pct.locale = ?
    WHERE ${isNumericId ? "p.id = ?" : "p.slug = ?"}
    LIMIT 1
  `;
  return db
    .prepare(sql)
    .bind(locale, locale, locale, isNumericId ? Number(idOrSlug) : idOrSlug)
    .first();
};

export const productsRouter = new Hono();

/**
 * GET /api/products
 * Query:
 *  - locale=vi|en|...
 *  - parent_id, parent_slug
 *  - subcategory_id, sub_slug
 *  - q: tìm theo title/description/content (ưu tiên bản dịch)
 *  - limit, offset
 */
productsRouter.get("/", async (c) => {
  const { parent_id, parent_slug, subcategory_id, sub_slug, limit, offset, q } = c.req.query();

  try {
    if (!hasDB(c.env)) {
      return c.json({ products: [], source: "fallback", count: 0 });
    }

    const locale = getLocale(c);
    // Thứ tự bind: pt.locale, sct.locale, pct.locale, ...filters..., limit, offset
    const params = [locale, locale, locale];
    const conds = [];

    if (subcategory_id) {
      conds.push("p.subcategory_id = ?");
      params.push(Number(subcategory_id));
    }
    if (sub_slug) {
      conds.push("s.slug = ?");
      params.push(String(sub_slug));
    }
    if (parent_id) {
      conds.push("pc.id = ?");
      params.push(Number(parent_id));
    }
    if (parent_slug) {
      conds.push("pc.slug = ?");
      params.push(String(parent_slug));
    }

    if (q && q.trim()) {
      const kw = `%${q.trim()}%`;
      conds.push(`(
        (pt.title IS NOT NULL AND pt.title LIKE ?)
        OR (pt.description IS NOT NULL AND pt.description LIKE ?)
        OR (pt.content IS NOT NULL AND pt.content LIKE ?)
        OR (pt.title IS NULL AND p.title LIKE ?)
        OR (pt.description IS NULL AND p.description LIKE ?)
        OR (pt.content IS NULL AND p.content LIKE ?)
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
        p.id,
        COALESCE(pt.title, p.title)             AS title,
        p.slug                                  AS slug,
        COALESCE(pt.description, p.description) AS description,
        COALESCE(pt.content, p.content)         AS content,
        p.image_url,
        p.created_at,
        p.updated_at,

        s.id                                    AS subcategory_id,
        COALESCE(sct.name, s.name)              AS subcategory_name,
        s.slug                                  AS subcategory_slug,

        pc.id                                   AS parent_id,
        COALESCE(pct.name, pc.name)             AS parent_name,
        pc.slug                                 AS parent_slug
      FROM products p
      LEFT JOIN products_translations pt
        ON pt.product_id = p.id AND pt.locale = ?
      LEFT JOIN subcategories s
        ON s.id = p.subcategory_id
      LEFT JOIN subcategories_translations sct
        ON sct.sub_id = s.id AND sct.locale = ?
      LEFT JOIN parent_categories pc
        ON pc.id = s.parent_id
      LEFT JOIN parent_categories_translations pct
        ON pct.parent_id = pc.id AND pct.locale = ?
      ${where}
      ORDER BY p.created_at DESC
      ${limitSql}
      ${offsetSql}
    `;

    const result = await c.env.DB.prepare(sql).bind(...params).all();
    const products = result?.results ?? [];

    return c.json({
      products,
      count: products.length,
      source: "database",
      locale
      // debug: { sql, params }
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    return c.json({ error: "Failed to fetch products" }, 500);
  }
});

/**
 * GET /api/products/:idOrSlug
 * Query: locale
 */
productsRouter.get("/:idOrSlug", async (c) => {
  const idOrSlug = c.req.param("idOrSlug");
  try {
    if (!hasDB(c.env)) return c.json({ error: "Database not available" }, 503);

    const locale = getLocale(c);
    const product = await findProductByIdOrSlug(c.env.DB, idOrSlug, locale);
    if (!product) return c.json({ error: "Product not found" }, 404);

    return c.json({ product, source: "database", locale });
  } catch (err) {
    console.error("Error fetching product:", err);
    return c.json({ error: "Failed to fetch product" }, 500);
  }
});

/**
 * POST /api/products
 * Body:
 * {
 *   title: string,
 *   slug?: string,               // nếu không gửi, BE tự sinh từ title
 *   description?: string,
 *   content: string,
 *   image_url?: string,
 *   subcategory_id?: number,     // có thể null
 *   translations?: {             // optional: upsert cùng lúc
 *     en?: { title?, description?, content? },
 *     ja?: { ... },
 *     ...
 *   }
 * }
 */
productsRouter.post("/", async (c) => {
  try {
    if (!hasDB(c.env)) return c.json({ error: "Database not available" }, 503);

    const body = await c.req.json();
    const {
      title,
      slug: rawSlug,
      description,
      content,
      image_url,
      subcategory_id,
      translations
    } = body || {};

    if (!title?.trim() || !content?.trim()) {
      return c.json({ error: "Missing required fields: title, content" }, 400);
    }

    const slug = (rawSlug?.trim() || slugify(title)).toLowerCase();

    if (subcategory_id !== undefined && subcategory_id !== null) {
      const sub = await c.env.DB
        .prepare("SELECT id FROM subcategories WHERE id = ?")
        .bind(Number(subcategory_id))
        .first();
      if (!sub) return c.json({ error: "subcategory_id not found" }, 400);
    }

    const sql = `
      INSERT INTO products (title, slug, description, content, image_url, subcategory_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const runRes = await c.env.DB
      .prepare(sql)
      .bind(
        title.trim(),
        slug,
        description || null,
        content,
        image_url || null,
        subcategory_id == null ? null : Number(subcategory_id)
      )
      .run();

    if (!runRes.success) throw new Error("Insert failed");
    const newId = runRes.meta?.last_row_id;

    // Upsert translations nếu có
    if (translations && typeof translations === "object") {
      const upsertT = `
        INSERT INTO products_translations(product_id, locale, title, description, content)
        VALUES (?1, ?2, ?3, ?4, ?5)
        ON CONFLICT(product_id, locale) DO UPDATE SET
          title       = COALESCE(excluded.title, title),
          description = COALESCE(excluded.description, description),
          content     = COALESCE(excluded.content, content),
          updated_at  = CURRENT_TIMESTAMP
      `;
      for (const [lc, tr] of Object.entries(translations)) {
        await c.env.DB.prepare(upsertT).bind(
          newId,
          String(lc).toLowerCase(),
          tr?.title ?? null,
          tr?.description ?? null,
          tr?.content ?? null
        ).run();
      }
    }

    const locale = getLocale(c);
    const product = await findProductByIdOrSlug(c.env.DB, String(newId), locale);
    return c.json({ product, source: "database", locale }, 201);
  } catch (err) {
    console.error("Error adding product:", err);
    const msg =
      String(err?.message || "").toLowerCase().includes("unique") ||
        String(err).toLowerCase().includes("unique")
        ? "Slug already exists"
        : "Failed to add product";
    return c.json({ error: msg }, 500);
  }
});

/**
 * PUT /api/products/:id
 * Body:
 * {
 *   title?, slug?, description?, content?, image_url?, subcategory_id?,
 *   translations?: { lc: { title?, description?, content? } }
 * }
 */
productsRouter.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB(c.env)) return c.json({ error: "Database not available" }, 503);

    const body = await c.req.json();
    const {
      title,
      slug,
      description,
      content,
      image_url,
      subcategory_id,
      translations
    } = body || {};

    if (subcategory_id !== undefined && subcategory_id !== null) {
      const sub = await c.env.DB
        .prepare("SELECT id FROM subcategories WHERE id = ?")
        .bind(Number(subcategory_id))
        .first();
      if (!sub) return c.json({ error: "subcategory_id not found" }, 400);
    }

    const sets = [];
    const params = [];
    if (title !== undefined) { sets.push("title = ?"); params.push(title); }
    if (slug !== undefined) { sets.push("slug = ?"); params.push(slug); }
    if (description !== undefined) { sets.push("description = ?"); params.push(description); }
    if (content !== undefined) { sets.push("content = ?"); params.push(content); }
    if (image_url !== undefined) { sets.push("image_url = ?"); params.push(image_url); }
    if (subcategory_id !== undefined) {
      sets.push("subcategory_id = ?");
      params.push(subcategory_id == null ? null : Number(subcategory_id));
    }

    if (sets.length) {
      const sql = `
        UPDATE products
        SET ${sets.join(", ")}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      params.push(id);
      const res = await c.env.DB.prepare(sql).bind(...params).run();
      if ((res.meta?.changes || 0) === 0) return c.json({ error: "Product not found" }, 404);
    }

    if (translations && typeof translations === "object") {
      const upsertT = `
        INSERT INTO products_translations(product_id, locale, title, description, content)
        VALUES (?1, ?2, ?3, ?4, ?5)
        ON CONFLICT(product_id, locale) DO UPDATE SET
          title       = COALESCE(excluded.title, title),
          description = COALESCE(excluded.description, description),
          content     = COALESCE(excluded.content, content),
          updated_at  = CURRENT_TIMESTAMP
      `;
      for (const [lc, tr] of Object.entries(translations)) {
        await c.env.DB.prepare(upsertT).bind(
          id,
          String(lc).toLowerCase(),
          tr?.title ?? null,
          tr?.description ?? null,
          tr?.content ?? null
        ).run();
      }
    }

    const locale = getLocale(c);
    const product = await findProductByIdOrSlug(c.env.DB, String(id), locale);
    return c.json({ product, source: "database", locale });
  } catch (err) {
    console.error("Error updating product:", err);
    const msg =
      String(err?.message || "").toLowerCase().includes("unique") ||
        String(err).toLowerCase().includes("unique")
        ? "Slug already exists"
        : "Failed to update product";
    return c.json({ error: msg }, 500);
  }
});

/**
 * PUT /api/products/:id/translations
 * Body: { translations: { en:{title?,description?,content?}, ja:{...} } }
 */
productsRouter.put("/:id/translations", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB(c.env)) return c.json({ error: "Database not available" }, 503);

    const body = await c.req.json();
    const translations = body?.translations;
    if (!translations || typeof translations !== "object") {
      return c.json({ error: "Missing translations" }, 400);
    }

    const upsertT = `
      INSERT INTO products_translations(product_id, locale, title, description, content)
      VALUES (?1, ?2, ?3, ?4, ?5)
      ON CONFLICT(product_id, locale) DO UPDATE SET
        title       = COALESCE(excluded.title, title),
        description = COALESCE(excluded.description, description),
        content     = COALESCE(excluded.content, content),
        updated_at  = CURRENT_TIMESTAMP
    `;
    for (const [lc, tr] of Object.entries(translations)) {
      await c.env.DB.prepare(upsertT).bind(
        id,
        String(lc).toLowerCase(),
        tr?.title ?? null,
        tr?.description ?? null,
        tr?.content ?? null
      ).run();
    }
    return c.json({ ok: true });
  } catch (err) {
    console.error("Error upserting product translations:", err);
    return c.json({ error: "Failed to upsert translations" }, 500);
  }
});

/**
 * GET /api/products/:id/translations
 * -> { translations: { locale: { title, description, content } } }
 */
productsRouter.get("/:id/translations", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB(c.env)) return c.json({ error: "Database not available" }, 503);

    const sql = `
      SELECT locale, title, description, content
      FROM products_translations
      WHERE product_id = ?
      ORDER BY locale ASC
    `;
    const { results = [] } = await c.env.DB.prepare(sql).bind(id).all();
    const translations = {};
    for (const row of results) {
      translations[row.locale] = {
        title: row.title || "",
        description: row.description || "",
        content: row.content || ""
      };
    }
    return c.json({ translations });
  } catch (err) {
    console.error("Error fetching product translations:", err);
    return c.json({ error: "Failed to fetch translations" }, 500);
  }
});

/**
 * DELETE /api/products/:id
 */
productsRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB(c.env)) return c.json({ error: "Database not available" }, 503);

    const existing = await c.env.DB
      .prepare("SELECT id FROM products WHERE id = ?")
      .bind(id)
      .first();
    if (!existing) return c.json({ error: "Product not found" }, 404);

    const res = await c.env.DB
      .prepare("DELETE FROM products WHERE id = ?")
      .bind(id)
      .run();

    if ((res.meta?.changes || 0) > 0) {
      return c.json({ success: true, message: "Product deleted successfully" });
    }
    return c.json({ error: "Product not found" }, 404);
  } catch (err) {
    console.error("Error deleting product:", err);
    return c.json({ error: "Failed to delete product" }, 500);
  }
});

export default productsRouter;
