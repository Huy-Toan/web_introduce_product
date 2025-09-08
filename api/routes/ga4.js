// api/routes/ga4.js
import { Hono } from "hono";
import { ga4RunReport, ga4RunRealtime } from "../utils/ga4";

export const ga4Router = new Hono();

// (tuỳ chọn) middleware kiểm tra admin nếu bạn đã có
// ga4Router.use("*", yourAuthMiddleware);

// CORS cho dev + production
ga4Router.all("*", async (c, next) => {
    const origin = c.req.header("Origin") || "";

    // whitelist domain
    const allowed = [
        "http://localhost:5173",      // dev local
        "https://beta.itxeasy.com",   // staging
        "https://itxeasy.com"         // production
    ];

    if (allowed.includes(origin)) {
        c.header("Access-Control-Allow-Origin", origin);
    }

    c.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    c.header("Access-Control-Allow-Headers", "content-type,authorization");

    if (c.req.method === "OPTIONS") {
        return c.text("", 204);
    }

    await next();
});



// ================== REPORT ==================

// POST /api/ga4/report
// -> KPI tổng: activeUsers, newUsers, screenPageViews, averageSessionDuration
ga4Router.post("/report", async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const query = body?.query ?? {
        dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
        metrics: [
            { name: "activeUsers" },
            { name: "newUsers" },
            { name: "screenPageViews" },
            { name: "averageSessionDuration" },
        ],
    };

    try {
        const data = await ga4RunReport(c.env, query);
        return c.json(data);
    } catch (e) {
        return c.json({ error: String(e.message || e) }, 500);
    }
});

// GET /api/ga4/realtime
ga4Router.get("/realtime", async (c) => {
    const query = {
        metrics: [{ name: "activeUsers" }],
        dimensions: [{ name: "country" }],
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
        limit: 25,
    };

    try {
        const data = await ga4RunRealtime(c.env, query);
        return c.json(data);
    } catch (e) {
        return c.json({ error: String(e.message || e) }, 500);
    }
});

// GET /api/ga4/top-pages?days=28&limit=20
ga4Router.get("/top-pages", async (c) => {
    const url = new URL(c.req.url);
    const days = url.searchParams.get("days") || "28";
    const limit = Number(url.searchParams.get("limit") || "20");

    const query = {
        dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
        dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
        metrics: [{ name: "screenPageViews" }, { name: "totalUsers" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit,
    };

    try {
        const data = await ga4RunReport(c.env, query);
        return c.json(data);
    } catch (e) {
        return c.json({ error: String(e.message || e) }, 500);
    }
});


// ================== PRODUCTS / NEWS ==================

// Helper: lấy theo prefix và trả { name (pageTitle), views, path }
async function getByPrefixWithTitle(env, prefix, days = "28", limit = 50) {
    const query = {
        dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
        dimensions: [
            { name: "pagePath" },
            { name: "pageTitle" }, // lấy luôn tên trang
        ],
        metrics: [{ name: "screenPageViews" }, { name: "totalUsers" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 10000,
        dimensionFilter: {
            filter: {
                fieldName: "pagePath",
                stringFilter: { value: prefix, matchType: "BEGINS_WITH" },
            },
        },
    };

    const raw = await ga4RunReport(env, query);

    const items =
        (raw.rows || [])
            .map((r) => {
                const path = r.dimensionValues?.[0]?.value || "";
                const title = r.dimensionValues?.[1]?.value || "";
                const views = Number(r.metricValues?.[0]?.value || 0);
                return { name: title || path, views, path };
            })
            // gộp theo tên nếu GA4 trả nhiều title khác nhau cho cùng path (giữ tổng views)
            .reduce((acc, cur) => {
                const key = cur.name;
                acc.set(key, { ...cur, views: (acc.get(key)?.views || 0) + cur.views });
                return acc;
            }, new Map())
            .values();

    // sắp xếp và cắt theo limit
    return Array.from(items)
        .sort((a, b) => b.views - a.views)
        .slice(0, limit);
}

// GET /api/ga4/products-views?days=28&limit=50
// -> { items: [{ name, views, path }], count }
ga4Router.get("/products-views", async (c) => {
    const url = new URL(c.req.url);
    const days = url.searchParams.get("days") || "28";
    const limit = Number(url.searchParams.get("limit") || "50");

    try {
        const items = await getByPrefixWithTitle(
            c.env,
            "/product/product-detail/",
            days,
            limit
        );
        return c.json({ items, count: items.length });
    } catch (e) {
        return c.json({ error: String(e.message || e) }, 500);
    }
});

// GET /api/ga4/news-views?days=28&limit=50
// -> { items: [{ name, views, path }], count }
ga4Router.get("/news-views", async (c) => {
    const url = new URL(c.req.url);
    const days = url.searchParams.get("days") || "28";
    const limit = Number(url.searchParams.get("limit") || "50");

    try {
        const items = await getByPrefixWithTitle(
            c.env,
            "/news/news-detail/",
            days,
            limit
        );
        return c.json({ items, count: items.length });
    } catch (e) {
        return c.json({ error: String(e.message || e) }, 500);
    }
});


export default ga4Router;
