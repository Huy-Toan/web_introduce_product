// routes/dino_migrate.js
import { Hono } from "hono";

export const dinoMigrate = new Hono();

/**
 * Thêm cột mới (không cần migrate-by-copy)
 * Body JSON:
 *  { "name": "diet_test", "type": "JSON" | "TEXT" | "INTEGER", "not_null": false, "default": null }
 */
dinoMigrate.post("/dinosaurs/columns/add", async (c) => {
  try {
    if (!c.env.DB) return c.json({ error: "DB not available" }, 500);
    const body = await c.req.json().catch(() => ({}));
    const name = String(body.name || "").trim();
    const typeRaw = String(body.type || "TEXT").trim().toUpperCase();
    const notNull = !!body.not_null;
    const defVal = body.default; // có thể là số, chuỗi hoặc null

    if (!name) return c.json({ error: "name is required" }, 400);

    const isJSON = typeRaw === "JSON";
    const typeForDef = isJSON ? "TEXT" : typeRaw;

    let sql = `ALTER TABLE dinosaurs ADD COLUMN "${name}" ${typeForDef}`;
    if (notNull) sql += " NOT NULL";
    if (defVal !== undefined) {
      sql += " DEFAULT " + (typeof defVal === "number" ? defVal : (defVal === null ? "NULL" : `'${defVal}'`));
    }
    if (isJSON) sql += ` CHECK ("${name}" IS NULL OR json_valid("${name}"))`;

    await c.env.DB.prepare(sql).run();
    return c.json({ ok: true, message: `Added column ${name} (${isJSON ? "JSON" : typeForDef})` });
  } catch (err) {
    console.error("ADD COLUMN error:", err);
    return c.json({ ok: false, message: err?.message ?? String(err) }, 500);
  }
});

/**
 * Rename + convert type bằng migrate-by-copy, chạy trong DB.batch (thay cho BEGIN/COMMIT)
 * Body JSON:
 *  {
 *    "from": "diet",
 *    "to": "diet_test",
 *    "new_type": "INTEGER" | "TEXT" | "JSON",
 *    "cast_expr": "NULLIF(TRIM(diet), '')"  // optional
 *  }
 */
dinoMigrate.post("/dinosaurs/columns/rename-and-convert", async (c) => {
  try {
    if (!c.env.DB) return c.json({ error: "DB not available" }, 500);

    const body = await c.req.json().catch(() => ({}));
    const from = String(body.from || "").trim();
    const to = String(body.to || "").trim();
    const newTypeRaw = String(body.new_type || "").trim().toUpperCase();
    const castExpr = body.cast_expr ? String(body.cast_expr) : null;
    if (!from || !to || !newTypeRaw) {
      return c.json({ error: "from, to, new_type are required" }, 400);
    }

    // Lấy schema hiện tại
    const info = await c.env.DB.prepare("PRAGMA table_info(dinosaurs);").all();
    const cols = info.results || [];
    if (!cols.length) return c.json({ error: "Table 'dinosaurs' not found" }, 400);

    const colNames = cols.map((r) => r.name);
    if (!colNames.includes(from)) return c.json({ error: `Column '${from}' not found` }, 400);
    if (colNames.includes(to) && to !== from) return c.json({ error: `Column '${to}' already exists` }, 400);

    // Xây schema mới
    const isJSON = newTypeRaw === "JSON";
    const newTypeForDef = isJSON ? "TEXT" : newTypeRaw;

    const defs = [];
    const selectCols = [];

    for (const r of cols) {
      let name = r.name;
      let type = (r.type || "").trim() || "TEXT";
      let notNull = r.notnull ? " NOT NULL" : "";
      let dflt =
        r.dflt_value !== null && r.dflt_value !== undefined
          ? ` DEFAULT ${r.dflt_value}`
          : "";
      let pk = r.pk ? " PRIMARY KEY" : "";
      let extra = "";

      if (r.name === from) {
        name = to;
        type = newTypeForDef;

        if (isJSON) {
          extra = ` CHECK ("${to}" IS NULL OR json_valid("${to}"))`;
        }

        const expr = castExpr ? castExpr : `"${from}"`;
        if (isJSON) {
          selectCols.push(
            `CASE
               WHEN ${expr} IS NULL OR trim(${expr}) = '' THEN NULL
               WHEN json_valid(${expr}) THEN ${expr}
               ELSE json(quote(${expr}))
             END AS "${to}"`
          );
        } else {
          selectCols.push(`CAST(${expr} AS ${newTypeRaw}) AS "${to}"`);
        }
      } else {
        selectCols.push(`"${r.name}"`);
      }

      // Heuristic giữ AUTOINCREMENT cho id INTEGER PRIMARY KEY
      if (r.pk && /^id$/i.test(r.name) && /INT/i.test(type)) {
        pk = " PRIMARY KEY AUTOINCREMENT";
      }

      defs.push(`"${name}" ${type}${pk}${notNull}${dflt}${extra}`);
    }

    const tmp = "dinosaurs__tmp__mig";
    const destCols = defs.map((d) => d.split(" ")[0].replace(/"/g, "")); // ["id","name",...]

    // Thực thi như 1 transaction qua batch()
    const stmts = [
      c.env.DB.prepare(`DROP TABLE IF EXISTS ${tmp};`),
      c.env.DB.prepare(`CREATE TABLE ${tmp} (${defs.join(", ")});`),
      c.env.DB.prepare(
        `INSERT INTO ${tmp} (${destCols.map((n) => `"${n}"`).join(", ")})
         SELECT ${selectCols.join(", ")} FROM dinosaurs;`
      ),
      c.env.DB.prepare(`DROP TABLE dinosaurs;`),
      c.env.DB.prepare(`ALTER TABLE ${tmp} RENAME TO dinosaurs;`)
    ];

    try {
      await c.env.DB.batch(stmts);
    } catch (e) {
      // best-effort cleanup
      try { await c.env.DB.prepare(`DROP TABLE IF EXISTS ${tmp};`).run(); } catch {}
      throw e;
    }

    const after = await c.env.DB.prepare("PRAGMA table_info(dinosaurs);").all();
    return c.json({
      ok: true,
      message: `Renamed '${from}' -> '${to}' and converted to ${newTypeRaw}`,
      new_columns: after.results
    });
  } catch (err) {
    console.error("rename-and-convert error:", err);
    return c.json({ ok: false, message: err?.message ?? String(err) }, 500);
  }
});

/** Xem cột nhanh */
dinoMigrate.get("/dinosaurs/columns", async (c) => {
  try {
    if (!c.env.DB) return c.json({ error: "DB not available" }, 500);
    const rs = await c.env.DB.prepare("PRAGMA table_info(dinosaurs);").all();
    return c.json({ ok: true, columns: rs.results });
  } catch (err) {
    return c.json({ ok: false, message: err?.message ?? String(err) }, 500);
  }
});
