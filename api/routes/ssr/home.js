import {
  escapeHtml,
  escapeAttr,
  stripMd,
  renderIndexWithHead,
  envBrand,
  envCanonical,
} from "../../seo/utils.js";

export async function homeSSR(c) {
  const url = new URL(c.req.url);
  const SITE_URL = url.origin;
  const BRAND = envBrand(c);
  const TAGLINE = c.env.VITE_TAGLINE || "Choose Us — Choose Quality";

  const canonical = `${envCanonical(c, SITE_URL)}/`;

  const path = url.pathname;          
  const noindex = path === "/home";

  const pageTitle = `${BRAND} — ${TAGLINE}`;
  const pageDesc =
    `Trang chủ ${BRAND}: xuất khẩu nông sản Việt Nam, danh mục sản phẩm, lĩnh vực dịch vụ, ` +
    `đối tác chứng nhận quốc tế và tin tức thị trường mới nhất.`;

  const ogImage = c.env.VITE_OG_HOME || `${SITE_URL}/og-home.jpg`;

  // --- lấy data như bạn đang làm ---
  const toJson = (r) => r.json().catch(() => ({}));
  const [catsRes, prodsRes, fieldsRes, newsRes] = await Promise.all([
    fetch(new URL("/api/parent_categories", url), { headers: { Accept: "application/json" } }).then(toJson),
    fetch(new URL("/api/products", url), { headers: { Accept: "application/json" } }).then(toJson),
    fetch(new URL("/api/fields", url), { headers: { Accept: "application/json" } }).then(toJson),
    fetch(new URL("/api/news", url), { headers: { Accept: "application/json" } }).then(toJson),
  ]);
  const cats = Array.isArray(catsRes?.parent_categories) ? catsRes.parent_categories
            : Array.isArray(catsRes) ? catsRes : [];
  const products = Array.isArray(prodsRes?.products) ? prodsRes.products
               : Array.isArray(prodsRes) ? prodsRes : [];
  const fields = Array.isArray(fieldsRes?.fields) ? fieldsRes.fields
             : Array.isArray(fieldsRes) ? fieldsRes : [];
  const news = Array.isArray(newsRes?.news) ? newsRes.news
           : Array.isArray(newsRes) ? newsRes : [];

  // Keywords mở rộng
  const kCats   = cats.map((c) => c?.name).filter(Boolean);
  const kProds  = products.map((p) => p?.title).filter(Boolean);
  const kFields = fields.map((f) => f?.name).filter(Boolean);
  const baseKW = [BRAND, "xuất khẩu nông sản", "Vietnam export", "trái cây", "agriculture", "logistics", "GAP", "partners", "news"];
  const keywords = Array.from(new Set([...baseKW, ...kCats, ...kProds, ...kFields])).join(", ");

  // JSON-LD
  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND,
    url: SITE_URL,
    logo: `${SITE_URL}/logo-512.png`,
    contactPoint: [{
      "@type": "ContactPoint",
      telephone: "+84 383 655 628",
      contactType: "customer service",
      areaServed: ["VN", "Global"],
      availableLanguage: ["vi", "en"],
    }],
  };
  const webSiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BRAND,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
  const webPageLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: pageTitle,
    description: pageDesc,
    url: canonical,
    isPartOf: { "@type": "WebSite", name: BRAND, url: SITE_URL },
  };

  const categoriesLd = cats.length ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Product Categories",
    itemListElement: cats.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: { "@type": "Thing", name: c?.name, url: `${SITE_URL}/product/${encodeURIComponent(c?.slug || "")}` },
    })),
  } : null;

  const productsLd = products.length ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Featured Products",
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: p?.title,
        image: p?.image_url || undefined,
        url: `${SITE_URL}/product/product-detail/${encodeURIComponent(p?.slug || "")}`,
        brand: BRAND,
        offers: (p?.price && p?.currency) ? {
          "@type": "Offer",
          price: String(p.price),
          priceCurrency: p.currency,
          availability: "https://schema.org/InStock",
          url: `${SITE_URL}/product/product-detail/${encodeURIComponent(p?.slug || "")}`,
        } : undefined,
      },
    })),
  } : null;

  const fieldsLd = fields.length ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Services",
    itemListElement: fields.map((f, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Service",
        name: f?.name,
        description: stripMd(f?.content || "").slice(0, 200) || undefined,
        image: f?.image_url || undefined,
        provider: { "@type": "Organization", name: BRAND, url: SITE_URL },
      },
    })),
  } : null;

  const newsLd = news.length ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Latest News",
    itemListElement: news.map((n, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "NewsArticle",
        headline: n?.title,
        url: `${SITE_URL}/news/news-detail/${encodeURIComponent(n?.slug || "")}`,
        image: n?.image_url || undefined,
        datePublished: n?.published_at || undefined,
        dateModified: n?.updated_at || undefined,
        author: n?.author ? [{ "@type": "Person", name: n.author }] : undefined,
        publisher: { "@type": "Organization", name: BRAND, logo: `${SITE_URL}/logo-512.png` },
      },
    })),
  } : null;

  const jsonLd = [organizationLd, webSiteLd, webPageLd, categoriesLd, productsLd, fieldsLd, newsLd]
    .filter(Boolean);

  const head = `
    <title>${escapeHtml(pageTitle)}</title>
    <meta name="description" content="${escapeHtml(pageDesc)}" />
    <meta name="keywords" content="${escapeHtml(keywords)}" />
    <link rel="canonical" href="${escapeAttr(canonical)}" />
    ${noindex ? '<meta name="robots" content="noindex,follow" />' : ''}

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${escapeHtml(BRAND)}" />
    <meta property="og:title" content="${escapeHtml(pageTitle)}" />
    <meta property="og:description" content="${escapeHtml(pageDesc)}" />
    <meta property="og:url" content="${escapeAttr(canonical)}" />
    ${ogImage ? `<meta property="og:image" content="${escapeAttr(ogImage)}" />` : ""}

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(pageTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(pageDesc)}" />
    ${ogImage ? `<meta name="twitter:image" content="${escapeAttr(ogImage)}" />` : ""}

    ${jsonLd.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join("\n")}
  `;

  const resp = await renderIndexWithHead(c, head);
  resp.headers.set("x-which-ssr", "home");
  return resp;
}
