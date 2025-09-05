// routes/migrate_0012.js
import { Hono } from "hono";

export const migrate0012 = new Hono();

async function getColumnSet(db, table) {
  const rs = await db.prepare(`PRAGMA table_info(${table});`).all();
  return new Set((rs.results || []).map(r => r.name));
}

function maybeAddColumn(stmts, colsSet, table, colSql) {
  const colName = colSql.split(/\s+/)[0].replace(/"/g, "");
  if (!colsSet.has(colName)) {
    stmts.push({ sql: `ALTER TABLE ${table} ADD COLUMN ${colSql};`, args: [] });
  }
}

async function hasTable(db, table) {
  const rs = await db
    .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?1;`)
    .bind(table)
    .all();
  return !!(rs.results && rs.results.length);
}

async function getDDL(db, table) {
  const rs = await db
    .prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name=?1;`)
    .bind(table)
    .all();
  return rs.results?.[0]?.sql ?? null;
}

/* ----------------------------------------------------
 *  A) MIGRATE 0012: CHỈ products/news (giữ nguyên hành vi cũ)
 * ---------------------------------------------------- */

// APPLY — chỉ áp dụng cho products/news
migrate0012.post("/migrations/0012/apply", async (c) => {
  try {
    if (!c.env.DB) return c.json({ error: "DB not available" }, 500);

    const productsCols = await getColumnSet(c.env.DB, "products");
    const newsCols = await getColumnSet(c.env.DB, "news");

    const statements = [];

    // 1) Thêm cột (nếu thiếu)
    maybeAddColumn(statements, productsCols, "products", `views INTEGER NOT NULL DEFAULT 0`);
    maybeAddColumn(statements, newsCols, "news", `views INTEGER NOT NULL DEFAULT 0`);

    if (!productsCols.has("images_json")) {
      statements.push({
        sql: `ALTER TABLE products
              ADD COLUMN "images_json" TEXT
              CHECK ("images_json" IS NULL OR json_valid("images_json"));`,
        args: []
      });
    }

    // 2) Backfill images_json từ image_url
    statements.push({
      sql: `
        UPDATE products
        SET images_json = json(
          '[{"url":' || quote(image_url) || ',"is_primary":1,"sort_order":0}]'
        )
        WHERE
          (images_json IS NULL OR trim(images_json) = '')
          AND image_url IS NOT NULL
          AND trim(image_url) <> '';
      `,
      args: []
    });

    // 3) Trigger updated_at cho products (idempotent)
    statements.push({ sql: `DROP TRIGGER IF EXISTS products_updated_at;`, args: [] });
    statements.push({
      sql: `CREATE TRIGGER products_updated_at
            AFTER UPDATE ON products
            FOR EACH ROW
            BEGIN
              UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
            END;`,
      args: []
    });

    if (statements.length === 0) {
      const schemaProducts = await c.env.DB
        .prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name='products';`).all();
      const schemaNews = await c.env.DB
        .prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name='news';`).all();

      return c.json({
        ok: true,
        message: "Nothing to apply (already up-to-date).",
        schemas: {
          products: schemaProducts.results?.[0]?.sql ?? null,
          news: schemaNews.results?.[0]?.sql ?? null
        }
      });
    }

    const prepared = statements.map(s => c.env.DB.prepare(s.sql));
    await c.env.DB.batch(prepared);

    const schemaProducts = await c.env.DB
      .prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name='products';`).all();
    const schemaNews = await c.env.DB
      .prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name='news';`).all();

    return c.json({
      ok: true,
      message: "Migration 0012 (products/news) applied successfully",
      executed: statements.map(s => s.sql.trim()),
      schemas: {
        products: schemaProducts.results?.[0]?.sql ?? null,
        news: schemaNews.results?.[0]?.sql ?? null
      }
    });
  } catch (err) {
    console.error("migration 0012 apply error:", err);
    return c.json({ ok: false, message: err?.message ?? String(err) }, 500);
  }
});

// PREVIEW — chỉ preview thay đổi products/news
migrate0012.get("/migrations/0012/preview", async (c) => {
  try {
    if (!c.env.DB) return c.json({ error: "DB not available" }, 500);

    const productsCols = await getColumnSet(c.env.DB, "products");
    const newsCols = await getColumnSet(c.env.DB, "news");

    const plan = [];

    if (!productsCols.has("views")) plan.push(`ALTER TABLE products ADD COLUMN views INTEGER NOT NULL DEFAULT 0;`);
    if (!newsCols.has("views")) plan.push(`ALTER TABLE news ADD COLUMN views INTEGER NOT NULL DEFAULT 0;`);

    if (!productsCols.has("images_json")) {
      plan.push(`ALTER TABLE products ADD COLUMN "images_json" TEXT CHECK ("images_json" IS NULL OR json_valid("images_json"));`);
    }

    plan.push(`UPDATE products SET images_json = json('[{"url":' || quote(image_url) || ',"is_primary":1,"sort_order":0}]') WHERE (images_json IS NULL OR trim(images_json)='') AND image_url IS NOT NULL AND trim(image_url)<>'';`);
    plan.push(`DROP TRIGGER IF EXISTS products_updated_at;`);
    plan.push(`CREATE TRIGGER products_updated_at AFTER UPDATE ON products FOR EACH ROW BEGIN UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id; END;`);

    return c.json({ ok: true, plan });
  } catch (err) {
    return c.json({ ok: false, message: err?.message ?? String(err) }, 500);
  }
});

/* ----------------------------------------------------
 *  B) ROUTES RIÊNG CHO about_us (độc lập)
 * ---------------------------------------------------- */
