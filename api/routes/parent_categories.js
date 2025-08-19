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

export const parentsRouter = new Hono();

parentsRouter.get("/", async (c) => {
  const { limit, offset } = c.req.query();
  try {
    if (!hasDB(c.env)) {
      return c.json({ parents: [], source: "fallback", count: 0 });
    }

    const hasLimit = Number.isFinite(Number(limit));
    const hasOffset = Number.isFinite(Number(offset));
    const limitSql = hasLimit ? " LIMIT ?" : "";
    const offsetSql = hasOffset ? " OFFSET ?" : "";

    const sql = `
      SELECT id, name, slug, description, image_url, created_at
      FROM parent_categories
      ORDER BY created_at DESC
      ${limitSql}
      ${offsetSql}
    `;
    const params = [];
    if (hasLimit) params.push(Number(limit));
    if (hasOffset) params.push(Number(offset));

    const result = await c.env.DB.prepare(sql).bind(...params).all();
    const parents = result?.results ?? [];
    return c.json({ parents, count: parents.length, source: "database" });
  } catch (err) {
    console.error("Error fetching parent categories:", err);
    return c.json({ error: "Failed to fetch parent categories" }, 500);
  }
});

/**
 * GET /api/parents/:idOrSlug
 * Lấy chi tiết theo id hoặc slug
 */
parentsRouter.get("/:idOrSlug", async (c) => {
  const idOrSlug = c.req.param("idOrSlug");
  try {
    if (!hasDB(c.env)) return c.json({ error: "Database not available" }, 503);

    const isNumeric = /^\d+$/.test(idOrSlug);
    const sql = `
      SELECT id, name, slug, description, image_url, created_at
      FROM parent_categories
      WHERE ${isNumeric ? "id = ?" : "slug = ?"}
      LIMIT 1
    `;
    const parent = await c.env.DB.prepare(sql)
      .bind(isNumeric ? Number(idOrSlug) : idOrSlug)
      .first();

    if (!parent) return c.json({ error: "Parent category not found" }, 404);
    return c.json({ parent, source: "database" });
  } catch (err) {
    console.error("Error fetching parent category:", err);
    return c.json({ error: "Failed to fetch parent category" }, 500);
  }
});

/**
 * POST /api/parents
 * Tạo danh mục cha
 * body: { name, slug?, description?, image_url? }
 */
parentsRouter.post("/", async (c) => {
  try {
    if (!hasDB(c.env)) return c.json({ error: "Database not available" }, 503);

    const body = await c.req.json();
    const { name, slug: rawSlug, description, image_url } = body || {};
    if (!name?.trim()) {
      return c.json({ error: "Missing required field: name" }, 400);
    }

    const slug = (rawSlug?.trim() || slugify(name)).toLowerCase();

    const sql = `
      INSERT INTO parent_categories (name, slug, description, image_url)
      VALUES (?, ?, ?, ?)
    `;
    const res = await c.env.DB
      .prepare(sql)
      .bind(name.trim(), slug, description || null, image_url || null)
      .run();

    if (!res.success) throw new Error("Insert failed");

    const newId = res.meta?.last_row_id;
    const parent = await c.env.DB
      .prepare(
        `SELECT id, name, slug, description, image_url, created_at
         FROM parent_categories WHERE id = ?`
      )
      .bind(newId)
      .first();

    return c.json({ parent, source: "database" }, 201);
  } catch (err) {
    console.error("Error creating parent category:", err);
    const msg =
      String(err?.message || "").toLowerCase().includes("unique") ||
        String(err).toLowerCase().includes("unique")
        ? "Slug or Name already exists"
        : "Failed to create parent category";
    return c.json({ error: msg }, 500);
  }
});

/**
 * PUT /api/parents/:id
 * Cập nhật danh mục cha
 * body: { name?, slug?, description?, image_url? }
 */
parentsRouter.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB(c.env)) return c.json({ error: "Database not available" }, 503);

    const body = await c.req.json();
    const { name, slug, description, image_url } = body || {};

    const sets = [];
    const params = [];

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

    const sql = `UPDATE parent_categories SET ${sets.join(", ")} WHERE id = ?`;
    params.push(id);

    const res = await c.env.DB.prepare(sql).bind(...params).run();
    if ((res.meta?.changes || 0) === 0) {
      return c.json({ error: "Parent category not found" }, 404);
    }

    const parent = await c.env.DB
      .prepare(
        `SELECT id, name, slug, description, image_url, created_at
         FROM parent_categories WHERE id = ?`
      )
      .bind(id)
      .first();

    return c.json({ parent, source: "database" });
  } catch (err) {
    console.error("Error updating parent category:", err);
    const msg =
      String(err?.message || "").toLowerCase().includes("unique") ||
        String(err).toLowerCase().includes("unique")
        ? "Slug or Name already exists"
        : "Failed to update parent category";
    return c.json({ error: msg }, 500);
  }
});

/**
 * DELETE /api/parents/:id
 * Xoá danh mục cha
 * Lưu ý: do FK ON DELETE CASCADE ở subcategories, xoá parent sẽ xoá luôn toàn bộ subcategories con.
 */
parentsRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB(c.env)) return c.json({ error: "Database not available" }, 503);

    const existing = await c.env.DB
      .prepare("SELECT id FROM parent_categories WHERE id = ?")
      .bind(id)
      .first();
    if (!existing) return c.json({ error: "Parent category not found" }, 404);

    const res = await c.env.DB
      .prepare("DELETE FROM parent_categories WHERE id = ?")
      .bind(id)
      .run();

    if ((res.meta?.changes || 0) > 0) {
      return c.json({ success: true, message: "Parent category deleted successfully" });
    }
    return c.json({ error: "Parent category not found" }, 404);
  } catch (err) {
    console.error("Error deleting parent category:", err);
    return c.json({ error: "Failed to delete parent category" }, 500);
  }
});

/**
 * GET /api/parents/:slug/products
 * Lấy tất cả sản phẩm thuộc danh mục cha (gộp các subcategories bên dưới)
 */
parentsRouter.get("/:slug/products", async (c) => {
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
      JOIN subcategories s     ON s.id = p.subcategory_id
      JOIN parent_categories pc ON pc.id = s.parent_id
      WHERE pc.slug = ?
      ORDER BY p.created_at DESC
    `;
    const res = await c.env.DB.prepare(sql).bind(slug).all();
    const products = res?.results ?? [];
    return c.json({ products, count: products.length, source: "database" });
  } catch (err) {
    console.error("Error fetching products by parent category:", err);
    return c.json({ error: "Failed to fetch products by parent category" }, 500);
  }
});

export default parentsRouter;