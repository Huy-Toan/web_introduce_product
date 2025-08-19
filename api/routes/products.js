import { Hono } from "hono";

// Helpers
const hasDB = (env) => Boolean(env?.DB) || Boolean(env?.DB_AVAILABLE);

// tạo slug đơn giản khi không truyền vào
const slugify = (s = "") =>
  s
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

// Lấy chi tiết sản phẩm qua id hoặc slug (kèm sub + parent)
const findProductByIdOrSlug = async (db, idOrSlug) => {
  const isNumericId = /^\d+$/.test(idOrSlug);
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
    LEFT JOIN subcategories s ON s.id = p.subcategory_id
    LEFT JOIN parent_categories pc ON pc.id = s.parent_id
    WHERE ${isNumericId ? "p.id = ?" : "p.slug = ?"}
    LIMIT 1
  `;
  return db.prepare(sql).bind(isNumericId ? Number(idOrSlug) : idOrSlug).first();
};

export const productsRouter = new Hono();

// GET /api/products
// Query hỗ trợ: parent_id, parent_slug, subcategory_id, sub_slug
productsRouter.get("/", async (c) => {
  const { parent_id, parent_slug, subcategory_id, sub_slug, limit, offset } = c.req.query();

  try {
    if (!hasDB(c.env)) {
      const products = [];
      return c.json({ products, source: "fallback", count: products.length });
    }

    const conds = [];
    const params = [];

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

    const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";

    // Phân trang nhẹ (tuỳ chọn)
    const hasLimit = Number.isFinite(Number(limit));
    const hasOffset = Number.isFinite(Number(offset));
    const limitSql = hasLimit ? " LIMIT ?" : "";
    const offsetSql = hasOffset ? " OFFSET ?" : "";

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
      LEFT JOIN subcategories s ON s.id = p.subcategory_id
      LEFT JOIN parent_categories pc ON pc.id = s.parent_id
      ${where}
      ORDER BY p.created_at DESC
      ${limitSql}
      ${offsetSql}
    `;

    const bindParams = [...params];
    if (hasLimit) bindParams.push(Number(limit));
    if (hasOffset) bindParams.push(Number(offset));

    const result = await c.env.DB.prepare(sql).bind(...bindParams).all();
    const products = result?.results ?? [];

    return c.json({
      products,
      count: products.length,
      source: "database",
      debug: { sql, params: bindParams },
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    return c.json(
      { error: "Failed to fetch products", source: "error_fallback" },
      500
    );
  }
});

// GET /api/products/:idOrSlug
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

// POST /api/products
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
      subcategory_id, // mới
    } = body || {};

    if (!title || !content) {
      return c.json(
        { error: "Missing required fields: title, content" },
        400
      );
    }

    const slug = (rawSlug?.trim() || slugify(title)).toLowerCase();

    // Kiểm tra subcategory tồn tại (nếu có truyền)
    if (subcategory_id !== undefined && subcategory_id !== null) {
      const sub = await c.env.DB
        .prepare("SELECT id FROM subcategories WHERE id = ?")
        .bind(Number(subcategory_id))
        .first();
      if (!sub) return c.json({ error: "subcategory_id not found" }, 400);
    }

    // Insert
    const sql = `
      INSERT INTO products (title, slug, description, content, image_url, subcategory_id)
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
        typeof subcategory_id === "number" ? subcategory_id : null
      )
      .run();

    const newId = runRes.meta?.last_row_id;
    const product = await c.env.DB
      .prepare(
        `SELECT
           p.*,
           s.id   AS subcategory_id,
           s.name AS subcategory_name,
           s.slug AS subcategory_slug,
           pc.id  AS parent_id,
           pc.name AS parent_name,
           pc.slug AS parent_slug
         FROM products p
         LEFT JOIN subcategories s ON s.id = p.subcategory_id
         LEFT JOIN parent_categories pc ON pc.id = s.parent_id
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
    return c.json({ error: msg }, 500);
  }
});

// PUT /api/products/:id
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
      subcategory_id, // mới
    } = body || {};

    // Validate subcategory nếu có truyền
    if (subcategory_id !== undefined && subcategory_id !== null) {
      const sub = await c.env.DB
        .prepare("SELECT id FROM subcategories WHERE id = ?")
        .bind(Number(subcategory_id))
        .first();
      if (!sub) return c.json({ error: "subcategory_id not found" }, 400);
    }

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
    if (subcategory_id !== undefined) {
      sets.push("subcategory_id = ?");
      params.push(
        subcategory_id === null
          ? null
          : typeof subcategory_id === "number"
          ? subcategory_id
          : null
      );
    }

    if (!sets.length) {
      return c.json({ error: "No fields to update" }, 400);
    }

    const sql = `
      UPDATE products
      SET ${sets.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    params.push(id);

    const res = await c.env.DB.prepare(sql).bind(...params).run();
    if ((res.meta?.changes || 0) === 0) {
      return c.json({ error: "Product not found" }, 404);
    }

    const product = await c.env.DB
      .prepare(
        `SELECT
           p.*,
           s.id   AS subcategory_id,
           s.name AS subcategory_name,
           s.slug AS subcategory_slug,
           pc.id  AS parent_id,
           pc.name AS parent_name,
           pc.slug AS parent_slug
         FROM products p
         LEFT JOIN subcategories s ON s.id = p.subcategory_id
         LEFT JOIN parent_categories pc ON pc.id = s.parent_id
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

// DELETE /api/products/:id
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
