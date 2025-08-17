import { Hono } from "hono"
import booksRouter from "./routes/books"
import bookRelatedRouter from "./routes/book-related"
import uploadImageRouter from "./routes/upload-image"
import editorUploadRouter from "./routes/editor-upload"
import aboutRouter from "./routes/about"
import newsRouter from "./routes/news"
import seoApp from "./routes/seo"
import categoriesRouter from "./routes/categories"
import authRouter from "./routes/auth"
import productsRouter from "./routes/products"
import contactRouter from "./routes/contact"
import userRouter from "./routes/user"

const app = new Hono()

app.use("*", async (c, next) => {
  if (c.env.DB) {
    try {
      await c.env.DB.prepare("SELECT 1").first()
      c.env.DB_AVAILABLE = true
      console.log("D1 Database connected successfully")
    } catch (err) {
      console.error("D1 Database connection error:", err)
      c.env.DB_AVAILABLE = false
    }
  } else {
    console.log("No D1 database binding available")
    c.env.DB_AVAILABLE = false
  }
  await next()
})

// ---------- API ----------
app.route("/api/auth", authRouter)
app.route("/api/users", userRouter)
app.route("/api/contacts", contactRouter)
app.route("/api/books", booksRouter)
app.route("/api/about", aboutRouter)
app.route("/api/news", newsRouter)
app.route("/api/seo", seoApp)
app.route("/api/products", productsRouter)
app.route("/api/categories", categoriesRouter)
app.route("/api/books/:id/related", bookRelatedRouter)
app.route("/api/upload-image", uploadImageRouter)
app.route("/api/editor-upload", editorUploadRouter)

// Health check
app.get("/api/health", async (c) => {
  return c.json({
    status: "ok",
    database: c.env.DB_AVAILABLE ? "connected" : "disconnected",
    timestamp: new Date().toISOString()
  })
})

/* ========================
   SEO EDGE TRANSFORM ROUTES
   (đặt TRƯỚC catch-all)
   ======================== */

