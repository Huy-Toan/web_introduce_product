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

export const parentsRouter = new Hono();

/**
 * GET /api/parents
 * Query:
 *  - locale=vi|en|ja...
 *  - q=... (search theo name/description có i18n)
 *  - limit, offset
 *  - with_counts=1 (trả kèm sub_count, product_count)
 *  - with_subs=1 (trả luôn danh sách subcategories theo locale)
 */
parentsRouter.get("/", async (c) => {
  const { limit, offset, q, with_counts, with_subs } = c.req.query();
  try {
    if (!hasDB(c.env)) {
      return c.json({ parents: [], source: "fallback", count: 0 });
    }
    const locale = getLocale(c);
    const hasLimit = Number.isFinite(Number(limit));
    const hasOffset = Number.isFinite(Number(offset));
    const limitSql = hasLimit ? " LIMIT ?" : "";
    const offsetSql = hasOffset ? " OFFSET ?" : "";

    const where = [];
    const params = [locale];

    if (q && q.trim()) {
      // search trên name/description (ưu tiên bản dịch, fallback base)
      where.push(`(
        (pct.name IS NOT NULL AND pct.name LIKE ?)
        OR (pct.description IS NOT NULL AND pct.description LIKE ?)
        OR (pct.name IS NULL AND pc.name LIKE ?)
        OR (pct.description IS NULL AND pc.description LIKE ?)
      )`);
      const kw = `%${q.trim()}%`;
      params.push(kw, kw, kw, kw);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const baseSql = `
      SELECT
        pc.id,
        COALESCE(pct.name, pc.name)          AS name,
        pc.slug,
        COALESCE(pct.description, pc.description) AS description,
        pc.image_url,
        pc.created_at
      FROM parent_categories pc
      LEFT JOIN parent_categories_translations pct
        ON pct.parent_id = pc.id AND pct.locale = ?
      ${whereSql}
      ORDER BY pc.created_at DESC
      ${limitSql}
      ${offsetSql}
    `;

    if (hasLimit) params.push(Number(limit));
    if (hasOffset) params.push(Number(offset));

    const result = await c.env.DB.prepare(baseSql).bind(...params).all();
    let parents = result?.results ?? [];

    // with_counts: đếm số sub & sản phẩm
    if (String(with_counts) === "1") {
      const ids = parents.map((p) => p.id);
      if (ids.length) {
        const placeholders = ids.map(() => "?").join(",");
        const countsSql = `
          WITH subs AS (
            SELECT parent_id, COUNT(*) AS sub_count
            FROM subcategories
            WHERE parent_id IN (${placeholders})
            GROUP BY parent_id
          ),
          prods AS (
            SELECT sc.parent_id, COUNT(p.id) AS product_count
            FROM subcategories sc
            LEFT JOIN products p ON p.subcategory_id = sc.id
            WHERE sc.parent_id IN (${placeholders})
            GROUP BY sc.parent_id
          )
          SELECT
            pc.id AS parent_id,
            COALESCE(s.sub_count, 0) AS sub_count,
            COALESCE(pr.product_count, 0) AS product_count
          FROM parent_categories pc
          LEFT JOIN subs s  ON s.parent_id  = pc.id
          LEFT JOIN prods pr ON pr.parent_id = pc.id
          WHERE pc.id IN (${placeholders})
        `;
        const countsRes = await c.env.DB
          .prepare(countsSql)
          .bind(...ids, ...ids, ...ids)
          .all();
        const counts = (countsRes?.results ?? []).reduce((acc, r) => {
          acc[r.parent_id] = { sub_count: r.sub_count, product_count: r.product_count };
          return acc;
        }, {});
        parents = parents.map((p) => ({
          ...p,
          ...(counts[p.id] || { sub_count: 0, product_count: 0 }),
        }));
      }
    }

    // with_subs: trả luôn subcategories theo locale
    if (String(with_subs) === "1" && parents.length) {
      const ids = parents.map((p) => p.id);
      const placeholders = ids.map(() => "?").join(",");
      const subsSql = `
        SELECT
          sc.id,
          sc.parent_id,
          COALESCE(sct.name, sc.name) AS name,
          sc.slug,
          COALESCE(sct.description, sc.description) AS description,
          sc.image_url,
          sc.created_at
        FROM subcategories sc
        LEFT JOIN subcategories_translations sct
          ON sct.sub_id = sc.id AND sct.locale = ?
        WHERE sc.parent_id IN (${placeholders})
        ORDER BY sc.created_at DESC
      `;
      const subsRes = await c.env.DB
        .prepare(subsSql)
        .bind(locale, ...ids)
        .all();
      const subs = subsRes?.results ?? [];
      const grouped = subs.reduce((acc, s) => {
        (acc[s.parent_id] ||= []).push(s);
        return acc;
      }, {});
      parents = parents.map((p) => ({ ...p, subcategories: grouped[p.id] || [] }));
    }

    return c.json({
      parents,
      count: parents.length,
      source: "database",
      locale,
    });
  } catch (err) {
    console.error("Error fetching parent categories:", err);
    return c.json({ error: "Failed to fetch parent categories" }, 500);
  }
});

/**
 * GET /api/parents/:idOrSlug
 * Query:
 *  - locale=...
 *  - with_subs=1 (trả luôn children)
 */
parentsRouter.get("/:idOrSlug", async (c) => {
  const idOrSlug = c.req.param("idOrSlug");
  const { with_subs } = c.req.query();
  try {
    if (!hasDB(c.env)) return c.json({ error: "Database not available" }, 503);
    const locale = getLocale(c);
    const isNumeric = /^\d+$/.test(idOrSlug);

    const sql = `
      SELECT
        pc.id,
        COALESCE(pct.name, pc.name)          AS name,
        pc.slug,
        COALESCE(pct.description, pc.description) AS description,
        pc.image_url,
        pc.created_at
      FROM parent_categories pc
      LEFT JOIN parent_categories_translations pct
        ON pct.parent_id = pc.id AND pct.locale = ?
      WHERE ${isNumeric ? "pc.id = ?" : "pc.slug = ?"}
      LIMIT 1
    `;
    const parent = await c.env.DB
      .prepare(sql)
      .bind(locale, isNumeric ? Number(idOrSlug) : idOrSlug)
      .first();

    if (!parent) return c.json({ error: "Parent category not found" }, 404);

    // with_subs: kèm subcategories theo locale
    if (String(with_subs) === "1") {
      const subsSql = `
        SELECT
          sc.id,
          sc.parent_id,
          COALESCE(sct.name, sc.name) AS name,
          sc.slug,
          COALESCE(sct.description, sc.description) AS description,
          sc.image_url,
          sc.created_at
        FROM subcategories sc
        LEFT JOIN subcategories_translations sct
          ON sct.sub_id = sc.id AND sct.locale = ?
        WHERE sc.parent_id = ?
        ORDER BY sc.created_at DESC
      `;
      const subs = await c.env.DB
        .prepare(subsSql)
        .bind(locale, parent.id)
        .all();
      parent.subcategories = subs?.results ?? [];
    }

    return c.json({ parent, source: "database", locale });
  } catch (err) {
    console.error("Error fetching parent category:", err);
    return c.json({ error: "Failed to fetch parent category" }, 500);
  }
});

/**
 * POST /api/parents
 * body: {
 *   name: string,
 *   slug?: string,               // canonical (không i18n)
 *   description?: string,
 *   image_url?: string,
 *   translations?: {             // optional upsert sau insert base
 *     en?: { name?: string, description?: string },
 *     ja?: { name?: string, description?: string },
 *     ...
 *   }
 * }
 */
parentsRouter.post("/", async (c) => {
  try {
    if (!hasDB(c.env)) return c.json({ error: "Database not available" }, 503);

    const body = await c.req.json();
    const { name, slug: rawSlug, description, image_url, translations } = body || {};
    if (!name?.trim()) return c.json({ error: "Missing required field: name" }, 400);

    const slug = (rawSlug?.trim() || slugify(name)).toLowerCase();

    const insSql = `
      INSERT INTO parent_categories (name, slug, description, image_url)
      VALUES (?, ?, ?, ?)
    `;
    const res = await c.env.DB
      .prepare(insSql)
      .bind(name.trim(), slug, description || null, image_url || null)
      .run();

    if (!res.success) throw new Error("Insert failed");
    const newId = res.meta?.last_row_id;

    // Upsert translations nếu có
    if (translations && typeof translations === "object") {
      const upsertT = `
        INSERT INTO parent_categories_translations(parent_id, locale, name, description)
        VALUES (?1, ?2, ?3, ?4)
        ON CONFLICT(parent_id, locale) DO UPDATE SET
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
 * body: { name?, slug?, description?, image_url?, translations? }
 *  - Cập nhật base + upsert translations (nếu truyền)
 */
parentsRouter.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB(c.env)) return c.json({ error: "Database not available" }, 503);

    const body = await c.req.json();
    const { name, slug, description, image_url, translations } = body || {};

    const sets = [];
    const params = [];

    if (name !== undefined) { sets.push("name = ?"); params.push(name); }
    if (slug !== undefined) { sets.push("slug = ?"); params.push(slug); }
    if (description !== undefined) { sets.push("description = ?"); params.push(description); }
    if (image_url !== undefined) { sets.push("image_url = ?"); params.push(image_url); }

    if (sets.length) {
      const sql = `UPDATE parent_categories SET ${sets.join(", ")} WHERE id = ?`;
      params.push(id);
      const res = await c.env.DB.prepare(sql).bind(...params).run();
      if ((res.meta?.changes || 0) === 0) return c.json({ error: "Parent category not found" }, 404);
    }

    // Upsert translations nếu có
    if (translations && typeof translations === "object") {
      const upsertT = `
        INSERT INTO parent_categories_translations(parent_id, locale, name, description)
        VALUES (?1, ?2, ?3, ?4)
        ON CONFLICT(parent_id, locale) DO UPDATE SET
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

    // Trả về đã merge theo locale (nếu FE truyền ?locale=..)
    const locale = getLocale(c);
    const parent = await c.env.DB
      .prepare(
        `SELECT
           pc.id,
           COALESCE(pct.name, pc.name)          AS name,
           pc.slug,
           COALESCE(pct.description, pc.description) AS description,
           pc.image_url,
           pc.created_at
         FROM parent_categories pc
         LEFT JOIN parent_categories_translations pct
           ON pct.parent_id = pc.id AND pct.locale = ?
         WHERE pc.id = ?`
      )
      .bind(locale, id)
      .first();

    return c.json({ parent, source: "database", locale });
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
 * PUT /api/parents/:id/translations
 * body: { translations: { en:{name?,description?}, ja:{...} } }
 */
parentsRouter.put("/:id/translations", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB(c.env)) return c.json({ error: "Database not available" }, 503);

    const body = await c.req.json();
    const translations = body?.translations;
    if (!translations || typeof translations !== "object") {
      return c.json({ error: "Missing translations" }, 400);
    }

    const upsertT = `
      INSERT INTO parent_categories_translations(parent_id, locale, name, description)
      VALUES (?1, ?2, ?3, ?4)
      ON CONFLICT(parent_id, locale) DO UPDATE SET
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
    console.error("Error upserting parent translations:", err);
    const msg = "Failed to upsert translations";
    return c.json({ error: msg }, 500);
  }
});

/**
 * GET /api/parents/:id/translations
 * -> trả về map { locale: { name, description } }
 */
parentsRouter.get("/:id/translations", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB(c.env)) return c.json({ error: "Database not available" }, 503);

    const sql = `
      SELECT locale, name, description
      FROM parent_categories_translations
      WHERE parent_id = ?
      ORDER BY locale ASC
    `;
    const { results = [] } = await c.env.DB.prepare(sql).bind(id).all();
    const translations = {};
    for (const row of results) {
      translations[row.locale] = {
        name: row.name || "",
        description: row.description || "",
      };
    }
    return c.json({ translations });
  } catch (err) {
    console.error("Error fetching parent translations:", err);
    return c.json({ error: "Failed to fetch translations" }, 500);
  }
});

/**
 * DELETE /api/parents/:id
 * Xoá parent (CASCADE xoá subcategories)
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
 * Lấy toàn bộ sản phẩm nằm dưới parent (gộp các subcategories)
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
      JOIN subcategories s      ON s.id = p.subcategory_id
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

/**
 * GET /api/parents/:idOrSlug/subcategories
 * Trả về subcategories con của parent theo locale
 */
parentsRouter.get("/:idOrSlug/subcategories", async (c) => {
  const idOrSlug = c.req.param("idOrSlug");
  try {
    if (!hasDB(c.env)) return c.json({ error: "Database not available" }, 503);
    const locale = getLocale(c);
    const isNumeric = /^\d+$/.test(idOrSlug);

    const findSql = `
      SELECT id FROM parent_categories
      WHERE ${isNumeric ? "id = ?" : "slug = ?"}
      LIMIT 1
    `;
    const row = await c.env.DB
      .prepare(findSql)
      .bind(isNumeric ? Number(idOrSlug) : idOrSlug)
      .first();
    if (!row?.id) return c.json({ subcategories: [], count: 0, locale });

    const subsSql = `
      SELECT
        sc.id,
        sc.parent_id,
        COALESCE(sct.name, sc.name) AS name,
        sc.slug,
        COALESCE(sct.description, sc.description) AS description,
        sc.image_url,
        sc.created_at
      FROM subcategories sc
      LEFT JOIN subcategories_translations sct
        ON sct.sub_id = sc.id AND sct.locale = ?
      WHERE sc.parent_id = ?
      ORDER BY sc.created_at DESC
    `;
    const res = await c.env.DB.prepare(subsSql).bind(locale, row.id).all();
    const subcategories = res?.results ?? [];
    return c.json({ subcategories, count: subcategories.length, source: "database", locale });
  } catch (err) {
    console.error("Error fetching subcategories of parent:", err);
    return c.json({ error: "Failed to fetch subcategories" }, 500);
  }
});

export default parentsRouter;
