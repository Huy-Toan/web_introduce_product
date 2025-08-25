// src/routes/productsRouter.js
import { Hono } from "hono";
import * as XLSX from 'xlsx';

// Helpers
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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  async function withRetry(fn, { tries = 5, delayMs = 400, backoff = 1.5, timeoutMs = 5000 } = {}) {
    let d = delayMs;
    for (let i = 0; i < tries; i++) {
      const v = await Promise.race([
        fn(),
        new Promise((res) => setTimeout(() => res(""), timeoutMs)),
      ]);
      if (v && String(v).trim()) return v;
      if (i < tries - 1) await sleep(d);
      d = Math.round(d * backoff);
    }
    return "";
  }
/* ---------------------------------------------------------
 * Resolve product by id or slug (supports translated slug)
 * --------------------------------------------------------- */
const findProductByIdOrSlug = async (db, idOrSlug, locale) => {
  const isNumericId = /^\d+$/.test(idOrSlug);
  const sql = `
    SELECT
      p.id,
      COALESCE(pt.title, p.title)               AS title,
      COALESCE(pt.slug,  p.slug)                AS slug,
      COALESCE(pt.description, p.description)   AS description,
      COALESCE(pt.content,     p.content)       AS content,
      p.image_url,
      p.created_at,
      p.updated_at,

      s.id                                      AS subcategory_id,
      COALESCE(sct.name, s.name)                AS subcategory_name,
      COALESCE(sct.slug, s.slug)                AS subcategory_slug
    FROM products p
    LEFT JOIN products_translations pt
      ON pt.product_id = p.id AND pt.locale = ?
    LEFT JOIN subcategories s
      ON s.id = p.subcategory_id
    LEFT JOIN subcategories_translations sct
      ON sct.sub_id = s.id AND sct.locale = ?
    WHERE ${isNumericId ? "p.id = ?" : "(p.slug = ? OR pt.slug = ?)"}
    LIMIT 1
  `;
  return isNumericId
    ? db.prepare(sql).bind(locale, locale, Number(idOrSlug)).first()
    : db.prepare(sql).bind(locale, locale, idOrSlug, idOrSlug).first();
};

export const productsRouter = new Hono();

/**
 * GET /api/products
 * Query:
 *  - locale=vi|en|...
 *  - subcategory_id, sub_slug  (sub_slug hỗ trợ slug dịch)
 *  - q: tìm theo title/description/content/slug (ưu tiên bản dịch)
 *  - limit, offset
 */
