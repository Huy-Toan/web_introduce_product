// api/index.js
import { Hono } from "hono";

import uploadImageRouter from "./routes/upload-image";
import editorUploadRouter from "./routes/editor-upload";
import watermarkR2Router from './routes/watermark.js';
import aboutRouter from "./routes/about";
import newsRouter from "./routes/news";
import seoApp from "./routes/seo";
import parentsRouter from "./routes/parent_categories";
import subCategoriesRouter from "./routes/sub_categories";
import authRouter from "./routes/auth";
import productsRouter from "./routes/products";
import contactRouter from "./routes/contact";
import userRouter from "./routes/user";
import bannerRouter from "./routes/banner";
import fieldRouter from "./routes/field";
import cerPartnerRouter from "./routes/cer-partner";
import translateRouter from "./routes/translate";
import { seoRoot, sitemaps } from "./routes/seo-sitemap.js";
import ga4Router from "./routes/ga4.js";
import adminRouter from "./admin/admin.js";
import { requireAdminAuth, requirePerm } from "./auth/authMidleware.js";
import { jwtVerify } from "jose";
import { getCookie } from "hono/cookie";
import { adminCreateTable } from "./routes/createtable.js";
import { dinoMigrate } from "./routes/dino_migrate.js";
const enc = new TextEncoder();
const getKey = (secret) => enc.encode(secret);

const GRAPH = "https://graph.facebook.com/v20.0";
const app = new Hono();

/* ================ 0) Middleware kiểm tra D1 & CORS ================ */
app.use("*", async (c, next) => {
  try {
    if (c.env.DB) {
      await c.env.DB.prepare("SELECT 1").first();
      c.env.DB_AVAILABLE = true;
    } else {
      c.env.DB_AVAILABLE = false;
    }
  } catch (e) {
    console.error("D1 connection error:", e);
    c.env.DB_AVAILABLE = false;
  }
  await next();
});

// (Tuỳ chọn) CORS cho /wa/* nếu gọi từ origin khác (dev)
const addCORS = (res) =>
  new Response(res.body, {
    ...res,
    headers: new Headers({
      ...Object.fromEntries(res.headers || []),
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    }),
  });

app.options("/wa/*", () => addCORS(new Response(null, { status: 204 })));

/* =============== Guard optional cho /update/* (token bí mật) =============== */
/* Nếu KHÔNG set UPDATE_SECRET trong env -> /update/* mở (không cần token) */
const guardUpdate = async (c, next) => {
  const secret = c.env.UPDATE_SECRET;
  if (!secret) return next();
  const auth = c.req.header("authorization") || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const key = bearer || c.req.header("x-update-key") || "";
  if (key !== secret) return c.json({ error: "Unauthorized" }, 401);
  await next();
};

/* ======================== 1) WhatsApp Webhook ======================== */
// GET /webhook  → Meta verify
app.get("/webhook", (c) => {
  const url = new URL(c.req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === c.env.VERIFY_TOKEN && challenge) {
    return new Response(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain", "Cache-Control": "no-store" },
    });
  }
  return c.text("Forbidden", 403);
});

// POST /webhook → inbound
app.post("/webhook", async (c) => {
  const env = c.env;
  const payload = await c.req.json().catch(() => ({}));

  try {
    const entry = payload.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const msg = value?.messages?.[0];

    if (msg) {
      const from = (msg.from || "").replace(/\D/g, "");
      // Thử lấy từ metadata, nếu không có dùng env
      const to =
        value?.metadata?.display_phone_number?.replace(/\D/g, "") ||
        env.BUSINESS_WA_E164 ||
        "";
      const type = msg.type;
      const body = type === "text" ? msg.text?.body || "" : `[${type}]`;
      const ts = parseInt(msg.timestamp || Date.now() / 1000, 10) * 1000;

      if (env.DB) {
        await env.DB
          .prepare(
            "INSERT INTO messages(chat_id, direction, wa_from, wa_to, type, body, ts) VALUES (?,?,?,?,?,?,?)"
          )
          .bind(from, "in", from, to, type, body, ts)
          .run();
      }
    }
  } catch (e) {
    console.error("Webhook inbound error:", e);
  }

  return c.text("OK", 200);
});

