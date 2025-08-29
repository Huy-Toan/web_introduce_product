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
    stmts.push(
      {
        sql: `ALTER TABLE ${table} ADD COLUMN ${colSql};`,
        args: []
      }
    );
  }
}


migrate0012.post("/migrations/0012/apply", async (c) => {
  try {
    if (!c.env.DB) return c.json({ error: "DB not available" }, 500);

    // 1) Kiểm tra schema hiện tại
    const productsCols = await getColumnSet(c.env.DB, "products");
    const newsCols     = await getColumnSet(c.env.DB, "news");

    // 2) Build danh sách statements
    const statements = [];

    maybeAddColumn(statements, productsCols, "products", `views INTEGER NOT NULL DEFAULT 0`);
    maybeAddColumn(statements, newsCols,     "news",     `views INTEGER NOT NULL DEFAULT 0`);

    if (!productsCols.has("images_json")) {
      statements.push({
        sql: `ALTER TABLE products
              ADD COLUMN "images_json" TEXT
              CHECK ("images_json" IS NULL OR json_valid("images_json"));`,
        args: []
      });
    }


    const backfillSQL = `
      UPDATE products
      SET images_json = json(
        '[{"url":' || quote(image_url) || ',"is_primary":1,"sort_order":0}]'
      )
      WHERE
        (images_json IS NULL OR trim(images_json) = '')
        AND image_url IS NOT NULL
        AND trim(image_url) <> '';
    `;
    statements.push({ sql: backfillSQL, args: [] });

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
      return c.json({ ok: true, message: "Nothing to apply (already up-to-date)." });
    }

    const prepared = statements.map(s => c.env.DB.prepare(s.sql));
    await c.env.DB.batch(prepared);

    // 4) Trả kết quả + schema sau khi chạy
    const schemaProducts = await c.env.DB
      .prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name='products';`)
      .all();
    const schemaNews = await c.env.DB
      .prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name='news';`)
      .all();

    return c.json({
      ok: true,
      message: "Migration 0012 applied successfully",
      executed: statements.map(s => s.sql.trim()),
      schemas: {
        products: schemaProducts.results?.[0]?.sql ?? null,
        news: schemaNews.results?.[0]?.sql ?? null
      }
    });
  } catch (err) {
    console.error("migration 0012 error:", err);
    return c.json({ ok: false, message: err?.message ?? String(err) }, 500);
  }
});

migrate0012.get("/migrations/0012/preview", async (c) => {
  try {
    if (!c.env.DB) return c.json({ error: "DB not available" }, 500);

    const productsCols = await getColumnSet(c.env.DB, "products");
    const newsCols     = await getColumnSet(c.env.DB, "news");

    const plan = [];

    if (!productsCols.has("views")) plan.push(`ALTER TABLE products ADD COLUMN views INTEGER NOT NULL DEFAULT 0;`);
    if (!newsCols.has("views"))     plan.push(`ALTER TABLE news ADD COLUMN views INTEGER NOT NULL DEFAULT 0;`);

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

/** GET /admin/schema/:table/columns — liệt kê cột của 1 bảng */
migrate0012.get("/schema/:table/columns", async (c) => {
  try {
    if (!c.env.DB) return c.json({ error: "DB not available" }, 500);
    const table = c.req.param("table");
    // tránh SQL injection: chỉ cho chữ/số/underscore
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

/** GET /admin/migrations/0012/check — kiểm tra nhanh các mục của migration 0012 */
migrate0012.get("/migrations/0012/check", async (c) => {
  try {
    if (!c.env.DB) return c.json({ error: "DB not available" }, 500);

    // Lấy cột của products + news
    const prodCols = await c.env.DB.prepare(`PRAGMA table_info(products);`).all();
    const newsCols = await c.env.DB.prepare(`PRAGMA table_info(news);`).all();
    const prodSet = new Set((prodCols.results || []).map(r => r.name));
    const newsSet = new Set((newsCols.results || []).map(r => r.name));

    // Kiểm tra trigger
    const trig = await c.env.DB
      .prepare(`SELECT name, sql FROM sqlite_master WHERE type='trigger' AND tbl_name='products' AND name='products_updated_at';`)
      .all();
    const triggerSql = trig.results?.[0]?.sql ?? null;

    // Kiểm tra CHECK json_valid trên images_json (dựa vào DDL)
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
        // giúp bạn nhìn nhanh
        products_columns: prodCols.results,
        news_columns: newsCols.results,
        products_trigger_sql: triggerSql
      }
    });
  } catch (err) {
    return c.json({ ok: false, message: err?.message ?? String(err) }, 500);
  }
});

