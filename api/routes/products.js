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
    const params = [locale, locale];
    const conds = [];

    if (subcategory_id) {
      conds.push("p.subcategory_id = ?");
      params.push(Number(subcategory_id));
    }
    if (sub_slug) {
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
        p.image_url,                 -- KEY trong DB
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
    const rows = result?.results ?? [];

    // Build URL từ key
    const base = (c.env.PUBLIC_R2_URL || c.env.INTERNAL_R2_URL ||  "").replace(/\/+$/, "");
    const products = rows.map(r => ({
      ...r,
      image_url: r.image_url ? `${base}/${r.image_url}` : null,
    }));

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
    const raw = await findProductByIdOrSlug(c.env.DB, idOrSlug, locale);
    if (!raw) return c.json({ error: "Product not found" }, 404);

    const base = (c.env.PUBLIC_R2_URL || c.env.INTERNAL_R2_URL ||  "").replace(/\/+$/, "");
    const product = {
      ...raw,
      image_url: raw.image_url ? `${base}/${raw.image_url}` : null,
    };

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


// ====== Utils cơ bản (nếu đã có ở nơi khác thì bỏ phần này) ======
const toStr = (v) => (v == null ? '' : String(v).trim());

function csvToJson(text) {
  const lines = String(text || '').split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    const obj = {};
    headers.forEach((h, idx) => obj[h] = cols[idx] != null ? cols[idx].trim() : '');
    rows.push(obj);
  }
  return rows;
}

// ====== Sleep & Retry ======
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function withRetry(fn, { tries = 5, delayMs = 400, backoff = 1.5, timeoutMs = 5000 } = {}) {
  let d = delayMs;
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      const v = await Promise.race([
        Promise.resolve(fn()),
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), timeoutMs)),
      ]);
      if (v && String(v).trim()) return v; // coi rỗng là fail để lặp tiếp
      lastErr = new Error('empty result');
    } catch (e) {
      lastErr = e;
    }
    if (i < tries - 1) {
      await sleep(d);
      d = Math.round(d * backoff);
    }
  }
  throw lastErr || new Error('withRetry exhausted');
}

// ====== Clean & Heuristics chống "chưa dịch" ======
const VI_CHAR_RE_G = /[áàảãạăắằẳẵặâấầẩẫậđéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữự]/gi;

function cleanLLMOutput(s) {
  let t = String(s ?? '');
  t = t.replace(/^\s*```(?:markdown|md|text)?\s*/i, '').replace(/\s*```\s*$/i, '');
  t = t.replace(/^(?:translation|translated|english|bản dịch|dịch)\s*:\s*/i, '');
  return t.trim();
}

function jaccardTokens(a, b) {
  const A = new Set(String(a || '').toLowerCase().split(/\s+/).filter(Boolean));
  const B = new Set(String(b || '').toLowerCase().split(/\s+/).filter(Boolean));
  const inter = [...A].filter(x => B.has(x)).length;
  const uni = new Set([...A, ...B]).size || 1;
  return inter / uni;
}

function looksUntranslated(src, out, target) {
  const s = (src || '').trim();
  const o = (out || '').trim();
  if (!o) return true;
  // quá giống câu gốc ⇒ nghi ngờ chưa dịch
  if (jaccardTokens(s, o) > 0.9) return true;
  // nếu dịch sang non-vi mà đa phần vẫn là ký tự tiếng Việt ⇒ coi như fail
  if (target !== 'vi') {
    const viCount = (o.match(VI_CHAR_RE_G) || []).length;
    const ratio = viCount / Math.max(o.length, 1);
    if (ratio > 0.35) return true; // vẫn cho phép vài tên riêng có dấu
  }
  return false;
}

// ====== Gọi model dịch ======
async function translateTextInWorker(c, text, source, target) {
  const out = await c.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [
      { role: 'system', content: `Translate from ${source} to ${target}. Reply with translation only.` },
      { role: 'user', content: text }
    ],
    temperature: 0.2,
  });
  const ans = cleanLLMOutput(out?.response ?? '');
  return looksUntranslated(text, ans, target) ? '' : ans;
}

async function translateContentInWorker(c, text, source, target) {
  const src = String(text || '').trim();
  if (!src) return '';
  const out = await c.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [
      {
        role: 'system', content:
          `Translate from ${source} to ${target}.
Return PLAIN TEXT only (no markdown, no code fences, no labels).
Keep short line breaks. Do not add headings or bullets.` },
      { role: 'user', content: src }
    ],
    temperature: 0,
  });
  const ans = cleanLLMOutput(out?.response ?? '');
  return looksUntranslated(src, ans, target) ? '' : ans;
}