productsRouter.get("/", async (c) => {
  const { subcategory_id, sub_slug, limit, offset, q } = c.req.query();

  try {
    if (!hasDB(c.env)) {
      return c.json({ products: [], source: "fallback", count: 0 });
    }

    const locale = getLocale(c);
    // Thứ tự bind: pt.locale, sct.locale, ...filters..., limit, offset
    const params = [locale, locale];
    const conds = [];

    if (subcategory_id) {
      conds.push("p.subcategory_id = ?");
      params.push(Number(subcategory_id));
    }
    if (sub_slug) {
      // Chấp nhận slug gốc hoặc slug dịch của subcategory
      conds.push("(s.slug = ? OR sct.slug = ?)");
      params.push(String(sub_slug), String(sub_slug));
    }

    if (q && q.trim()) {
      const kw = `%${q.trim()}%`;
      conds.push(`(
        (pt.title       IS NOT NULL AND pt.title       LIKE ?)
        OR (pt.description IS NOT NULL AND pt.description LIKE ?)
        OR (pt.content   IS NOT NULL AND pt.content    LIKE ?)
        OR (pt.slug      IS NOT NULL AND pt.slug       LIKE ?)
        OR (pt.title       IS NULL AND p.title       LIKE ?)
        OR (pt.description IS NULL AND p.description LIKE ?)
        OR (pt.content     IS NULL AND p.content     LIKE ?)
        OR (pt.slug        IS NULL AND p.slug        LIKE ?)
      )`);
      params.push(kw, kw, kw, kw, kw, kw, kw, kw);
    }

    const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";

    const hasLimit = Number.isFinite(Number(limit));
    const hasOffset = Number.isFinite(Number(offset));
    const limitSql = hasLimit ? " LIMIT ?" : "";
    const offsetSql = hasOffset ? " OFFSET ?" : "";
    if (hasLimit) params.push(Number(limit));
    if (hasOffset) params.push(Number(offset));

    const sql = `
      SELECT
        p.id,
        COALESCE(pt.title, p.title)               AS title,
        COALESCE(pt.slug,  p.slug)                AS slug,
        COALESCE(pt.description, p.description)   AS description,
        COALESCE(pt.content,     p.content)       AS content,
        p.image_url,
        p.created_at,
        p.updated_at,

        s.id                                      AS subcategory_id,
        COALESCE(sct.name, s.name)                AS subcategory_name,
        COALESCE(sct.slug, s.slug)                AS subcategory_slug
      FROM products p
      LEFT JOIN products_translations pt
        ON pt.product_id = p.id AND pt.locale = ?
      LEFT JOIN subcategories s
        ON s.id = p.subcategory_id
      LEFT JOIN subcategories_translations sct
        ON sct.sub_id = s.id AND sct.locale = ?
      ${where}
      ORDER BY p.created_at DESC
      ${limitSql}
      ${offsetSql}
    `;

    const result = await c.env.DB.prepare(sql).bind(...params).all();
    const products = result?.results ?? [];

    return c.json({
      products,
      count: products.length,
      source: "database",
      locale
      // debug: { sql, params }
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    return c.json({ error: "Failed to fetch products" }, 500);
  }
});

/**
 * GET /api/products/:idOrSlug
 * Query: locale
 * - Hỗ trợ resolve bằng slug dịch
 */
productsRouter.get("/:idOrSlug", async (c) => {
  const idOrSlug = c.req.param("idOrSlug");
  try {
    if (!hasDB(c.env)) return c.json({ error: "Database not available" }, 503);

    const locale = getLocale(c);
    const product = await findProductByIdOrSlug(c.env.DB, idOrSlug, locale);
    if (!product) return c.json({ error: "Product not found" }, 404);

    return c.json({ product, source: "database", locale });
  } catch (err) {
    console.error("Error fetching product:", err);
    return c.json({ error: "Failed to fetch product" }, 500);
  }
});

/**
 * POST /api/products
 * Body:
 * {
 *   title: string,
 *   slug?: string,               // nếu không gửi, BE tự sinh từ title
 *   description?: string,
 *   content: string,
 *   image_url?: string,
 *   subcategory_id?: number,     // có thể null
 *   translations?: {             // optional upsert cùng lúc
 *     en?: { title?, slug?, description?, content? },
 *     ja?: { ... },
 *     ...
 *   }
 * }
 */
productsRouter.post("/", async (c) => {
  try {
    if (!hasDB(c.env)) return c.json({ error: "Database not available" }, 503);

    const body = await c.req.json();
    const {
      title,
      slug: rawSlug,
      description,
      content,
      image_url,
      subcategory_id,
      translations
    } = body || {};

    if (!title?.trim() || !content?.trim()) {
      return c.json({ error: "Missing required fields: title, content" }, 400);
    }

    const slug = (rawSlug?.trim() || slugify(title)).toLowerCase();

    if (subcategory_id !== undefined && subcategory_id !== null) {
      const sub = await c.env.DB
        .prepare("SELECT id FROM subcategories WHERE id = ?")
        .bind(Number(subcategory_id))
        .first();
      if (!sub) return c.json({ error: "subcategory_id not found" }, 400);
    }

    const sql = `
      INSERT INTO products (title, slug, description, content, image_url, subcategory_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const runRes = await c.env.DB
      .prepare(sql)
      .bind(
        title.trim(),
        slug,
        description || null,
        content,
        image_url || null,
        subcategory_id == null ? null : Number(subcategory_id)
      )
      .run();

    if (!runRes.success) throw new Error("Insert failed");
    const newId = runRes.meta?.last_row_id;

    // Upsert translations (kèm slug)
    if (translations && typeof translations === "object") {
      const upsertT = `
        INSERT INTO products_translations(product_id, locale, title, slug, description, content)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6)
        ON CONFLICT(product_id, locale) DO UPDATE SET
          title       = COALESCE(excluded.title, title),
          slug        = COALESCE(excluded.slug, slug),
          description = COALESCE(excluded.description, description),
          content     = COALESCE(excluded.content, content),
          updated_at  = CURRENT_TIMESTAMP
      `;
      for (const [lc, tr] of Object.entries(translations)) {
        const tTitle = tr?.title ?? null;
        const tSlug = tr?.slug ? slugify(tr.slug) : (tTitle ? slugify(tTitle) : null);
        await c.env.DB.prepare(upsertT).bind(
          newId,
          String(lc).toLowerCase(),
          tTitle,
          tSlug,
          tr?.description ?? null,
          tr?.content ?? null
        ).run();
      }
    }

    const locale = getLocale(c);
    const product = await findProductByIdOrSlug(c.env.DB, String(newId), locale);
    return c.json({ product, source: "database", locale }, 201);
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

/**
 * PUT /api/products/:id
 * Body:
 * {
 *   title?, slug?, description?, content?, image_url?, subcategory_id?,
 *   translations?: { lc: { title?, slug?, description?, content? } }
 * }
 */
productsRouter.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB(c.env)) return c.json({ error: "Database not available" }, 503);

    const body = await c.req.json();
    const {
      title,
      slug,
      description,
      content,
      image_url,
      subcategory_id,
      translations
    } = body || {};

    if (subcategory_id !== undefined && subcategory_id !== null) {
      const sub = await c.env.DB
        .prepare("SELECT id FROM subcategories WHERE id = ?")
        .bind(Number(subcategory_id))
        .first();
      if (!sub) return c.json({ error: "subcategory_id not found" }, 400);
    }

    const sets = [];
    const params = [];
    if (title !== undefined) { sets.push("title = ?"); params.push(title); }
    if (slug !== undefined) { sets.push("slug = ?"); params.push(slugify(slug)); }
    if (description !== undefined) { sets.push("description = ?"); params.push(description); }
    if (content !== undefined) { sets.push("content = ?"); params.push(content); }
    if (image_url !== undefined) { sets.push("image_url = ?"); params.push(image_url); }
    if (subcategory_id !== undefined) {
      sets.push("subcategory_id = ?");
      params.push(subcategory_id == null ? null : Number(subcategory_id));
    }

    if (sets.length) {
      const sql = `
        UPDATE products
        SET ${sets.join(", ")}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      params.push(id);
      const res = await c.env.DB.prepare(sql).bind(...params).run();
      if ((res.meta?.changes || 0) === 0) return c.json({ error: "Product not found" }, 404);
    }

    if (translations && typeof translations === "object") {
      const upsertT = `
        INSERT INTO products_translations(product_id, locale, title, slug, description, content)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6)
        ON CONFLICT(product_id, locale) DO UPDATE SET
          title       = COALESCE(excluded.title, title),
          slug        = COALESCE(excluded.slug, slug),
          description = COALESCE(excluded.description, description),
          content     = COALESCE(excluded.content, content),
          updated_at  = CURRENT_TIMESTAMP
      `;
      for (const [lc, tr] of Object.entries(translations)) {
        const tTitle = tr?.title ?? null;
        const tSlug = tr?.slug ? slugify(tr.slug) : (tTitle ? slugify(tTitle) : null);
        await c.env.DB.prepare(upsertT).bind(
          id,
          String(lc).toLowerCase(),
          tTitle,
          tSlug,
          tr?.description ?? null,
          tr?.content ?? null
        ).run();
      }
    }

    const locale = getLocale(c);
    const product = await findProductByIdOrSlug(c.env.DB, String(id), locale);
    return c.json({ product, source: "database", locale });
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

/**
 * PUT /api/products/:id/translations
 * Body: { translations: { en:{title?,slug?,description?,content?}, ja:{...} } }
 */
productsRouter.put("/:id/translations", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB(c.env)) return c.json({ error: "Database not available" }, 503);

    const body = await c.req.json();
    const translations = body?.translations;
    if (!translations || typeof translations !== "object") {
      return c.json({ error: "Missing translations" }, 400);
    }

    const upsertT = `
      INSERT INTO products_translations(product_id, locale, title, slug, description, content)
      VALUES (?1, ?2, ?3, ?4, ?5, ?6)
      ON CONFLICT(product_id, locale) DO UPDATE SET
        title       = COALESCE(excluded.title, title),
        slug        = COALESCE(excluded.slug, slug),
        description = COALESCE(excluded.description, description),
        content     = COALESCE(excluded.content, content),
        updated_at  = CURRENT_TIMESTAMP
    `;
    for (const [lc, tr] of Object.entries(translations)) {
      const tTitle = tr?.title ?? null;
      const tSlug = tr?.slug ? slugify(tr.slug) : (tTitle ? slugify(tTitle) : null);
      await c.env.DB.prepare(upsertT).bind(
        id,
        String(lc).toLowerCase(),
        tTitle,
        tSlug,
        tr?.description ?? null,
        tr?.content ?? null
      ).run();
    }
    return c.json({ ok: true });
  } catch (err) {
    console.error("Error upserting product translations:", err);
    return c.json({ error: "Failed to upsert translations" }, 500);
  }
});