// 1) SQL chuẩn (an toàn)
const ABOUT_US_SQL =
  "CREATE TABLE about_us (" +
  "  id INTEGER PRIMARY KEY AUTOINCREMENT," +
  "  title VARCHAR(255) NOT NULL," +
  '  "content" TEXT NOT NULL,' +
  "  image_url VARCHAR(255)," +
  "  created_at TEXT DEFAULT (CURRENT_TIMESTAMP)" +
  ");";

// 2) Preview kế hoạch chạy
async function createAboutUsPlan(db) {
  const exists = await hasTable(db, "about_us");
  const plan = [];
  if (exists) plan.push("DROP TABLE IF EXISTS about_us;");
  plan.push(ABOUT_US_SQL);
  return { exists, plan };
}

// 3) Apply: DROP rồi CREATE (dùng prepare().run())
async function applyAboutUs(db) {
  const exists = await hasTable(db, "about_us");
  if (exists) {
    await db.prepare("DROP TABLE IF EXISTS about_us;").run();
  }
  await db.prepare(ABOUT_US_SQL).run();
  const schema = await getDDL(db, "about_us");
  return { created: true, schema, dropped: exists };
}

// 4) Routes
migrate0012.get("/migrations/0012/preview-about-us", async (c) => {
  if (!c.env.DB) return c.json({ error: "DB not available" }, 500);
  const { exists, plan } = await createAboutUsPlan(c.env.DB);
  return c.json({ ok: true, table: "about_us", already_exists: exists, plan });
});

migrate0012.post("/migrations/0012/apply-about-us", async (c) => {
  try {
    if (!c.env.DB) return c.json({ error: "DB not available" }, 500);
    const { created, schema, dropped } = await applyAboutUs(c.env.DB);
    return c.json({
      ok: true,
      message: dropped ? "about_us dropped and re-created" : "about_us created",
      schema,
    });
  } catch (err) {
    console.error("apply-about-us error:", err);
    return c.json({ ok: false, message: err?.message ?? String(err) }, 500);
  }
});

migrate0012.get("/migrations/0012/check-about-us", async (c) => {
  try {
    if (!c.env.DB) return c.json({ error: "DB not available" }, 500);
    const exists = await hasTable(c.env.DB, "about_us");
    const ddl = exists ? await getDDL(c.env.DB, "about_us") : null;
    return c.json({ ok: true, table_exists: exists, ddl });
  } catch (err) {
    return c.json({ ok: false, message: err?.message ?? String(err) }, 500);
  }
});



/* ----------------------------------------------------
 *  C) SCHEMA HELPERS (dùng chung)
 * ---------------------------------------------------- */

/** GET /admin/schema/:table/columns — liệt kê cột của 1 bảng */
migrate0012.get("/schema/:table/columns", async (c) => {
  try {
    if (!c.env.DB) return c.json({ error: "DB not available" }, 500);
    const table = c.req.param("table");
    if (!/^[A-Za-z0-9_]+$/.test(table)) return c.json({ error: "Invalid table name" }, 400);
    const rs = await c.env.DB.prepare(`PRAGMA table_info(${table});`).all();
    return c.json({ ok: true, table, columns: rs.results });
  } catch (err) {
    return c.json({ ok: false, message: err?.message ?? String(err) }, 500);
  }
});

/** GET /admin/schema/:table/ddl — xem DDL của 1 bảng */
migrate0012.get("/schema/:table/ddl", async (c) => {
  try {
    if (!c.env.DB) return c.json({ error: "DB not available" }, 500);
    const table = c.req.param("table");
    if (!/^[A-Za-z0-9_]+$/.test(table)) return c.json({ error: "Invalid table name" }, 400);
    const ddl = await c.env.DB
      .prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name=?1;`)
      .bind(table)
      .all();
    return c.json({ ok: true, table, sql: ddl.results?.[0]?.sql ?? null });
  } catch (err) {
    return c.json({ ok: false, message: err?.message ?? String(err) }, 500);
  }
});

/** GET /admin/migrations/0012/check — kiểm tra nhanh products/news */
migrate0012.get("/migrations/0012/check", async (c) => {
  try {
    if (!c.env.DB) return c.json({ error: "DB not available" }, 500);

    const prodCols = await c.env.DB.prepare(`PRAGMA table_info(products);`).all();
    const newsCols = await c.env.DB.prepare(`PRAGMA table_info(news);`).all();
    const prodSet = new Set((prodCols.results || []).map(r => r.name));
    const newsSet = new Set((newsCols.results || []).map(r => r.name));

    const trig = await c.env.DB
      .prepare(`SELECT name, sql FROM sqlite_master WHERE type='trigger' AND tbl_name='products' AND name='products_updated_at';`)
      .all();
    const triggerSql = trig.results?.[0]?.sql ?? null;

    const prodDDL = await c.env.DB
      .prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name='products';`)
      .all();
    const ddlText = prodDDL.results?.[0]?.sql ?? "";

    const hasViewsProducts = prodSet.has("views");
    const hasViewsNews = newsSet.has("views");
    const hasImagesJson = prodSet.has("images_json");

    const hasJsonCheck =
      hasImagesJson &&
      /images_json/i.test(ddlText) &&
      /json_valid\s*\(\s*"?images_json"?\s*\)/i.test(ddlText);

    return c.json({
      ok: true,
      checks: {
        products_has_views: hasViewsProducts,
        news_has_views: hasViewsNews,
        products_has_images_json: hasImagesJson,
        products_images_json_has_check_json_valid: hasJsonCheck,
        trigger_products_updated_at_exists: Boolean(triggerSql)
      },
      debug: {
        products_columns: prodCols.results,
        news_columns: newsCols.results,
        products_trigger_sql: triggerSql
      }
    });
  } catch (err) {
    return c.json({ ok: false, message: err?.message ?? String(err) }, 500);
  }
});