// ====== Route import sản phẩm ======
productsRouter.post('/import', async (c) => {
  try {
    if (!hasDB(c.env)) return c.json({ error: 'Database not available' }, 503);

    // ===== 1) Query flags =====
    const auto = c.req.query('auto') === '1' || c.req.query('auto') === 'true';
    const targets = (c.req.query('targets') || '')
      .split(',').map(s => s.trim().toLowerCase())
      .filter(lc => lc && lc !== 'vi');
    const source = c.req.query('source') || 'vi';
    const dryRun = c.req.query('dry_run') === '1';

    const mode = (c.req.query('mode') || 'soft').toLowerCase(); // 'soft' | 'strict'
    const requireLocales = (c.req.query('require_locales') || '')
      .split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const required = mode === 'strict'
      ? (requireLocales.length ? requireLocales : targets)
      : requireLocales;

    const tries = Number(c.req.query('tries') || 5);
    const delay0 = Number(c.req.query('delay0') || 400);
    const backoff = Number(c.req.query('backoff') || 1.5);
    const waitMs = Number(c.req.query('wait_ms') || 0);

    // ===== 2) File =====
    const form = await c.req.formData();
    const file = form.get('file');
    if (!file || !file.arrayBuffer) {
      return c.json({ error: 'Missing file' }, 400);
    }
    const buf = await file.arrayBuffer();

    // ===== 3) Parse rows =====
    let rows = [];
    try {
      const wb = XLSX.read(buf, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
    } catch {
      const text = new TextDecoder('utf-8').decode(buf);
      rows = csvToJson(text);
    }

    if (!rows.length) {
      return c.json({ ok: true, created: 0, updated: 0, skipped: 0, message: 'No data rows found' });
    }

    // Chuẩn hóa key về lowercase
    rows = rows.map((r) => {
      const out = {};
      for (const k of Object.keys(r)) out[String(k).toLowerCase().trim()] = r[k];
      return out;
    });

    let created = 0, updated = 0, skipped = 0;
    const errors = [];
    const locale = getLocale(c); // nếu bạn cần tham chiếu locale hiện tại

    // ===== 3.5) Prefetch subcategories (NEW) =====
    // Điều chỉnh tên bảng/cột cho đúng schema thật của bạn
    const subRes = await c.env.DB.prepare(`
      SELECT
        s.id                  AS id,
        s.slug                AS s_slug,
        s.name                AS s_name,
        st.locale             AS t_locale,
        st.slug               AS t_slug,
        st.name               AS t_name
      FROM subcategories s
      LEFT JOIN subcategories_translations st
        ON st.sub_id = s.id
    `).all();

    const subRows = subRes?.results || [];
    const subById = new Map();
    const keyToId = new Map();

    // helper normalize bỏ dấu
    const normalizeAscii = (s = '') => String(s).toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ').trim();

    // map các khóa -> id (name/slug gốc & dịch), thêm cả dạng slugify + normalize
    for (const r of subRows) {
      const id = Number(r.id);
      if (!Number.isFinite(id)) continue;
      subById.set(id, r);

      const keys = [r.s_name, r.s_slug, r.t_name, r.t_slug].filter(Boolean);
      for (const k of keys) {
        keyToId.set(normalizeAscii(k), id);
        keyToId.set(slugify(k), id);
        keyToId.set(String(k).toLowerCase(), id);
      }
    }

    // Resolve từ 1 hàng Excel
    const resolveSubcategoryId = (row) => {
      // 1) Ưu tiên id nếu hợp lệ
      const idRaw = row.subcategory_id;
      if (idRaw != null && String(idRaw).trim() !== '') {
        const n = Number(idRaw);
        if (Number.isFinite(n) && subById.has(n)) return n;
      }

      // 2) Thử theo tên từ nhiều cột
      const nameCandidates = [
        row.subcategory_name, row.subcategory, row.subcat,
        row.sub_category, row.sub_cat_name,
        row['subcategory(vi)'], row['subcategory(en)'],
      ].filter(v => v != null && String(v).trim() !== '');

      for (const v of nameCandidates) {
        const s = String(v).trim();
        const k1 = keyToId.get(normalizeAscii(s));
        if (k1) return k1;
        const k2 = keyToId.get(slugify(s));
        if (k2) return k2;
        const k3 = keyToId.get(s.toLowerCase());
        if (k3) return k3;
      }

      return null;
    };

    // ===== 4) Loop từng dòng =====
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const title = toStr(row.title);
      const content = toStr(row.content);
      if (!title || !content) { skipped++; continue; }

      let slug = toStr(row.slug) || slugify(title);
      slug = slugify(slug);

      const description = toStr(row.description);
      const image_url = toStr(row.image_url);

      // === CHANGED: resolve subcategory theo name/id
      const subcategory_id = resolveSubcategoryId(row);
      if (!subcategory_id) {
        skipped++;
        errors.push({
          row: i + 1, reason: 'subcategory_not_found', value:
            (row.subcategory_name ?? row.subcategory ?? row.subcat ?? row.sub_category ?? row.sub_cat_name ?? row.subcategory_id) ?? ''
        });
        continue;
      }

      // Dry run: chỉ đếm
      if (dryRun) { created++; continue; }

      // Base product upsert theo slug
      const exists = await c.env.DB
        .prepare('SELECT id FROM products WHERE slug = ? LIMIT 1')
        .bind(slug)
        .first();

      let productId;
      if (exists?.id) {
        const res = await c.env.DB.prepare(`
          UPDATE products
          SET title = ?, description = ?, content = ?, image_url = ?, subcategory_id = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).bind(
          title,
          description || null,
          content,
          image_url || null,
          Number(subcategory_id),
          exists.id
        ).run();
        productId = exists.id;
        if ((res.meta?.changes || 0) > 0) updated++;
        else skipped++;
      } else {
        const res = await c.env.DB.prepare(`
          INSERT INTO products (title, slug, description, content, image_url, subcategory_id)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
          title,
          slug,
          description || null,
          content,
          image_url || null,
          Number(subcategory_id)
        ).run();
        if (res.success) {
          productId = res.meta?.last_row_id;
          created++;
        } else {
          skipped++;
          continue;
        }
      }

      // ===== 5) Auto-translate (giữ nguyên logic của bạn) =====
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

        const trans = {};

        for (const lc of targets) {
          if (waitMs > 0) await sleep(waitMs);

          const tTitle0 = toStr(row[`${lc}_title`]);
          const tDesc0 = toStr(row[`${lc}_description`]);
          const tCont0 = toStr(row[`${lc}_content`]);
          const tSlug0 = toStr(row[`${lc}_slug`]);

          const tTitle = tTitle0 || await withRetry(
            () => translateTextInWorker(c, title, source, lc),
            { tries, delayMs: delay0, backoff, timeoutMs: 8000 }
          );

          const tDesc = tDesc0 || (description
            ? await withRetry(
              () => translateTextInWorker(c, description, source, lc),
              { tries, delayMs: delay0, backoff, timeoutMs: 8000 }
            )
            : ''
          );

          const tCont = tCont0 || await withRetry(
            () => translateContentInWorker(c, content, source, lc),
            {
              tries: Math.max(tries, 6),
              delayMs: Math.max(delay0, 600),
              backoff,
              timeoutMs: 25000
            }
          );

          const okTitle = !!String(tTitle || '').trim();
          const okContent = !!String(tCont || '').trim();
          const ok = okTitle && okContent;

          const slugTranslated = slugify(tSlug0 || tTitle) || `${slug}-${lc}`;

          trans[lc] = {
            ok,
            title: tTitle,
            desc: tDesc,
            cont: tCont,
            slug: slugTranslated
          };
          if (!ok) {
            trans[lc].reason = !okTitle && !okContent
              ? 'empty_title_and_content'
              : !okTitle ? 'empty_title'
                : 'empty_content_or_untranslated';
          }
        }

        const missing = required.filter(lc => !trans[lc]?.ok);
        if (mode === 'strict' && missing.length) {
          errors.push({ row: i + 1, reason: 'strict_missing_required_locales', locales: missing });
          // Nếu muốn rollback base khi strict fail, có thể xoá sản phẩm vừa tạo tại đây.
        } else {
          for (const lc of targets) {
            if (!trans[lc]?.ok) continue;
            await c.env.DB.prepare(upsertT).bind(
              productId,
              lc,
              trans[lc].title || null,
              trans[lc].slug || null,
              trans[lc].desc || null,
              trans[lc].cont || null
            ).run();
          }
        }
      }
    }

    return c.json({ ok: true, created, updated, skipped, errors });
  } catch (err) {
    console.error('Import products error:', err);
    return c.json({ error: 'Failed to import' }, 500);
  }
});


