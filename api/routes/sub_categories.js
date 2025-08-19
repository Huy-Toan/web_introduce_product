// src/routes/subCategoriesRouter.js
import { Hono } from "hono";

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
 *  - parent_id: number (lọc theo danh mục cha)
 *  - parent_slug: string (lọc theo slug danh mục cha)
 *  - limit, offset: phân trang
 */
subCategoriesRouter.get("/", async (c) => {
  const { parent_id, parent_slug, limit, offset } = c.req.query();
  try {
    if (!hasDB(c.env)) {
      return c.json({ subcategories: [], source: "fallback", count: 0 });
    }

    const conds = [];
    const params = [];

    if (parent_id) {
      conds.push("s.parent_id = ?");
      params.push(Number(parent_id));
    }
    if (parent_slug) {
      conds.push("pc.slug = ?");
      params.push(String(parent_slug));
    }

    const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";

    const hasLimit = Number.isFinite(Number(limit));
    const hasOffset = Number.isFinite(Number(offset));
    const limitSql = hasLimit ? " LIMIT ?" : "";
    const offsetSql = hasOffset ? " OFFSET ?" : "";

    const sql = `
      SELECT
        s.id, s.parent_id, s.name, s.slug, s.description, s.image_url, s.created_at,
        pc.name AS parent_name, pc.slug AS parent_slug
      FROM subcategories s
      JOIN parent_categories pc ON pc.id = s.parent_id
      ${where}
      ORDER BY s.created_at DESC
      ${limitSql}
      ${offsetSql}
    `;

    const bindParams = [...params];
    if (hasLimit) bindParams.push(Number(limit));
    if (hasOffset) bindParams.push(Number(offset));

    const result = await c.env.DB.prepare(sql).bind(...bindParams).all();
    const subcategories = result?.results ?? [];

    return c.json({
      subcategories,
      count: subcategories.length,
      source: "database",
      debug: { sql, params: bindParams },
    });
  } catch (err) {
    console.error("Error fetching subcategories:", err);
    return c.json({ error: "Failed to fetch subcategories" }, 500);
  }
});

/**
 * GET /api/subcategories/:idOrSlug
 * Lấy chi tiết theo id hoặc slug
 */
subCategoriesRouter.get("/:idOrSlug", async (c) => {
  const idOrSlug = c.req.param("idOrSlug");
  try {
    if (!hasDB(c.env)) return c.json({ error: "Database not available" }, 503);

    const isNumeric = /^\d+$/.test(idOrSlug);
    const sql = `
      SELECT
        s.id, s.parent_id, s.name, s.slug, s.description, s.image_url, s.created_at,
        pc.name AS parent_name, pc.slug AS parent_slug
      FROM subcategories s
      JOIN parent_categories pc ON pc.id = s.parent_id
      WHERE ${isNumeric ? "s.id = ?" : "s.slug = ?"}
      LIMIT 1
    `;
    const subcat = await c.env.DB.prepare(sql)
      .bind(isNumeric ? Number(idOrSlug) : idOrSlug)
      .first();

    if (!subcat) return c.json({ error: "Subcategory not found" }, 404);
    return c.json({ subcategory: subcat, source: "database" });
  } catch (err) {
    console.error("Error fetching subcategory:", err);
    return c.json({ error: "Failed to fetch subcategory" }, 500);
  }
});

/**
 * POST /api/subcategories
 * body: { parent_id, name, slug?, description?, image_url? }
 */
subCategoriesRouter.post("/", async (c) => {
  try {
    if (!hasDB(c.env)) return c.json({ error: "Database not available" }, 503);

    const body = await c.req.json();
    const { parent_id, name, slug: rawSlug, description, image_url } = body || {};

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
    const subcat = await c.env.DB
      .prepare(
        `SELECT
           s.id, s.parent_id, s.name, s.slug, s.description, s.image_url, s.created_at,
           pc.name AS parent_name, pc.slug AS parent_slug
         FROM subcategories s
         JOIN parent_categories pc ON pc.id = s.parent_id
         WHERE s.id = ?`
      )
      .bind(newId)
      .first();

    return c.json({ subcategory: subcat, source: "database" }, 201);
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
 * body: { parent_id?, name?, slug?, description?, image_url? }
 * Lưu ý: thay đổi parent_id vẫn hợp lệ nhờ FK; kiểm tra parent tồn tại nếu có truyền.
 */
subCategoriesRouter.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB(c.env)) return c.json({ error: "Database not available" }, 503);

    const body = await c.req.json();
    const { parent_id, name, slug, description, image_url } = body || {};

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
      params.push(
        parent_id === null ? null : Number(parent_id)
      );
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

    if (!sets.length) return c.json({ error: "No fields to update" }, 400);

    const sql = `UPDATE subcategories SET ${sets.join(", ")} WHERE id = ?`;
    params.push(id);

    const res = await c.env.DB.prepare(sql).bind(...params).run();
    if ((res.meta?.changes || 0) === 0) {
      return c.json({ error: "Subcategory not found" }, 404);
    }

    const subcat = await c.env.DB
      .prepare(
        `SELECT
           s.id, s.parent_id, s.name, s.slug, s.description, s.image_url, s.created_at,
           pc.name AS parent_name, pc.slug AS parent_slug
         FROM subcategories s
         JOIN parent_categories pc ON pc.id = s.parent_id
         WHERE s.id = ?`
      )
      .bind(id)
      .first();

    return c.json({ subcategory: subcat, source: "database" });
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
 * Lấy toàn bộ sản phẩm thuộc subcategory
 */
subCategoriesRouter.get("/:slug/products", async (c) => {
  const slug = c.req.param("slug");
  try {
    if (!hasDB(c.env)) {
      return c.json({ products: [], source: "fallback", count: 0 });
    }

    const sql = `
      SELECT
        p.*,
        s.id   AS subcategory_id,
        s.name AS subcategory_name,
        s.slug AS subcategory_slug,
        pc.id  AS parent_id,
        pc.name AS parent_name,
        pc.slug AS parent_slug
      FROM products p
      JOIN subcategories s      ON s.id = p.subcategory_id
      JOIN parent_categories pc ON pc.id = s.parent_id
      WHERE s.slug = ?
      ORDER BY p.created_at DESC
    `;
    const res = await c.env.DB.prepare(sql).bind(slug).all();
    const products = res?.results ?? [];
    return c.json({ products, count: products.length, source: "database" });
  } catch (err) {
    console.error("Error fetching products by subcategory:", err);
    return c.json({ error: "Failed to fetch products by subcategory" }, 500);
  }
});

export default subCategoriesRouter;