/**
 * GET /api/products/:id/translations
 * -> { translations: { locale: { title, slug, description, content } } }
 */
productsRouter.get("/:id/translations", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB(c.env)) return c.json({ error: "Database not available" }, 503);

    const sql = `
      SELECT locale, title, slug, description, content
      FROM products_translations
      WHERE product_id = ?
      ORDER BY locale ASC
    `;
    const { results = [] } = await c.env.DB.prepare(sql).bind(id).all();
    const translations = {};
    for (const row of results) {
      translations[row.locale] = {
        title: row.title || "",
        slug: row.slug || "",
        description: row.description || "",
        content: row.content || ""
      };
    }
    return c.json({ translations });
  } catch (err) {
    console.error("Error fetching product translations:", err);
    return c.json({ error: "Failed to fetch translations" }, 500);
  }
});

/**
 * DELETE /api/products/:id
 */
productsRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    if (!hasDB(c.env)) return c.json({ error: "Database not available" }, 503);

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

// ... giữ nguyên các helper getLocale, hasDB, slugify ... bạn đã có ở trên

// Helper nhỏ: ép chuỗi
const toStr = (v) => (v == null ? '' : String(v).trim())

// (tuỳ chọn) parse CSV fallback nếu không dùng xlsx
function csvToJson(text) {
  const lines = text.split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',')
    const obj = {}
    headers.forEach((h, idx) => obj[h] = cols[idx] != null ? cols[idx].trim() : '')
    rows.push(obj)
  }
  return rows
}