// /sitemap.xml – gộp news + products
app.get("/sitemap.xml", async (c) => {
  const origin = new URL(c.req.url).origin

  const news = await c.env.DB.prepare(
    `SELECT slug, COALESCE(updated_at, published_at, created_at) AS lastmod
     FROM news
     WHERE published_at IS NOT NULL
     ORDER BY lastmod DESC
     LIMIT 5000`
  ).all()

  const prods = await c.env.DB.prepare(
    `SELECT slug, COALESCE(updated_at, created_at) AS lastmod
     FROM products
     ORDER BY lastmod DESC
     LIMIT 5000`
  ).all()

  const items = [
    { loc: `${origin}/`, lastmod: new Date().toISOString(), changefreq: "daily", priority: "1.0" },
    ...news.results.map(r => ({
      loc: `${origin}/news/${r.slug}`,
      lastmod: new Date(r.lastmod).toISOString(),
      changefreq: "weekly",
      priority: "0.8"
    })),
    ...prods.results.map(r => ({
      loc: `${origin}/products/${r.slug}`,
      lastmod: new Date(r.lastmod).toISOString(),
      changefreq: "weekly",
      priority: "0.7"
    }))
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${items.map(u => `
      <url>
        <loc>${u.loc}</loc>
        <lastmod>${u.lastmod}</lastmod>
        <changefreq>${u.changefreq}</changefreq>
        <priority>${u.priority}</priority>
      </url>
    `).join("")}
  </urlset>`

  return c.newResponse(xml, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=3600"
    }
  })
})

// (tuỳ chọn) robots.txt – nếu bạn không đặt file tĩnh trong dist/client
app.get("/robots.txt", (c) => {
  const origin = new URL(c.req.url).origin
  return c.text(
`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /search
Sitemap: ${origin}/sitemap.xml
`, 200, { "content-type": "text/plain; charset=utf-8" })
})

// Helper chung
const STATIC_RE = /\.(js|css|png|jpe?g|webp|svg|gif|ico|json|txt|xml|map|woff2?)$/i
const clamp = (s, n) => (!s ? "" : s.length > n ? s.slice(0, n - 1).trim() + "…" : s)
const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;")
const absolute = (baseUrl, path) => {
  if (!path) return ""
  if (/^https?:\/\//i.test(path)) return path
  if (!path.startsWith("/")) path = "/" + path
  return `${baseUrl.origin}${path}`
}

// /news/:slug – chèn <title>/<meta>/JSON-LD từ bảng `news`
app.get("/news/:slug", async (c) => {
  const { slug } = c.req.param()
  const url = new URL(c.req.url)

  // lấy index.html từ assets (SPA mode rơi về index.html)
  const baseRes = await c.env.ASSETS.fetch(c.req.raw)
  const ct = baseRes.headers.get("content-type") || ""
  if (!ct.includes("text/html")) return baseRes

  const row = await c.env.DB.prepare(
    `SELECT id,title,slug,content,meta_description,keywords,image_url,published_at,created_at,updated_at
     FROM news WHERE slug = ? LIMIT 1`
  ).bind(slug).first()

  if (!row) return baseRes

  const title = clamp(row.title, 70) || "Tin tức"
  const raw = (row.meta_description || row.content || "")
    .replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
  const description = clamp(raw, 160) || "ALLXONE: Tin tức & sản phẩm."
  const image = absolute(url, row.image_url || "/og-default.jpg")
  const canonical = absolute(url, `/news/${row.slug}`)
  const robots = row.published_at
    ? "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
    : "noindex, nofollow"

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    headline: row.title,
    image: [image],
    datePublished: row.published_at || row.created_at,
    dateModified: row.updated_at || row.published_at || row.created_at,
    author: [{ "@type": "Person", name: "HuyToan" }],
    publisher: {
      "@type": "Organization",
      name: "ALLXONE",
      logo: { "@type": "ImageObject", url: absolute(url, "/logo-512.png") }
    },
    keywords: row.keywords
  }

  return new HTMLRewriter()
    .on("title", { element(el) { el.setInnerContent(title) } })
    .on("head", {
      element(el) {
        el.append(`<link rel="canonical" href="${canonical}">`, { html: true })
        el.append(`<meta name="description" content="${esc(description)}">`, { html: true })
        el.append(`<meta name="robots" content="${robots}">`, { html: true })

        el.append(`<meta property="og:type" content="article">`, { html: true })
        el.append(`<meta property="og:locale" content="vi_VN">`, { html: true })
        el.append(`<meta property="og:site_name" content="ALLXONE">`, { html: true })
        el.append(`<meta property="og:url" content="${canonical}">`, { html: true })
        el.append(`<meta property="og:title" content="${esc(title)}">`, { html: true })
        el.append(`<meta property="og:description" content="${esc(description)}">`, { html: true })
        el.append(`<meta property="og:image" content="${image}">`, { html: true })
        el.append(`<meta property="og:image:width" content="1200">`, { html: true })
        el.append(`<meta property="og:image:height" content="630">`, { html: true })

        el.append(`<meta name="twitter:card" content="summary_large_image">`, { html: true })
        el.append(`<meta name="twitter:title" content="${esc(title)}">`, { html: true })
        el.append(`<meta name="twitter:description" content="${esc(description)}">`, { html: true })
        el.append(`<meta name="twitter:image" content="${image}">`, { html: true })

        el.append(`<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`, { html: true })
      }
    })
    .transform(baseRes)
})

// /products/:slug – chèn <title>/<meta>/JSON-LD từ bảng `products`
app.get("/products/:slug", async (c) => {
  const { slug } = c.req.param()
  const url = new URL(c.req.url)

  const baseRes = await c.env.ASSETS.fetch(c.req.raw)
  const ct = baseRes.headers.get("content-type") || ""
  if (!ct.includes("text/html")) return baseRes

  const row = await c.env.DB.prepare(
    `SELECT id,title,slug,description,content,image_url,created_at,updated_at
     FROM products WHERE slug = ? LIMIT 1`
  ).bind(slug).first()

  if (!row) return baseRes

  const title = clamp(row.title, 70) || "Sản phẩm"
  const raw = (row.description || row.content || "")
    .replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
  const description = clamp(raw, 160) || "ALLXONE: Tin tức & sản phẩm."
  const image = absolute(url, row.image_url || "/og-default.jpg")
  const canonical = absolute(url, `/products/${row.slug}`)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: row.title,
    image: [image],
    description,
    sku: row.slug,
    url: canonical,
    brand: { "@type": "Brand", name: "ALLXONE" }
    // Có giá? thêm "offers" để có rich result
    // offers: { "@type": "Offer", priceCurrency: "VND", price: "....", availability: "https://schema.org/InStock", url: canonical }
  }

  return new HTMLRewriter()
    .on("title", { element(el) { el.setInnerContent(title) } })
    .on("head", {
      element(el) {
        el.append(`<link rel="canonical" href="${canonical}">`, { html: true })
        el.append(`<meta name="description" content="${esc(description)}">`, { html: true })
        el.append(`<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">`, { html: true })

        el.append(`<meta property="og:type" content="product">`, { html: true })
        el.append(`<meta property="og:locale" content="vi_VN">`, { html: true })
        el.append(`<meta property="og:site_name" content="ALLXONE">`, { html: true })
        el.append(`<meta property="og:url" content="${canonical}">`, { html: true })
        el.append(`<meta property="og:title" content="${esc(title)}">`, { html: true })
        el.append(`<meta property="og:description" content="${esc(description)}">`, { html: true })
        el.append(`<meta property="og:image" content="${image}">`, { html: true })
        el.append(`<meta property="og:image:width" content="1200">`, { html: true })
        el.append(`<meta property="og:image:height" content="630">`, { html: true })

        el.append(`<meta name="twitter:card" content="summary_large_image">`, { html: true })
        el.append(`<meta name="twitter:title" content="${esc(title)}">`, { html: true })
        el.append(`<meta name="twitter:description" content="${esc(description)}">`, { html: true })
        el.append(`<meta name="twitter:image" content="${image}">`, { html: true })

        el.append(`<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`, { html: true })
      }
    })
    .transform(baseRes)
})

/* ========================
   END SEO ROUTES
   ======================== */

// ---------- Catch-all: static assets (SPA) ----------
app.all("*", async (c) => {
  // Phục vụ file trong dist/client, với SPA fallback
  return c.env.ASSETS.fetch(c.req.raw)
})

export default { fetch: app.fetch }
