import { Hono } from "hono";

// Helpers
const hasDB = (env) => Boolean(env?.DB) || Boolean(env?.DB_AVAILABLE);

// Dùng cho lấy chi tiết qua id hoặc slug
const findProductByIdOrSlug = async (db, idOrSlug) => {
  const isNumericId = /^\d+$/.test(idOrSlug);
  const sql = `
    SELECT p.*, c.name AS category_name, c.slug AS category_slug
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE ${isNumericId ? "p.id = ?" : "p.slug = ?"}
    LIMIT 1
  `;
  return db.prepare(sql).bind(isNumericId ? Number(idOrSlug) : idOrSlug).first();
};

// (tùy chọn) tạo slug đơn giản khi không truyền vào
const slugify = (s = "") =>
  s
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export const productsRouter = new Hono();

productsRouter.get("/", async (c) => {
  const { category_id, category_slug } = c.req.query();
  try {
    if (!hasDB(c.env)) {
      // fallback tối giản
      const products = [];
      return c.json({ products, source: "fallback", count: products.length });
    }

    const conds = [];
    const params = [];
    let joinCat = "";

    if (category_id) {
      conds.push("p.category_id = ?");
      params.push(Number(category_id));
    }

    if (category_slug) {
      joinCat = "LEFT JOIN categories c ON c.id = p.category_id";
      conds.push("c.slug = ?");
      params.push(category_slug);
    }

    const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
    const sql = `
      SELECT p.*, c.name AS category_name, c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      ${where}
      ORDER BY p.created_at DESC
    `;

    const stmt = c.env.DB.prepare(sql).bind(...params);
    const result = await stmt.all();
    const products = result?.results ?? [];

    return c.json({
      products,
      count: products.length,
      source: "database",
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

productsRouter.get("/:idOrSlug", async (c) => {
  const idOrSlug = c.req.param("idOrSlug");
  try {
    if (!hasDB(c.env)) {
      return c.json({ error: "Database not available" }, 503);
    }

    const product = await findProductByIdOrSlug(c.env.DB, idOrSlug);
    if (!product) return c.json({ error: "Product not found" }, 404);

    return c.json({ product, source: "database" });
  } catch (err) {
    console.error("Error fetching product:", err);
    return c.json({ error: "Failed to fetch product" }, 500);
  }
});

productsRouter.post("/", async (c) => {
  try {
    if (!hasDB(c.env)) {
      return c.json({ error: "Database not available" }, 503);
    }

    const body = await c.req.json();
    const {
      title,
      slug: rawSlug,
      description,
      content,
      image_url,
      category_id,
    } = body || {};

    console.log("Adding product:", body);

    if (!title || !content) {
      return c.json(
        { error: "Missing required fields: title, content" },
        400
      );
    }

    const slug = rawSlug?.trim() || slugify(title);
    console.log("Generated slug:", slug);

    // Insert
    const sql = `
      INSERT INTO products (title, slug, description, content, image_url, category_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const runRes = await c.env.DB
      .prepare(sql)
      .bind(
        title,
        slug,
        description || null,
        content,
        image_url || null,
        typeof category_id === "number" ? category_id : null
      )
      .run();

    if (!runRes.success) throw new Error("Insert failed");

    const newId = runRes.meta?.last_row_id;
    const product = await c.env.DB
      .prepare(
        `SELECT p.*, c.name AS category_name, c.slug AS category_slug
         FROM products p
         LEFT JOIN categories c ON c.id = p.category_id
         WHERE p.id = ?`
      )
      .bind(newId)
      .first();

    return c.json({ product, source: "database" }, 201);
  } catch (err) {
    console.error("Error adding product:", err);
    const msg =
      String(err?.message || "").toLowerCase().includes("unique") ||
      String(err).toLowerCase().includes("unique")
        ? "Slug already exists"
        : "Failed to add product";

    console.error("Error details:", err);
    return c.json({ error: msg }, 500);
  }
});

productsRouter.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB(c.env)) {
      return c.json({ error: "Database not available" }, 503);
    }

    const body = await c.req.json();
    const {
      title,
      slug,
      description,
      content,
      image_url,
      category_id,
    } = body || {};

    // Build dynamic update
    const sets = [];
    const params = [];

    if (title !== undefined) {
      sets.push("title = ?");
      params.push(title);
    }
    if (slug !== undefined) {
      sets.push("slug = ?");
      params.push(slug);
    }
    if (description !== undefined) {
      sets.push("description = ?");
      params.push(description);
    }
    if (content !== undefined) {
      sets.push("content = ?");
      params.push(content);
    }
    if (image_url !== undefined) {
      sets.push("image_url = ?");
      params.push(image_url);
    }
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

    if (!sets.length) {
      return c.json({ error: "No fields to update" }, 400);
    }

    const sql = `
      UPDATE products
      SET ${sets.join(", ")}
      WHERE id = ?
    `;
    params.push(id);

    const res = await c.env.DB.prepare(sql).bind(...params).run();

    if ((res.meta?.changes || 0) === 0) {
      return c.json({ error: "Product not found" }, 404);
    }

    // Trigger 'products_updated_at' sẽ tự set updated_at
    const product = await c.env.DB
      .prepare(
        `SELECT p.*, c.name AS category_name, c.slug AS category_slug
         FROM products p
         LEFT JOIN categories c ON c.id = p.category_id
         WHERE p.id = ?`
      )
      .bind(id)
      .first();

    return c.json({ product, source: "database" });
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

productsRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB(c.env)) {
      return c.json({ error: "Database not available" }, 503);
    }

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