async function translateTextInWorker(c, text, source, target) {
  const out = await c.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [
      { role: 'system', content: `Translate from ${source} to ${target}. Reply with translation only.` },
      { role: 'user', content: text }
    ],
    temperature: 0.2,
  });
  return out?.response?.trim() || '';
}

function cleanLLMOutput(s) {
  let t = String(s ?? '');
  // Bỏ code fences ```...```
  t = t.replace(/^\s*```(?:markdown|md|text)?\s*/i, '')
       .replace(/\s*```\s*$/i, '');
  // Bỏ nhãn kiểu "Translation:", "English:", "Dịch:"
  t = t.replace(/^(?:translation|translated|english|bản dịch|dịch)\s*:\s*/i, '');
  return t.trim();
}

function splitMarkdownByPara(md, maxChars = 2800) {
  const lines = String(md).split(/\r?\n/);
  const out = [];
  let buf = '';
  for (const line of lines) {
    const next = buf ? `${buf}\n${line}` : line;
    if (next.length > maxChars) {
      if (buf) out.push(buf);
      buf = line;
    } else {
      buf = next;
    }
  }
  if (buf.trim()) out.push(buf);
  return out;
}

async function translateChunk(c, chunk, source, target) {
  const out = await c.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [
      { role: 'system', content:
`Translate ${source}->${target} and PRESERVE MARKDOWN exactly.
Rules:
- Keep headings, bold/italics, lists (* or +), line breaks, symbols (°C, %, etc.).
- Do NOT add explanations, labels, or code fences.
- Return MARKDOWN ONLY.` },
      { role: 'user', content: String(chunk) }
    ],
    temperature: 0
  });
  return cleanLLMOutput(out?.response ?? '');
}

