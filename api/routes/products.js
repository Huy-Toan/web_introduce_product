<<<<<<< HEAD
// api/route/products.js
import { Hono } from "hono";

/** Utils */
=======
// src/routes/productsRouter.js
import { Hono } from "hono";

// Helpers
>>>>>>> feature/lead
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

<<<<<<< HEAD
/** Resolve product_id theo slug với ưu tiên theo locale, rồi fallback canonical */
async function resolveProductIdBySlug(db, slug, locale) {
  const sql = `
    SELECT p.id
    FROM product_translations pt
    JOIN products p ON p.id = pt.product_id
    WHERE pt.locale = ? AND pt.slug = ?
    UNION
    SELECT p2.id
    FROM products p2
    WHERE p2.slug = ?
    LIMIT 1
  `;
  const row = await db.prepare(sql).bind(locale, slug, slug).first();
  return row?.id || null;
}

/** Merge fields theo locale (JOIN + fallback) cho 1 product id */
async function getMergedProductById(db, id, locale) {
  const sql = `
    SELECT
      p.id,
      COALESCE(pt.title, p.title)                         AS title,
      COALESCE(pt.slug,  p.slug)                          AS slug,
      COALESCE(pt.short_description, p.description, '')   AS short_description,
      COALESCE(pt.content, p.content)                     AS content,
      p.description,                                      -- giữ nguyên gốc nếu cần debug
      p.image_url,
      p.category_id,
      c.name AS category_name,
      c.slug AS category_slug,
      p.created_at,
      p.updated_at
    FROM products p
    LEFT JOIN product_translations pt
      ON pt.product_id = p.id AND pt.locale = ?
    LEFT JOIN categories c
      ON c.id = p.category_id
    WHERE p.id = ?
    LIMIT 1
  `;
  return db.prepare(sql).bind(locale, id).first();
}

/** Resolve category_id theo slug (ưu tiên locale) */
async function resolveCategoryIdBySlug(db, slug, locale) {
  const sql = `
    SELECT c.id
    FROM category_translations ct
    JOIN categories c ON c.id = ct.category_id
    WHERE ct.locale = ? AND ct.slug = ?
    UNION
    SELECT c2.id
    FROM categories c2
    WHERE c2.slug = ?
    LIMIT 1
  `;
  const row = await db.prepare(sql).bind(locale, slug, slug).first();
  return row?.id || null;
}
=======
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
>>>>>>> feature/lead

export const productsRouter = new Hono();

/**
<<<<<<< HEAD
 * GET /api/products?locale=en&category_id=1&category_slug=books
 * Danh sách sản phẩm theo locale, filter theo category_id hoặc category_slug
 */
