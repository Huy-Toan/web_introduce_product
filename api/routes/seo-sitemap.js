// api/routes/seo-sitemaps.js
// @ts-check
/// <reference types="@cloudflare/workers-types" />
import { Hono } from "hono";

/**
 * @typedef {Object} Env
 * @property {Fetcher} ASSETS
 * @property {string=} CANONICAL_HOST
 * @property {string=} API_BASE
 */

/** @param {import('hono').Context} c @returns {Env} */
const envOf = (c) => /** @type {Env} */ (c.env);

const esc = (s="") => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const xml = (s) => `<?xml version="1.0" encoding="UTF-8"?>\n${s}`;

/** @template T
 *  @param {import('hono').Context} c
 *  @param {string} path
 *  @param {number} [ttl=300]
 */
async function fetchJson(c, path, ttl = 300) {
  const url = new URL(c.req.url);
  const env = envOf(c);
  const base = (env.API_BASE || url.origin).replace(/\/+$/, "");
  try {
    const res = await fetch(`${base}${path}`, { cf: { cacheTtl: ttl } });
    if (!res.ok) return null;
    return /** @type {Promise<T>} */ (res.json());
  } catch {
    return null;
  }
}

// Router 1: các route ở gốc domain (robots.txt, sitemap.xml)
export const seoRoot = new Hono();

// /robots.txt
seoRoot.get("/robots.txt", (c) => {
  const { host } = new URL(c.req.url);
  const env = envOf(c);
  const CANON = (env.CANONICAL_HOST || "").replace(/\/+$/, "");
  const isCanonical = CANON ? host === CANON : false;

  const allow = [
    "User-agent: *","Allow: /",
    "Disallow: /api/","Disallow: /admin/","Disallow: /static/admin/",
    "Disallow: /*?_cf_recache=","Disallow: /*?preview=",
    "Disallow: /*?utm_","Disallow: /*&utm_","Disallow: /*?fbclid=",
    `Sitemap: https://${CANON || host}/sitemap.xml`,""
  ].join("\n");
  const disallow = "User-agent: *\nDisallow: /\n";

  return c.text(isCanonical ? allow : disallow, 200, {
    "content-type": "text/plain; charset=utf-8",
    "cache-control": "public, s-maxage=3600"
  });
});

// /sitemap.xml (index)
seoRoot.get("/sitemap.xml", (c) => {
  const { origin } = new URL(c.req.url);
  const env = envOf(c);
  const CANON = (env.CANONICAL_HOST || "").replace(/\/+$/, "");
  const base = CANON ? `https://${CANON}` : origin;

  const children = [
    `${base}/sitemaps/pages.xml`,
    `${base}/sitemaps/news.xml`,
    `${base}/sitemaps/products.xml`,
    `${base}/sitemaps/categories.xml`,
  ];

  const body = xml(
`<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${children.map(loc => `  <sitemap><loc>${loc}</loc></sitemap>`).join("\n")}
</sitemapindex>`
  );

  return c.text(body, 200, {
    "content-type": "application/xml; charset=utf-8",
    "cache-control": "public, s-maxage=3600"
  });
});

// Router 2: nhóm dưới /sitemaps/*
export const sitemaps = new Hono();

// /sitemaps/pages.xml (trang tĩnh)
sitemaps.get("/pages.xml", (c) => {
  const { origin } = new URL(c.req.url);
  const env = envOf(c);
  const CANON = (env.CANONICAL_HOST || "").replace(/\/+$/, "");
  const base = CANON ? `https://${CANON}` : origin;

  const pages = [
    { path: "/",            changefreq: "daily",   priority: 1.0 },
    { path: "/about",       changefreq: "yearly",  priority: 0.6 },
    { path: "/contact",     changefreq: "yearly",  priority: 0.5 },
    { path: "/what_we_do",  changefreq: "monthly", priority: 0.7 },
    { path: "/news",        changefreq: "hourly",  priority: 0.8 },
    { path: "/product",     changefreq: "daily",   priority: 0.9 },
  ];

  const urlset = pages.map(p => {
    const loc = esc(base + p.path);
    const cf = p.changefreq ? `<changefreq>${p.changefreq}</changefreq>` : "";
    const pr = typeof p.priority === "number" ? `<priority>${p.priority.toFixed(1)}</priority>` : "";
    return `  <url><loc>${loc}</loc>${cf}${pr}</url>`;
  }).join("\n");

  const body = xml(
`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlset}
</urlset>`
  );

  return c.text(body, 200, {
    "content-type": "application/xml; charset=utf-8",
    "cache-control": "public, s-maxage=3600"
  });
});

