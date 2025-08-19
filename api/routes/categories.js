// api/route/categories.js
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

export const categoriesRouter = new Hono();

/**
 * GET /api/categories?locale=en
 * Danh sách categories theo locale (JOIN + fallback)
 */
categoriesRouter.get("/", async (c) => {
  try {
    if (!hasDB(c.env)) {
      return c.json({ categories: [], source: "fallback", count: 0 });
    }
    const locale = getLocale(c);

    const sql = `
      SELECT
        c.id,
        COALESCE(ct.name, c.name) AS name,
        COALESCE(ct.slug, c.slug) AS slug,
        c.description,
        c.image_url,
        c.created_at
      FROM categories c
      LEFT JOIN category_translations ct
        ON ct.category_id = c.id AND ct.locale = ?
      ORDER BY c.created_at DESC
    `;
    const { results = [] } = await c.env.DB.prepare(sql).bind(locale).all();
    return c.json({ categories: results, count: results.length, source: "database", locale });
  } catch (err) {
    console.error("Error fetching categories:", err);
    return c.json({ error: "Failed to fetch categories" }, 500);
  }
});

/**
 * GET /api/categories/:idOrSlug?locale=en
 * Lấy 1 category theo ID hoặc slug (ưu tiên slug theo locale, fallback canonical)
 */
categoriesRouter.get("/:idOrSlug", async (c) => {
  const idOrSlug = c.req.param("idOrSlug");
  try {
    if (!hasDB(c.env)) return c.json({ error: "Database not available" }, 503);
    const locale = getLocale(c);
    const isNumeric = /^\d+$/.test(idOrSlug);

    if (isNumeric) {
      const sql = `
        SELECT
          c.id,
          COALESCE(ct.name, c.name) AS name,
          COALESCE(ct.slug, c.slug) AS slug,
          c.description, c.image_url, c.created_at
        FROM categories c
        LEFT JOIN category_translations ct
          ON ct.category_id = c.id AND ct.locale = ?
        WHERE c.id = ?
        LIMIT 1
      `;
      const cat = await c.env.DB.prepare(sql).bind(locale, Number(idOrSlug)).first();
      if (!cat) return c.json({ error: "Category not found" }, 404);
      return c.json({ category: cat, source: "database", locale });
    }

    // 1) Tìm theo slug của bản dịch (ct.slug) theo locale
    const byLocale = `
      SELECT
        c.id,
        COALESCE(ct.name, c.name) AS name,
        ct.slug AS slug,
        c.description, c.image_url, c.created_at
      FROM category_translations ct
      JOIN categories c ON c.id = ct.category_id
      WHERE ct.locale = ? AND ct.slug = ?
      LIMIT 1
    `;
    const foundByLocale = await c.env.DB.prepare(byLocale).bind(locale, idOrSlug).first();
    if (foundByLocale) return c.json({ category: foundByLocale, source: "database", locale });

    // 2) Fallback: slug canonical ở bảng gốc
    const byCanonical = `
      SELECT
        c.id,
        COALESCE(ct2.name, c.name) AS name,
        COALESCE(ct2.slug, c.slug) AS slug,
        c.description, c.image_url, c.created_at
      FROM categories c
      LEFT JOIN category_translations ct2
        ON ct2.category_id = c.id AND ct2.locale = ?
      WHERE c.slug = ?
      LIMIT 1
    `;
    const foundByCanonical = await c.env.DB.prepare(byCanonical).bind(locale, idOrSlug).first();
    if (!foundByCanonical) return c.json({ error: "Category not found" }, 404);
    return c.json({ category: foundByCanonical, source: "database", locale });
  } catch (err) {
    console.error("Error fetching category:", err);
    return c.json({ error: "Failed to fetch category" }, 500);
  }
});

/**
 * POST /api/categories
 * Body:
 * {
 *   name: string,
 *   slug?: string,
 *   description?: string,
 *   image_url?: string,
 *   translations?: {
 *     en?: { name?: string, slug?: string },
 *     ja?: { name?: string, slug?: string },
 *     ...
 *   }
 * }
 */
