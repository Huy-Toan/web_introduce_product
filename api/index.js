// api/index.js
import { Hono } from "hono";

import uploadImageRouter from "./routes/upload-image";
import editorUploadRouter from "./routes/editor-upload";
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
            new Response(JSON.stringify({ ok: false, error: "Missing PHONE_NUMBER_ID or WHATSAPP_TOKEN" }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            })
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

    try {
        if (env.DB) {
            await env.DB
                .prepare(
                    "INSERT INTO messages(chat_id, direction, wa_from, wa_to, type, body, ts) VALUES (?,?,?,?,?,?,?)"
                )
                .bind(dest, "out", env.BUSINESS_WA_E164 || "", dest, dbType, dbBody, Date.now())
                .run();
        }
    } catch (e) {
        console.error("D1 insert outgoing error:", e);
    }

    return addCORS(
        new Response(JSON.stringify({ ok: true, data }), {
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

/* ========================= 4) Routers hiện có ========================= */
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