async function translateMarkdownInWorker(c, md, source, target) {
  const text = String(md || '').trim();
  if (!text) return '';

  // Nội dung ngắn: dịch 1 phát
  if (text.length <= 2800) {
    const res = await translateChunk(c, text, source, target);
    return res; // '' nếu fail -> để withRetry retry
  }

  // Nội dung dài: chia mảnh để giảm timeout
  const parts = splitMarkdownByPara(text, 2800);
  const outs = [];
  for (const p of parts) {
    const res = await translateChunk(c, p, source, target);
    if (!res) return '';         // buộc retry toàn bộ qua withRetry
    outs.push(res);
    await sleep(150);            // giãn nhịp nhẹ tránh throttle
  }
  return outs.join('\n');
}



productsRouter.post('/import', async (c) => {
  try {
    if (!hasDB(c.env)) return c.json({ error: 'Database not available' }, 503)

    // >>>> 1) đọc query auto-translate
    const auto = c.req.query('auto') === '1' || c.req.query('auto') === 'true'    
    const targets = (c.req.query('targets') || '')
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(lc => lc && lc !== 'vi')
    const source = c.req.query('source') || 'vi'                           
    const dryRun = c.req.query('dry_run') === '1'                               

    const form = await c.req.formData()
    const file = form.get('file')
    if (!file || !file.arrayBuffer) {
      return c.json({ error: 'Missing file' }, 400)
    }

    const buf = await file.arrayBuffer()

    // 2) đọc excel/csv thành rows = array object
    let rows = []
    try {
      const wb = XLSX.read(buf, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      rows = XLSX.utils.sheet_to_json(ws, { defval: '' }) // mỗi row object key = header
    } catch (err) {
      // fallback csv
      const text = new TextDecoder('utf-8').decode(buf)
      rows = csvToJson(text)
    }

    if (!rows.length) {
      return c.json({ ok: true, created: 0, updated: 0, skipped: 0, message: 'No data rows found' })
    }

    // chuẩn hóa key về lowercase
    rows = rows.map((r) => {
      const out = {}
      for (const k of Object.keys(r)) out[String(k).toLowerCase().trim()] = r[k]
      return out
    })

    let created = 0, updated = 0, skipped = 0
    const errors = []
    const locale = getLocale(c)  // dùng để resolve subcategory theo name/slug (nếu có)

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const title = toStr(row.title)
      const content = toStr(row.content)
      if (!title || !content) { skipped++; continue }

      let slug = toStr(row.slug) || slugify(title)
      slug = slugify(slug)

      const description = toStr(row.description)
      const image_url = toStr(row.image_url)

      // Ưu tiên subcategory_id; nếu không có, thử resolve theo name/slug (cột "subcategory")
      let subcategory_id = null
      if (row.subcategory_id != null && String(row.subcategory_id).trim() !== '') {
        const idNum = Number(row.subcategory_id)
        if (Number.isFinite(idNum)) subcategory_id = idNum
      } else if (row.subcategory) {
        const subKey = toStr(row.subcategory)
        if (subKey) {
          const rs = await c.env.DB
            .prepare(`
              SELECT s.id
              FROM subcategories s
              LEFT JOIN subcategories_translations st
                ON st.sub_id = s.id AND st.locale = ?
              WHERE s.slug = ? OR st.slug = ? OR s.name = ? OR st.name = ?
              LIMIT 1
            `)
            .bind(locale, slugify(subKey), slugify(subKey), subKey, subKey)
            .first()
          if (rs?.id) subcategory_id = rs.id
        }
      }

      // Nếu dry_run => không ghi DB, chỉ đếm
      if (dryRun) { created++; continue }

      // Kiểm tra tồn tại theo slug (sản phẩm gốc)
      const exists = await c.env.DB
        .prepare('SELECT id FROM products WHERE slug = ? LIMIT 1')
        .bind(slug)
        .first()

      let productId
      if (exists?.id) {
        // Update
        const res = await c.env.DB.prepare(`
          UPDATE products
          SET title = ?, description = ?, content = ?, image_url = ?, subcategory_id = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).bind(
          title,
          description || null,
          content,
          image_url || null,
          subcategory_id == null ? null : Number(subcategory_id),
          exists.id
        ).run()
        productId = exists.id
        if ((res.meta?.changes || 0) > 0) updated++
        else skipped++
      } else {
        // Insert mới
        const res = await c.env.DB.prepare(`
          INSERT INTO products (title, slug, description, content, image_url, subcategory_id)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
          title,
          slug,
          description || null,
          content,
          image_url || null,
          subcategory_id == null ? null : Number(subcategory_id)
        ).run()

        if (res.success) {
          productId = res.meta?.last_row_id
          created++
        } else {
          skipped++
          continue
        }
      }

      // 3) Nếu bật auto-translate và có targets -> tự dịch & upsert translations
      if (auto && targets.length > 0 && productId) {
        const upsertT = `
          INSERT INTO products_translations (product_id, locale, title, slug, description, content)
          VALUES (?1, ?2, ?3, ?4, ?5, ?6)
          ON CONFLICT(product_id, locale) DO UPDATE SET
            title       = COALESCE(excluded.title, title),
            slug        = COALESCE(excluded.slug, slug),
            description = COALESCE(excluded.description, description),
            content     = COALESCE(excluded.content, content),
            updated_at  = CURRENT_TIMESTAMP
        `;

        // điều khiển hành vi
        const mode = (c.req.query('mode') || 'soft').toLowerCase(); // soft | strict
        const requireLocales = (c.req.query('require_locales') || '')
          .split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

        const tries   = Number(c.req.query('tries')   || 5);
        const delay0  = Number(c.req.query('delay0')  || 400);
        const backoff = Number(c.req.query('backoff') || 1.5);
        const waitMs  = Number(c.req.query('wait_ms') || 0);

        /** @type {Record<string,{ok:boolean,title:string,desc:string,cont:string,slug:string}>} */
        const trans = {};

        for (const lc of targets) {
          if (waitMs > 0) await sleep(waitMs); // tránh dồn request dịch

          const tTitle0 = toStr(row[`${lc}_title`]);
          const tDesc0  = toStr(row[`${lc}_description`]);
          const tCont0  = toStr(row[`${lc}_content`]);
          const tSlug0  = toStr(row[`${lc}_slug`]);

          // DỊCH CÓ RETRY + TIMEOUT — chỉ cần tTitle để tạo slug đúng ngôn ngữ
          const tTitle = tTitle0 || await withRetry(
            () => translateTextInWorker(c, title, source, lc),
            { tries, delayMs: delay0, backoff, timeoutMs: 6000 }
          );

          const tDesc  = tDesc0 || (description
            ? await withRetry(() => translateTextInWorker(c, description, source, lc), { tries, delayMs: delay0, backoff, timeoutMs: 6000 })
            : ""
          );

          const tCont  = tCont0 || await withRetry(
          () => translateMarkdownInWorker(c, content, source, lc), 
          { 
            tries: Math.max(tries, 6),              
            delayMs: Math.max(delay0, 600),       
            backoff, 
            timeoutMs: 22000                       
          } 
        );

          const ok = Boolean((tTitle || '').trim());
          trans[lc] = {
            ok,
            title: tTitle,
            desc:  tDesc,
            cont:  tCont,
            slug:  slugify(tSlug0 || tTitle)
          };
        }

        // locale bắt buộc phải có (ví dụ en)
        const missing = requireLocales.filter(lc => !trans[lc]?.ok);

        if (mode === 'strict' && missing.length) {
          // thiếu bản dịch bắt buộc → không insert translations (tuỳ chọn: rollback base)
          // await c.env.DB.prepare("DELETE FROM products WHERE id = ?").bind(productId).run();
          errors.push({ row: i + 1, reason: 'strict_missing_required_locales', locales: missing });
        } else {
          // soft: luôn giữ base; chỉ insert các locale đã dịch xong
          for (const lc of targets) {
            if (!trans[lc]?.ok) continue;
            await c.env.DB.prepare(upsertT).bind(
              productId,
              lc,
              trans[lc].title || null,
              trans[lc].slug  || null,
              trans[lc].desc  || null,
              trans[lc].cont  || null
            ).run();
          }
        }
      }
    }
    return c.json({ ok: true, created, updated, skipped, errors })
  } catch (err) {
    console.error('Import products error:', err)
    return c.json({ error: 'Failed to import' }, 500)
  }
})