/* ==================== 2) /wa/send – gửi Cloud API ==================== */
app.post("/wa/send", async (c) => {
  const env = c.env;
  const { to, body, template } = await c.req.json().catch(() => ({}));
  const dest = (to || "").replace(/\D/g, "");
  const hasTemplate = !!template;
  const text = (body || "").toString();

  if (!env.PHONE_NUMBER_ID || !env.WHATSAPP_TOKEN) {
    return addCORS(
      new Response(
        JSON.stringify({ ok: false, error: "Missing PHONE_NUMBER_ID or WHATSAPP_TOKEN" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    );
  }
  if (!dest || (!text && !hasTemplate)) {
    return addCORS(
      new Response(JSON.stringify({ ok: false, error: "Missing to/body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    );
  }
  let payload;
  let dbType;
  let dbBody;
  if (hasTemplate) {
    payload = { messaging_product: "whatsapp", to: dest, type: "template", template };
    dbType = "template";
    dbBody = `[template:${template?.name || ""}]`;
  } else {
    payload = { messaging_product: "whatsapp", to: dest, type: "text", text: { body: text } };
    dbType = "text";
    dbBody = text;
  }

  const res = await fetch(`${GRAPH}/${env.PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("Cloud API error:", data);
    return addCORS(
      new Response(JSON.stringify({ ok: false, error: data?.error || data }), {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      })
    );
  }

  let dbInserted = false;
  try {
    if (env.DB) {
      await env.DB
        .prepare(
          "INSERT INTO messages(chat_id, direction, wa_from, wa_to, type, body, ts) VALUES (?,?,?,?,?,?,?)"
        )
        .bind(dest, "out", env.BUSINESS_WA_E164 || "", dest, dbType, dbBody, Date.now())
        .run();
      dbInserted = true;
    }
  } catch (e) {
    console.error("D1 insert outgoing error:", e);
  }

  return addCORS(
    new Response(JSON.stringify({ ok: true, data, dbInserted }), {
      headers: { "Content-Type": "application/json" },
    })
  );
});

/* ================== 2b) /wa/inbox – user gửi tin nhắn ================== */
app.post("/wa/inbox", async (c) => {
  const env = c.env;
  const { from, body } = await c.req.json().catch(() => ({}));
  const sender = (from || "").replace(/\D/g, "");
  const text = (body || "").toString();

  if (!sender || !text) {
    return addCORS(
      new Response(JSON.stringify({ ok: false, error: "Missing from/body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    );
  }

  let dbInserted = false;
  try {
    if (env.DB) {
      await env.DB
        .prepare(
          "INSERT INTO messages(chat_id, direction, wa_from, wa_to, type, body, ts) VALUES (?,?,?,?,?,?,?)"
        )
        .bind(sender, "in", sender, env.BUSINESS_WA_E164 || "", "text", text, Date.now())
        .run();
      dbInserted = true;
    }
  } catch (e) {
    console.error("D1 insert incoming error:", e);
  }

  // Gửi tiếp tin nhắn tới số business qua Cloud API để admin nhận trên WhatsApp
  let forwarded = false;
  try {
    if (env.PHONE_NUMBER_ID && env.WHATSAPP_TOKEN && env.BUSINESS_WA_E164) {
      const payload = {
        messaging_product: "whatsapp",
        to: env.BUSINESS_WA_E164,
        type: "text",
        text: { body: `[${sender}] ${text}` },
      };
      const res = await fetch(`${GRAPH}/${env.PHONE_NUMBER_ID}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) forwarded = true;
      else console.error("Cloud API forward error", await res.text());
    }
  } catch (e) {
    console.error("Forward to business failed:", e);
  }

  return addCORS(
    new Response(JSON.stringify({ ok: true, dbInserted, forwarded }), {
      headers: { "Content-Type": "application/json" },
    })
  );
});

/* ================== 3) /wa/history – đọc lịch sử D1 ================== */
app.get("/wa/history", async (c) => {
  const env = c.env;
  const { searchParams } = new URL(c.req.url);
  const chat = (searchParams.get("chat") || "").replace(/\D/g, "");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);

  if (!chat) {
    return addCORS(
      new Response(JSON.stringify({ ok: false, error: "Missing chat" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    );
  }

  let rows = [];
  try {
    if (env.DB) {
      const rs = await env.DB
        .prepare(
          "SELECT id, chat_id, direction, wa_from, wa_to, type, body, ts FROM messages WHERE chat_id = ? ORDER BY ts DESC LIMIT ?"
        )
        .bind(chat, limit)
        .all();
      rows = (rs?.results || []).reverse();
    }
  } catch (e) {
    console.error("D1 history error:", e);
  }

  return addCORS(
    new Response(JSON.stringify({ ok: true, messages: rows }), {
      headers: { "Content-Type": "application/json" },
    })
  );
});

// ======== Admin page guard and redirects ========
const verifyAdmin = async (c) => {
  const token = getCookie(c, "token");
  if (!token || !c.env.JWT_SECRET) return null;
  try {
    const { payload } = await jwtVerify(token, getKey(c.env.JWT_SECRET));
    const { jti } = payload;
    const row = await c.env.DB?.prepare(
      "SELECT revoked, expires_at FROM sessions WHERE jti = ?"
    )
      .bind(jti)
      .first();
    if (!row || row.revoked || !row.expires_at || row.expires_at < Date.now() / 1000) return null;
    return payload;
  } catch {
    return null;
  }
};

const serveAdminLogin = async (c) => {
  const user = await verifyAdmin(c);
  if (user) return c.redirect("/admin/dashboard", 302);
  const res = await c.env.ASSETS.fetch(c.req.raw);
  const headers = new Headers(res.headers);
  headers.set("Cache-Control", "no-store");
  return new Response(res.body, { ...res, headers });
};

app.get("/admin/login", serveAdminLogin);
app.get("/admin/login/", serveAdminLogin);

const redirectAdminRoot = async (c) => {
  const user = await verifyAdmin(c);
  if (!user) return c.redirect("/admin/login", 302);
  return c.redirect("/admin/dashboard", 302);
};

app.get("/admin", redirectAdminRoot);
app.get("/admin/", redirectAdminRoot);

app.route("/admin/api", adminRouter);

// Catch-all cho trang admin SPA (chỉ chặn GET)
app.get("/admin/*", async (c) => {
  if (c.req.path.startsWith("/admin/api")) return c.notFound();
  const user = await verifyAdmin(c);
  if (!user) return c.redirect("/admin/login", 302);
  // Serve SPA assets for admin pages
  return c.env.ASSETS.fetch(c.req.raw);
});

/* ========================= 4) Routers hiện có ========================= */

// Protect sensitive API routes with authentication/authorization
const adminOnlyPaths = [
  "/api/banners",
  "/api/about",
  "/api/news",
  "/api/fields",
  "/api/products",
  "/api/parent_categories",
  "/api/sub_categories",
  "/api/cer-partners",
  "/api/upload-image",
  "/api/editor-upload",
  "/api/translate",
];

const protectContent = async (c, next) => {
  const method = c.req.method;
  if (method === "GET" || method === "OPTIONS") return next();
  await requireAdminAuth(c, async () => {
    await requirePerm("content.manage")(c, next);
  });
};

for (const path of adminOnlyPaths) {
  app.use(path, protectContent);
  app.use(`${path}/*`, protectContent);
}
app.use("/api/users", requireAdminAuth);
app.use("/api/users/*", requireAdminAuth);
app.use("/api/users", requirePerm("users.manage"));
app.use("/api/users/*", requirePerm("users.manage"));

app.route("/", seoRoot);
app.route("/sitemaps", sitemaps);

app.route("/admin", adminCreateTable);
app.route("/put", dinoMigrate);
app.route("/api/seo", seoApp);
app.route("/api/auth", authRouter);
app.route("/api/users", userRouter);
app.route("/api/banners", bannerRouter);
app.route("/api/about", aboutRouter);
app.route("/api/news", newsRouter);
app.route("/api/fields", fieldRouter);
app.route("/api/contacts", contactRouter);
app.route("/api/products", productsRouter);
app.route("/api/parent_categories", parentsRouter);
app.route("/api/sub_categories", subCategoriesRouter);
app.route("/api/cer-partners", cerPartnerRouter);
app.route("/api/upload-image", uploadImageRouter);
app.route("/api/editor-upload", editorUploadRouter);
app.route("/api/translate", translateRouter);
app.route("/api/ga4", ga4Router);
app.route('/api/watermark', watermarkR2Router);


/* ====================== 5) Health check ====================== */
app.get("/api/health", (c) =>
  c.json({
    status: "ok",
    database: c.env.DB_AVAILABLE ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  })
);

/* ====================== 6) SPA fallback (cuối cùng) ====================== */
app.all("*", (c) => c.env.ASSETS.fetch(c.req.raw));

export default { fetch: app.fetch };
