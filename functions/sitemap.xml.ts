// functions/sitemap.xml.ts
export const onRequest: PagesFunction<{ DB: D1Database }> = async (ctx) => {
  const { env, request } = ctx
  const url = new URL(request.url)
  const origin = url.origin

  // News: chỉ lấy bài có published_at (coi như đã xuất bản)
  const news = await env.DB.prepare(
    `SELECT slug, COALESCE(updated_at, published_at, created_at) AS lastmod
     FROM news
     WHERE published_at IS NOT NULL
     ORDER BY lastmod DESC
     LIMIT 5000`
  ).all<{ slug: string; lastmod: string }>()

  // Products
  const prods = await env.DB.prepare(
    `SELECT slug, COALESCE(updated_at, created_at) AS lastmod
     FROM products
     ORDER BY lastmod DESC
     LIMIT 5000`
  ).all<{ slug: string; lastmod: string }>()

  const items = [
    { loc: `${origin}/`, lastmod: new Date().toISOString(), changefreq: 'daily', priority: '1.0' },
    ...news.results.map(r => ({
      loc: `${origin}/news/${r.slug}`,
      lastmod: new Date(r.lastmod).toISOString(),
      changefreq: 'weekly',
      priority: '0.8'
    })),
    ...prods.results.map(r => ({
      loc: `${origin}/products/${r.slug}`,
      lastmod: new Date(r.lastmod).toISOString(),
      changefreq: 'weekly',
      priority: '0.7'
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
    `).join('')}
  </urlset>`

  return new Response(xml, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=3600'
    }
  })
}
