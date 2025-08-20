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

const app = new Hono();

/** ===================== D1 check middleware ===================== */
app.use("*", async (c, next) => {
    if (c.env.DB) {
        try {
            await c.env.DB.prepare("SELECT 1").first();
            c.set("DB_AVAILABLE", true);
        } catch (e) {
            console.error("D1 Database connection error:", e);
            c.set("DB_AVAILABLE", false);
        }
    } else {
        console.log("No D1 database binding available");
        c.set("DB_AVAILABLE", false);
    }
    await next();
});

/** ===================== WHATSAPP WEBHOOK ===================== */
/* GET /webhook  → Meta verify */
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

/* POST /webhook → nhận inbound, lưu D1 (tối giản) */
app.post("/webhook", async (c) => {
    const env = c.env;
    const payload = await c.req.json().catch(() => ({}));

    try {
        const entry = payload.entry?.[0];
        const change = entry?.changes?.[0];
        const value = change?.value;
        const msg = value?.messages?.[0];

        if (msg) {
            const from = (msg.from || "").replace(/\D/g, ""); // số khách E.164
            const to = env.BUSINESS_WA_E164 || "";
            const type = msg.type;
            const body = type === "text" ? (msg.text?.body || "") : `[${type}]`;
            const ts = parseInt(msg.timestamp || (Date.now() / 1000), 10) * 1000;

            if (env.DB) {
                await env.DB.prepare(
                    "INSERT INTO messages(chat_id, direction, wa_from, wa_to, type, body, ts) VALUES (?,?,?,?,?,?,?)"
                ).bind(from, "in", from, to, type, body, ts).run();
            }
        }
    } catch (e) {
        console.error("Webhook error:", e);
    }

    return c.text("OK", 200);
});

/** ===================== Your existing APIs ===================== */
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

/** ===================== Health check ===================== */
app.get("/api/health", (c) => {
    return c.json({
        status: "ok",
        database: c.get("DB_AVAILABLE") ? "connected" : "disconnected",
        timestamp: new Date().toISOString(),
    });
});

/** ===================== SPA fallback (GIỮ CUỐI CÙNG) ===================== */
app.all("*", (c) => c.env.ASSETS.fetch(c.req.raw));

export default { fetch: app.fetch };
