// api/route/products.js
import { Hono } from "hono";

/** Utils */
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

export const productsRouter = new Hono();

/**
 * GET /api/products?locale=en&category_id=1&category_slug=books
 * Danh sách sản phẩm theo locale, filter theo category_id hoặc category_slug
 */
productsRouter.get("/", async (c) => {
  const { category_id, category_slug } = c.req.query();
  try {
    if (!hasDB(c.env)) {
      const products = [];
      return c.json({ products, source: "fallback", count: products.length });
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

    const conds = [];
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
      ${where}
      ORDER BY p.created_at DESC
    `;
    const { results = [] } = await c.env.DB.prepare(sql).bind(...params).all();
    return c.json({
      products: results,
      count: results.length,
      source: "database",
      locale,
      debug: { sql, params },
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    return c.json(
      { error: "Failed to fetch products", source: "error_fallback" },
      500
    );
  }
});

/**
 * GET /api/products/:idOrSlug?locale=en
 * Lấy 1 sản phẩm theo ID hoặc slug (ưu tiên slug theo locale)
 */
productsRouter.get("/:idOrSlug", async (c) => {
  const idOrSlug = c.req.param("idOrSlug");
  try {
    if (!hasDB(c.env)) return c.json({ error: "Database not available" }, 503);
    const locale = getLocale(c);

    let productId = null;
    if (/^\d+$/.test(idOrSlug)) {
      productId = Number(idOrSlug);
    } else {
      productId = await resolveProductIdBySlug(c.env.DB, idOrSlug, locale);
    }
    if (!productId) return c.json({ error: "Product not found" }, 404);

    const product = await getMergedProductById(c.env.DB, productId, locale);
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
 *   slug?: string,
 *   description?: string,
 *   content: string,
 *   image_url?: string,
 *   category_id?: number|null,
 *   translations?: {
 *     en?: { title: string, slug?: string, short_description?: string, content?: string },
 *     ja?: {...}
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
      category_id,
      translations,
    } = body || {};

    if (!title || !content) {
      return c.json({ error: "Missing required fields: title, content" }, 400);
    }

    const baseSlug = rawSlug?.trim() || slugify(title);

    // Insert base product
    const sql = `
      INSERT INTO products (title, slug, description, content, image_url, category_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const runRes = await c.env.DB
      .prepare(sql)
      .bind(
        title,
        baseSlug,
        description || null,
        content,
        image_url || null,
        typeof category_id === "number" ? category_id : null
      )
      .run();

    if (!runRes.success) throw new Error("Insert failed");
    const newId = runRes.meta?.last_row_id;

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
        const tSlug = tr?.slug?.trim() || slugify(tTitle || title);
        const tShort = tr?.short_description ?? (description ?? "");
        const tContent = tr?.content ?? content;
        await c.env.DB
          .prepare(upsertT)
          .bind(newId, String(lc).toLowerCase(), tTitle, tSlug, tShort, tContent)
          .run();
      }
    }

    const locale = getLocale(c);
    const product = await getMergedProductById(c.env.DB, newId, locale);
    return c.json({ product, source: "database", locale }, 201);
  } catch (err) {
    console.error("Error adding product:", err);
    const msg =
      String(err?.message || "").toLowerCase().includes("unique")
        ? "Slug already exists"
        : "Failed to add product";
    return c.json({ error: msg }, 500);
  }
});

/**
 * PUT /api/products/:id
 * Cập nhật base + (optional) translations
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
      category_id,
      translations,
    } = body || {};

    // Update base nếu có field
    const sets = [];
    const params = [];

    if (title !== undefined) { sets.push("title = ?"); params.push(title); }
    if (slug !== undefined) { sets.push("slug = ?"); params.push(slug); }
    if (description !== undefined) { sets.push("description = ?"); params.push(description); }
    if (content !== undefined) { sets.push("content = ?"); params.push(content); }
    if (image_url !== undefined) { sets.push("image_url = ?"); params.push(image_url); }
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
      params.push(id);
      const res = await c.env.DB.prepare(sql).bind(...params).run();
      if ((res.meta?.changes || 0) === 0) return c.json({ error: "Product not found" }, 404);
    }

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
      }
    }

    const locale = getLocale(c);
    const product = await getMergedProductById(c.env.DB, id, locale);
    return c.json({ product, source: "database", locale });
  } catch (err) {
    console.error("Error updating product:", err);
    const msg =
      String(err?.message || "").toLowerCase().includes("unique")
        ? "Slug already exists"
        : "Failed to update product";
    return c.json({ error: msg }, 500);
  }
});

/**
 * PUT /api/products/:id/translations
 * Body: { translations: { en:{title,slug,short_description,content}, ... } }
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
    }
    return c.json({ ok: true });
  } catch (err) {
    console.error("Error upserting product translations:", err);
    const msg =
      String(err?.message || "").toLowerCase().includes("unique")
        ? "Slug already exists"
        : "Failed to upsert translations";
    return c.json({ error: msg }, 500);
  }
});

/**
 * DELETE /api/products/:id
 * Xoá product (cascade sẽ xoá translations nếu ON DELETE CASCADE)
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