// /sitemaps/news.xml
sitemaps.get("/news.xml", async (c) => {
  const { origin } = new URL(c.req.url);
  const env = envOf(c);
  const CANON = (env.CANONICAL_HOST || "").replace(/\/+$/, "");
  const base = CANON ? `https://${CANON}` : origin;

  const data = await fetchJson(c, "/api/news", 300);
  const items = (data?.news || [])
    .filter(n => n?.slug)
    .map(n => ({
      loc: `${base}/news/news-detail/${encodeURIComponent(n.slug)}`,
      lastmod: n.updated_at || n.published_at || n.created_at
    }));

  const body = xml(
`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items.map(i => `  <url><loc>${esc(i.loc)}</loc>${i.lastmod ? `<lastmod>${new Date(i.lastmod).toISOString()}</lastmod>`:""}</url>`).join("\n")}
</urlset>`
  );

  return c.text(body, 200, {
    "content-type": "application/xml; charset=utf-8",
    "cache-control": "public, s-maxage=900"
  });
});

// /sitemaps/products.xml
sitemaps.get("/products.xml", async (c) => {
  const { origin } = new URL(c.req.url);
  const env = envOf(c);
  const CANON = (env.CANONICAL_HOST || "").replace(/\/+$/, "");
  const base = CANON ? `https://${CANON}` : origin;

  let data = await fetchJson(c, "/api/products?limit=1000", 600);
  if (!data) data = await fetchJson(c, "/api/products", 600);
  const list = (data?.products || data?.items || data || []);

  const items = list
    .filter(p => p?.slug || p?.id)
    .map(p => {
      const slug = (p.slug ?? p.id);
      return {
        loc: `${base}/product/product-detail/${encodeURIComponent(String(slug))}`,
        lastmod: p.updated_at || p.created_at
      };
    });

  const body = xml(
`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items.map(i => `  <url><loc>${esc(i.loc)}</loc>${i.lastmod ? `<lastmod>${new Date(i.lastmod).toISOString()}</lastmod>`:""}</url>`).join("\n")}
</urlset>`
  );

  return c.text(body, 200, {
    "content-type": "application/xml; charset=utf-8",
    "cache-control": "public, s-maxage=1800"
  });
});

// /sitemaps/categories.xml
sitemaps.get("/categories.xml", async (c) => {
  const { origin } = new URL(c.req.url);
  const env = envOf(c);
  const CANON = (env.CANONICAL_HOST || "").replace(/\/+$/, "");
  const base = CANON ? `https://${CANON}` : origin;

  const parents = await fetchJson(c, "/api/parent_categories", 1200);
  const parentItems = (parents?.items || parents?.parent_categories || [])
    .filter(x => x?.slug)
    .map(x => ({ loc: `${base}/product/${encodeURIComponent(String(x.slug))}`, lastmod: x.updated_at }));

  const body = xml(
`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${parentItems.map(i => `  <url><loc>${esc(i.loc)}</loc>${i.lastmod ? `<lastmod>${new Date(i.lastmod).toISOString()}</lastmod>`:""}</url>`).join("\n")}
</urlset>`
  );

  return c.text(body, 200, {
    "content-type": "application/xml; charset=utf-8",
    "cache-control": "public, s-maxage=3600"
  });
});
