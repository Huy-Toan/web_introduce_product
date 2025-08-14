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

export const categoriesRouter = new Hono();

categoriesRouter.get("/", async (c) => {
  try {
    if (!hasDB(c.env)) {
      return c.json({ categories: [], source: "fallback", count: 0 });
    }

    const sql = `
      SELECT id, name, slug, description, image_url, created_at
      FROM categories
      ORDER BY created_at DESC
    `;
    const result = await c.env.DB.prepare(sql).all();
    const categories = result?.results ?? [];
    return c.json({ categories, count: categories.length, source: "database" });
  } catch (err) {
    console.error("Error fetching categories:", err);
    return c.json({ error: "Failed to fetch categories" }, 500);
  }
});

categoriesRouter.get("/:idOrSlug", async (c) => {
  const idOrSlug = c.req.param("idOrSlug");
  try {
    if (!hasDB(c.env)) {
      return c.json({ error: "Database not available" }, 503);
    }
    const isNumeric = /^\d+$/.test(idOrSlug);
    const sql = `
      SELECT id, name, slug, description, image_url, created_at
      FROM categories
      WHERE ${isNumeric ? "id = ?" : "slug = ?"}
      LIMIT 1
    `;
    const cat = await c.env.DB.prepare(sql)
      .bind(isNumeric ? Number(idOrSlug) : idOrSlug)
      .first();

    if (!cat) return c.json({ error: "Category not found" }, 404);
    return c.json({ category: cat, source: "database" });
  } catch (err) {
    console.error("Error fetching category:", err);
    return c.json({ error: "Failed to fetch category" }, 500);
  }
});

categoriesRouter.post("/", async (c) => {
  try {
    if (!hasDB(c.env)) {
      return c.json({ error: "Database not available" }, 503);
    }

    const body = await c.req.json();
    const { name, slug: rawSlug, description, image_url } = body || {};
    if (!name?.trim()) {
      return c.json({ error: "Missing required field: name" }, 400);
    }

    const slug = rawSlug?.trim() || slugify(name);

    const sql = `
      INSERT INTO categories (name, slug, description, image_url)
      VALUES (?, ?, ?, ?)
    `;
    const res = await c.env.DB
      .prepare(sql)
      .bind(name.trim(), slug, description || null, image_url || null)
      .run();

    if (!res.success) throw new Error("Insert failed");

    const newId = res.meta?.last_row_id;
    const cat = await c.env.DB
      .prepare(
        `SELECT id, name, slug, description, image_url, created_at
         FROM categories WHERE id = ?`
      )
      .bind(newId)
      .first();

    return c.json({ category: cat, source: "database" }, 201);
  } catch (err) {
    console.error("Error creating category:", err);
    const msg =
      String(err?.message || "").toLowerCase().includes("unique") ||
      String(err).toLowerCase().includes("unique")
        ? "Slug already exists"
        : "Failed to create category";
    return c.json({ error: msg }, 500);
  }
});

categoriesRouter.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB(c.env)) {
      return c.json({ error: "Database not available" }, 503);
    }

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

    const sql = `UPDATE categories SET ${sets.join(", ")} WHERE id = ?`;
    params.push(id);

    const res = await c.env.DB.prepare(sql).bind(...params).run();
    if ((res.meta?.changes || 0) === 0) {
      return c.json({ error: "Category not found" }, 404);
    }

    const cat = await c.env.DB
      .prepare(
        `SELECT id, name, slug, description, image_url, created_at
         FROM categories WHERE id = ?`
      )
      .bind(id)
      .first();

    return c.json({ category: cat, source: "database" });
  } catch (err) {
    console.error("Error updating category:", err);
    const msg =
      String(err?.message || "").toLowerCase().includes("unique") ||
      String(err).toLowerCase().includes("unique")
        ? "Slug already exists"
        : "Failed to update category";
    return c.json({ error: msg }, 500);
  }
});

categoriesRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB(c.env)) {
      return c.json({ error: "Database not available" }, 503);
    }

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

categoriesRouter.get("/:slug/products", async (c) => {
  const slug = c.req.param("slug");
  try {
    if (!hasDB(c.env)) {
      return c.json({ products: [], source: "fallback", count: 0 });
    }

    const sql = `
      SELECT p.*, c.name AS category_name, c.slug AS category_slug
      FROM products p
      JOIN categories c ON c.id = p.category_id
      WHERE c.slug = ?
      ORDER BY p.created_at DESC
    `;
    const res = await c.env.DB.prepare(sql).bind(slug).all();
    const products = res?.results ?? [];
    return c.json({ products, count: products.length, source: "database" });
  } catch (err) {
    console.error("Error fetching products by category:", err);
    return c.json({ error: "Failed to fetch products by category" }, 500);
  }
});

export default categoriesRouter;