categoriesRouter.post("/", async (c) => {
  try {
    if (!hasDB(c.env)) return c.json({ error: "Database not available" }, 503);

    const body = await c.req.json();
    const { name, slug: rawSlug, description, image_url, translations } = body || {};
    if (!name?.trim()) return c.json({ error: "Missing required field: name" }, 400);

    const baseSlug = (rawSlug?.trim() || slugify(name));
    // Insert base
    const insSql = `
      INSERT INTO categories (name, slug, description, image_url)
      VALUES (?, ?, ?, ?)
    `;
    const res = await c.env.DB.prepare(insSql).bind(
      name.trim(), baseSlug, description || null, image_url || null
    ).run();
    if (!res.success) throw new Error("Insert failed");
    const newId = res.meta?.last_row_id;

    // Upsert translations (optional)
    if (translations && typeof translations === "object") {
      const upsertT = `
        INSERT INTO category_translations(category_id, locale, name, slug)
        VALUES (?1, ?2, ?3, ?4)
        ON CONFLICT(category_id, locale) DO UPDATE SET
          name=excluded.name,
          slug=excluded.slug,
          updated_at=strftime('%Y-%m-%d %H:%M:%f','now')
      `;
      for (const [lc, tr] of Object.entries(translations)) {
        const tName = tr?.name ?? "";
        const tSlug = tr?.slug?.trim() || slugify(tName || name);
        await c.env.DB.prepare(upsertT).bind(newId, String(lc).toLowerCase(), tName, tSlug).run();
      }
    }

    const cat = await c.env.DB.prepare(
      `SELECT id, name, slug, description, image_url, created_at FROM categories WHERE id = ?`
    ).bind(newId).first();

    return c.json({ category: cat, source: "database" }, 201);
  } catch (err) {
    console.error("Error creating category:", err);
    const msg =
      String(err?.message || "").toLowerCase().includes("unique") ? "Slug already exists"
        : "Failed to create category";
    return c.json({ error: msg }, 500);
  }
});

/**
 * PUT /api/categories/:id
 * Cập nhật base + (optional) translations
 * Body tương tự POST; có thể kèm translations để upsert
 */
categoriesRouter.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB(c.env)) return c.json({ error: "Database not available" }, 503);

    const body = await c.req.json();
    const { name, slug, description, image_url, translations } = body || {};

    // Update base nếu có field
    const sets = [];
    const params = [];
    if (name !== undefined) { sets.push("name = ?"); params.push(name); }
    if (slug !== undefined) { sets.push("slug = ?"); params.push(slug); }
    if (description !== undefined) { sets.push("description = ?"); params.push(description); }
    if (image_url !== undefined) { sets.push("image_url = ?"); params.push(image_url); }

    if (sets.length) {
      const sql = `UPDATE categories SET ${sets.join(", ")} WHERE id = ?`;
      params.push(id);
      const res = await c.env.DB.prepare(sql).bind(...params).run();
      if ((res.meta?.changes || 0) === 0) return c.json({ error: "Category not found" }, 404);
    }

    // Upsert translations nếu có
    if (translations && typeof translations === "object") {
      const upsertT = `
        INSERT INTO category_translations(category_id, locale, name, slug)
        VALUES (?1, ?2, ?3, ?4)
        ON CONFLICT(category_id, locale) DO UPDATE SET
          name=excluded.name,
          slug=excluded.slug,
          updated_at=strftime('%Y-%m-%d %H:%M:%f','now')
      `;
      for (const [lc, tr] of Object.entries(translations)) {
        const tName = tr?.name ?? "";
        const tSlug = tr?.slug?.trim() || slugify(tName || name || "");
        await c.env.DB.prepare(upsertT).bind(id, String(lc).toLowerCase(), tName, tSlug).run();
      }
    }

    // Trả về đã merge theo locale (nếu FE truyền ?locale=..)
    const locale = getLocale(c);
    const cat = await c.env.DB.prepare(
      `SELECT
         c.id,
         COALESCE(ct.name, c.name) AS name,
         COALESCE(ct.slug, c.slug) AS slug,
         c.description, c.image_url, c.created_at
       FROM categories c
       LEFT JOIN category_translations ct ON ct.category_id = c.id AND ct.locale = ?
       WHERE c.id = ?`
    ).bind(locale, id).first();

    return c.json({ category: cat, source: "database", locale });
  } catch (err) {
    console.error("Error updating category:", err);
    const msg =
      String(err?.message || "").toLowerCase().includes("unique") ? "Slug already exists"
        : "Failed to update category";
    return c.json({ error: msg }, 500);
  }
});