productsRouter.get("/", async (c) => {
  const { category_id, category_slug } = c.req.query();
=======
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

>>>>>>> feature/lead
  try {
    if (!hasDB(c.env)) {
      return c.json({ products: [], source: "fallback", count: 0 });
    }
    const locale = getLocale(c);

    let categoryId = null;
    if (category_slug) {
      categoryId = await resolveCategoryIdBySlug(c.env.DB, category_slug, locale);
      if (!categoryId) {
        return c.json({ products: [], count: 0, source: "database", locale });
      }
    } else if (category_id) {
      categoryId = Number(category_id);
    }

    const locale = getLocale(c);
    // Thứ tự bind: pt.locale, sct.locale, pct.locale, ...filters..., limit, offset
    const params = [locale, locale, locale];
    const conds = [];
<<<<<<< HEAD
    const params = [locale];
    if (categoryId) {
      conds.push("p.category_id = ?");
      params.push(categoryId);
    }
    const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";

    const sql = `
      SELECT
        p.id,
        COALESCE(pt.title, p.title)                       AS title,
        COALESCE(pt.slug,  p.slug)                        AS slug,
        COALESCE(pt.short_description, p.description, '') AS short_description,
        COALESCE(pt.content, p.content)                   AS content,
        p.image_url,
        p.category_id,
        c.name AS category_name,
        c.slug AS category_slug,
        p.created_at,
        p.updated_at
      FROM products p
      LEFT JOIN product_translations pt
        ON pt.product_id = p.id AND pt.locale = ?
      LEFT JOIN categories c
        ON c.id = p.category_id
=======

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
>>>>>>> feature/lead
      ${where}
      ORDER BY p.created_at DESC
      ${limitSql}
      ${offsetSql}
    `;
<<<<<<< HEAD
    const { results = [] } = await c.env.DB.prepare(sql).bind(...params).all();
=======

    const result = await c.env.DB.prepare(sql).bind(...params).all();
    const products = result?.results ?? [];

>>>>>>> feature/lead
    return c.json({
      products: results,
      count: results.length,
      source: "database",
<<<<<<< HEAD
      locale,
      debug: { sql, params },
=======
      locale
      // debug: { sql, params }
>>>>>>> feature/lead
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    return c.json({ error: "Failed to fetch products" }, 500);
  }
});

/**
<<<<<<< HEAD
 * GET /api/products/:idOrSlug?locale=en
 * Lấy 1 sản phẩm theo ID hoặc slug (ưu tiên slug theo locale)
=======
 * GET /api/products/:idOrSlug
 * Query: locale
>>>>>>> feature/lead
 */
productsRouter.get("/:idOrSlug", async (c) => {
  const idOrSlug = c.req.param("idOrSlug");
  try {
    if (!hasDB(c.env)) return c.json({ error: "Database not available" }, 503);
<<<<<<< HEAD
    const locale = getLocale(c);

    let productId = null;
    if (/^\d+$/.test(idOrSlug)) {
      productId = Number(idOrSlug);
    } else {
      productId = await resolveProductIdBySlug(c.env.DB, idOrSlug, locale);
    }
    if (!productId) return c.json({ error: "Product not found" }, 404);

    const product = await getMergedProductById(c.env.DB, productId, locale);
=======

    const locale = getLocale(c);
    const product = await findProductByIdOrSlug(c.env.DB, idOrSlug, locale);
>>>>>>> feature/lead
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
<<<<<<< HEAD
 *   slug?: string,
 *   description?: string,
 *   content: string,
 *   image_url?: string,
 *   category_id?: number|null,
 *   translations?: {
 *     en?: { title: string, slug?: string, short_description?: string, content?: string },
 *     ja?: {...}
=======
 *   slug?: string,               // nếu không gửi, BE tự sinh từ title
 *   description?: string,
 *   content: string,
 *   image_url?: string,
 *   subcategory_id?: number,     // có thể null
 *   translations?: {             // optional: upsert cùng lúc
 *     en?: { title?, description?, content? },
 *     ja?: { ... },
 *     ...
>>>>>>> feature/lead
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
<<<<<<< HEAD
      category_id,
      translations,
    } = body || {};

    if (!title || !content) {
      return c.json({ error: "Missing required fields: title, content" }, 400);
    }

    const baseSlug = rawSlug?.trim() || slugify(title);

    // Insert base product
=======
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

>>>>>>> feature/lead
    const sql = `
      INSERT INTO products (title, slug, description, content, image_url, subcategory_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const runRes = await c.env.DB
      .prepare(sql)
      .bind(
<<<<<<< HEAD
        title,
        baseSlug,
=======
        title.trim(),
        slug,
>>>>>>> feature/lead
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
<<<<<<< HEAD
        INSERT INTO product_translations(product_id, locale, title, slug, short_description, content)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6)
        ON CONFLICT(product_id, locale) DO UPDATE SET
          title=excluded.title,
          slug=excluded.slug,
          short_description=excluded.short_description,
          content=excluded.content,
          updated_at=strftime('%Y-%m-%d %H:%M:%f','now')
      `;
      for (const [lc, tr] of Object.entries(translations)) {
        const tTitle = tr?.title ?? "";
        const tSlug = tr?.slug?.trim() || slugify(tTitle || title);
        const tShort = tr?.short_description ?? (description ?? "");
        const tContent = tr?.content ?? content;
        await c.env.DB
          .prepare(upsertT)
          .bind(newId, String(lc).toLowerCase(), tTitle, tSlug, tShort, tContent)
          .run();
=======
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
>>>>>>> feature/lead
      }
    }

    const locale = getLocale(c);
<<<<<<< HEAD
    const product = await getMergedProductById(c.env.DB, newId, locale);
=======
    const product = await findProductByIdOrSlug(c.env.DB, String(newId), locale);
>>>>>>> feature/lead
    return c.json({ product, source: "database", locale }, 201);
  } catch (err) {
    console.error("Error adding product:", err);
    const msg =
<<<<<<< HEAD
      String(err?.message || "").toLowerCase().includes("unique")
=======
      String(err?.message || "").toLowerCase().includes("unique") ||
        String(err).toLowerCase().includes("unique")
>>>>>>> feature/lead
        ? "Slug already exists"
        : "Failed to add product";
    return c.json({ error: msg }, 500);
  }
});

/**
 * PUT /api/products/:id
<<<<<<< HEAD
 * Cập nhật base + (optional) translations
=======
 * Body:
 * {
 *   title?, slug?, description?, content?, image_url?, subcategory_id?,
 *   translations?: { lc: { title?, description?, content? } }
 * }
>>>>>>> feature/lead
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
<<<<<<< HEAD
      category_id,
      translations,
    } = body || {};

    // Update base nếu có field
    const sets = [];
    const params = [];

=======
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
>>>>>>> feature/lead
    if (title !== undefined) { sets.push("title = ?"); params.push(title); }
    if (slug !== undefined) { sets.push("slug = ?"); params.push(slug); }
    if (description !== undefined) { sets.push("description = ?"); params.push(description); }
    if (content !== undefined) { sets.push("content = ?"); params.push(content); }
    if (image_url !== undefined) { sets.push("image_url = ?"); params.push(image_url); }
<<<<<<< HEAD
    if (category_id !== undefined) {
      sets.push("category_id = ?");
      params.push(
        category_id === null
          ? null
          : typeof category_id === "number"
            ? category_id
            : null
      );
    }

    if (sets.length) {
      const sql = `UPDATE products SET ${sets.join(", ")} WHERE id = ?`;
=======
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
>>>>>>> feature/lead
      params.push(id);
      const res = await c.env.DB.prepare(sql).bind(...params).run();
      if ((res.meta?.changes || 0) === 0) return c.json({ error: "Product not found" }, 404);
    }

<<<<<<< HEAD
    // Upsert translations nếu có
    if (translations && typeof translations === "object") {
      const upsertT = `
        INSERT INTO product_translations(product_id, locale, title, slug, short_description, content)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6)
        ON CONFLICT(product_id, locale) DO UPDATE SET
          title=excluded.title,
          slug=excluded.slug,
          short_description=excluded.short_description,
          content=excluded.content,
          updated_at=strftime('%Y-%m-%d %H:%M:%f','now')
      `;
      for (const [lc, tr] of Object.entries(translations)) {
        const tTitle = tr?.title ?? "";
        const tSlug = tr?.slug?.trim() || slugify(tTitle || title || "");
        const tShort = tr?.short_description ?? (description ?? "");
        const tContent = tr?.content ?? (content ?? "");
        await c.env.DB
          .prepare(upsertT)
          .bind(id, String(lc).toLowerCase(), tTitle, tSlug, tShort, tContent)
          .run();
=======
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
>>>>>>> feature/lead
      }
    }

    const locale = getLocale(c);
<<<<<<< HEAD
    const product = await getMergedProductById(c.env.DB, id, locale);
=======
    const product = await findProductByIdOrSlug(c.env.DB, String(id), locale);
>>>>>>> feature/lead
    return c.json({ product, source: "database", locale });
  } catch (err) {
    console.error("Error updating product:", err);
    const msg =
<<<<<<< HEAD
      String(err?.message || "").toLowerCase().includes("unique")
=======
      String(err?.message || "").toLowerCase().includes("unique") ||
        String(err).toLowerCase().includes("unique")
>>>>>>> feature/lead
        ? "Slug already exists"
        : "Failed to update product";
    return c.json({ error: msg }, 500);
  }
});

/**
 * PUT /api/products/:id/translations
<<<<<<< HEAD
 * Body: { translations: { en:{title,slug,short_description,content}, ... } }
=======
 * Body: { translations: { en:{title?,description?,content?}, ja:{...} } }
>>>>>>> feature/lead
 */
productsRouter.put("/:id/translations", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB(c.env)) return c.json({ error: "Database not available" }, 503);
<<<<<<< HEAD
=======

>>>>>>> feature/lead
    const body = await c.req.json();
    const translations = body?.translations;
    if (!translations || typeof translations !== "object") {
      return c.json({ error: "Missing translations" }, 400);
    }

    const upsertT = `
<<<<<<< HEAD
      INSERT INTO product_translations(product_id, locale, title, slug, short_description, content)
      VALUES (?1, ?2, ?3, ?4, ?5, ?6)
      ON CONFLICT(product_id, locale) DO UPDATE SET
        title=excluded.title,
        slug=excluded.slug,
        short_description=excluded.short_description,
        content=excluded.content,
        updated_at=strftime('%Y-%m-%d %H:%M:%f','now')
    `;
    for (const [lc, tr] of Object.entries(translations)) {
      const tTitle = tr?.title ?? "";
      const tSlug = tr?.slug?.trim() || slugify(tTitle);
      const tShort = tr?.short_description ?? "";
      const tContent = tr?.content ?? "";
      await c.env.DB
        .prepare(upsertT)
        .bind(id, String(lc).toLowerCase(), tTitle, tSlug, tShort, tContent)
        .run();
=======
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
>>>>>>> feature/lead
    }
    return c.json({ ok: true });
  } catch (err) {
    console.error("Error upserting product translations:", err);
<<<<<<< HEAD
    const msg =
      String(err?.message || "").toLowerCase().includes("unique")
        ? "Slug already exists"
        : "Failed to upsert translations";
    return c.json({ error: msg }, 500);
=======
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
>>>>>>> feature/lead
  }
});

/**
 * DELETE /api/products/:id
<<<<<<< HEAD
 * Xoá product (cascade sẽ xoá translations nếu ON DELETE CASCADE)
=======
>>>>>>> feature/lead
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
// dịch
productsRouter.get("/:id/translations", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB(c.env)) return c.json({ error: "Database not available" }, 503);
    const sql = `
      SELECT locale, title, slug, short_description, content
      FROM product_translations
      WHERE product_id = ?
      ORDER BY locale ASC
    `;
    const { results = [] } = await c.env.DB.prepare(sql).bind(id).all();
    const translations = {};
    for (const r of results) {
      translations[r.locale] = {
        title: r.title || "", slug: r.slug || "",
        short_description: r.short_description || "",
        content: r.content || ""
      };
    }
    return c.json({ translations });
  } catch (err) {
    console.error(err);
    return c.json({ error: "Failed to fetch translations" }, 500);
  }
});

export default productsRouter;
