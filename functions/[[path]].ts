
type News = {
  id: number
  title: string
  slug: string
  content: string
  meta_description?: string
  keywords?: string
  image_url?: string
  published_at?: string
  created_at?: string
  updated_at?: string
}

type Product = {
  id: number
  title: string
  slug: string
  description?: string
  content: string
  image_url?: string
  created_at?: string
  updated_at?: string
  category_id?: number | null
}

const STATIC_RE = /\.(js|css|png|jpe?g|webp|svg|gif|ico|json|txt|xml|map|woff2?)$/i

export const onRequest: PagesFunction<{ DB: D1Database }> = async (ctx) => {
  const { request, env } = ctx
  const url = new URL(request.url)

  // Chỉ GET và không phải file tĩnh
  if (request.method !== 'GET' || STATIC_RE.test(url.pathname)) {
    return ctx.next()
  }

  // Lấy HTML gốc (index.html)
  const baseRes = await ctx.next()
  const ctype = baseRes.headers.get('content-type') || ''
  if (!ctype.includes('text/html')) return baseRes

  // Match route
  const mNews = url.pathname.match(/^\/news\/([^\/?#]+)/)
  const mProd = url.pathname.match(/^\/products\/([^\/?#]+)/)

  // Giá trị mặc định
  let title = 'ALLXONE'
  let description = 'ALLXONE: Tin tức & sản phẩm.'
  let image = absolute(url, '/og-default.jpg')
  let canonical = url.toString()
  let robots = 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
  let jsonLd: any = null

  if (mNews) {
    const slug = decodeURIComponent(mNews[1])
    const row = await env.DB
      .prepare(`SELECT * FROM news WHERE slug = ? LIMIT 1`)
      .bind(slug)
      .first<News>()

    if (!row) return baseRes

    // Title & desc
    title = clamp(row.title, 70) || 'Tin tức'
    const raw = (row.meta_description || row.content || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    description = clamp(raw, 160) || description

    image = absolute(url, row.image_url || '/og-default.jpg')
    canonical = absolute(url, `/news/${row.slug}`)

    // Nếu chưa xuất bản => noindex
    if (!row.published_at) {
      robots = 'noindex, nofollow'
    }

    // JSON-LD: NewsArticle
    jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
      headline: row.title,
      image: [image],
      datePublished: row.published_at || row.created_at,
      dateModified: row.updated_at || row.published_at || row.created_at,
      author: [{ '@type': 'Person', name: 'HuyToan' }],
      publisher: {
        '@type': 'Organization',
        name: 'ALLXONE',
        logo: { '@type': 'ImageObject', url: absolute(url, '/logo-512.png') }
      },
      keywords: row.keywords
    }
  }

  if (mProd) {
    const slug = decodeURIComponent(mProd[1])
    const row = await env.DB
      .prepare(`SELECT * FROM products WHERE slug = ? LIMIT 1`)
      .bind(slug)
      .first<Product>()

    if (!row) return baseRes

    title = clamp(row.title, 70) || 'Sản phẩm'
    const raw = (row.description || row.content || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    description = clamp(raw, 160) || description

    image = absolute(url, row.image_url || '/og-default.jpg')
    canonical = absolute(url, `/products/${row.slug}`)

    // JSON-LD: Product (phiên bản tối thiểu)
    jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: row.title,
      image: [image],
      description,
      sku: row.slug,
      url: canonical,
      brand: { '@type': 'Brand', name: 'ALLXONE' }
      // Có giá/availability? Thêm "offers" để có rich result mua hàng
      // offers: { '@type': 'Offer', priceCurrency: 'VND', price: '...', availability: 'https://schema.org/InStock', url: canonical }
    }
  }

  // Không phải route news/products → trả nguyên
  if (!mNews && !mProd) return baseRes

  // Chèn meta/JSON-LD
  const transformed = new HTMLRewriter()
    .on('title', { element(el) { el.setInnerContent(title) } })
    .on('head', {
      element(el) {
        // canonical & robots & description
        el.append(`<link rel="canonical" href="${canonical}">`, { html: true })
        el.append(`<meta name="description" content="${esc(description)}">`, { html: true })
        el.append(`<meta name="robots" content="${robots}">`, { html: true })

        // Open Graph
        el.append(`<meta property="og:type" content="${mNews ? 'article' : 'product'}">`, { html: true })
        el.append(`<meta property="og:locale" content="vi_VN">`, { html: true })
        el.append(`<meta property="og:site_name" content="ALLXONE">`, { html: true })
        el.append(`<meta property="og:url" content="${canonical}">`, { html: true })
        el.append(`<meta property="og:title" content="${esc(title)}">`, { html: true })
        el.append(`<meta property="og:description" content="${esc(description)}">`, { html: true })
        el.append(`<meta property="og:image" content="${image}">`, { html: true })
        el.append(`<meta property="og:image:width" content="1200">`, { html: true })
        el.append(`<meta property="og:image:height" content="630">`, { html: true })

        // Twitter
        el.append(`<meta name="twitter:card" content="summary_large_image">`, { html: true })
        el.append(`<meta name="twitter:title" content="${esc(title)}">`, { html: true })
        el.append(`<meta name="twitter:description" content="${esc(description)}">`, { html: true })
        el.append(`<meta name="twitter:image" content="${image}">`, { html: true })

        // JSON-LD
        if (jsonLd) {
          el.append(`<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`, { html: true })
        }
      }
    })
    .transform(baseRes)

  return transformed
}

/* helpers */
function clamp(s: string | undefined, n: number) {
  if (!s) return ''
  return s.length > n ? s.slice(0, n - 1).trim() + '…' : s
}
function absolute(base: URL, path: string) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  if (!path.startsWith('/')) path = '/' + path
  return `${base.origin}${path}`
}
function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}