/**
 * PUT /api/categories/:id/translations
 * Upsert riêng translations (nếu muốn tách route)
 * Body: { translations: { en:{name,slug}, ja:{...} } }
 */
categoriesRouter.put("/:id/translations", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB(c.env)) return c.json({ error: "Database not available" }, 503);
    const body = await c.req.json();
    const translations = body?.translations;
    if (!translations || typeof translations !== "object") {
      return c.json({ error: "Missing translations" }, 400);
    }

    const upsertT = `
      INSERT INTO category_translations(category_id, locale, name, slug)
      VALUES (?1, ?2, ?3, ?4)
      ON CONFLICT(category_id, locale) DO UPDATE SET
        name=excluded.name,
        slug=excluded.slug,
        updated_at=strftime('%Y-%m-%d %H:%M:%f','now')
    `;
    for (const [lc, tr] of Object.entries(translations)) {
      const tName = tr?.name ?? "";
      const tSlug = tr?.slug?.trim() || slugify(tName);
      await c.env.DB.prepare(upsertT).bind(id, String(lc).toLowerCase(), tName, tSlug).run();
    }
    return c.json({ ok: true });
  } catch (err) {
    console.error("Error upserting category translations:", err);
    const msg =
      String(err?.message || "").toLowerCase().includes("unique") ? "Slug already exists"
        : "Failed to upsert translations";
    return c.json({ error: msg }, 500);
  }
});

/**
 * DELETE /api/categories/:id
 * Xoá category (cascade sẽ xoá translations nếu ON DELETE CASCADE)
 */
categoriesRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB(c.env)) return c.json({ error: "Database not available" }, 503);

    const existing = await c.env.DB
      .prepare("SELECT id FROM categories WHERE id = ?")
      .bind(id)
      .first();
    if (!existing) return c.json({ error: "Category not found" }, 404);

    const res = await c.env.DB
      .prepare("DELETE FROM categories WHERE id = ?")
      .bind(id)
      .run();

    if ((res.meta?.changes || 0) > 0) {
      return c.json({ success: true, message: "Category deleted successfully" });
    }
    return c.json({ error: "Category not found" }, 404);
  } catch (err) {
    console.error("Error deleting category:", err);
    return c.json({ error: "Failed to delete category" }, 500);
  }
});

/**
 * GET /api/categories/:slug/products?locale=en
 * Lấy sản phẩm theo category slug theo locale (ưu tiên ct.slug, fallback c.slug)
 */
categoriesRouter.get("/:slug/products", async (c) => {
  const slug = c.req.param("slug");
  try {
    if (!hasDB(c.env)) {
      return c.json({ products: [], source: "fallback", count: 0 });
    }
    const locale = getLocale(c);

    // Map slug -> category_id (ưu tiên slug theo locale)
    const findId = `
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
    const found = await c.env.DB.prepare(findId).bind(locale, slug, slug).first();
    if (!found?.id) return c.json({ products: [], count: 0, source: "database", locale });

    const sql = `
      SELECT p.*, c.name AS category_name, c.slug AS category_slug
      FROM products p
      JOIN categories c ON c.id = p.category_id
      WHERE p.category_id = ?
      ORDER BY p.created_at DESC
    `;
    const { results = [] } = await c.env.DB.prepare(sql).bind(found.id).all();
    return c.json({ products: results, count: results.length, source: "database", locale });
  } catch (err) {
    console.error("Error fetching products by category:", err);
    return c.json({ error: "Failed to fetch products by category" }, 500);
  }
});
categoriesRouter.get("/:id/translations", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB(c.env)) return c.json({ error: "Database not available" }, 503);

    const sql = `
      SELECT locale, name, slug
      FROM category_translations
      WHERE category_id = ?
      ORDER BY locale ASC
    `;
    const { results = [] } = await c.env.DB.prepare(sql).bind(id).all();

    const translations = {};
    for (const row of results) {
      translations[row.locale] = {
        name: row.name || "",
        slug: row.slug || ""
      };
    }
    return c.json({ translations });
  } catch (err) {
    console.error("Error fetching category translations:", err);
    return c.json({ error: "Failed to fetch translations" }, 500);
  }
});

export default categoriesRouter;
