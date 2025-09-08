// api/routes/ssr/newsList.js
import {
  escapeHtml,
  escapeAttr,
  stripMd,
  renderIndexWithHead,
  envBrand,
  envCanonical,
} from "../../seo/utils.js";

export async function newsListSSR(c) {
  const url = new URL(c.req.url);
  const SITE_URL = url.origin;
  const BRAND = envBrand(c);

  // locale (nếu có ?locale=)
  const SUPPORTED = ["vi","en"];
  const lc = (url.searchParams.get("locale") || "").toLowerCase();
  const locale = SUPPORTED.includes(lc) ? lc : "vi";

  // phân trang nhẹ phía SSR để tạo ItemList (FE có thể khác page size)
  const PAGE_SIZE = parseInt(url.searchParams.get("pageSize") || "12", 10);
  const currentPage = Math.max(parseInt(url.searchParams.get("page") || "1", 10), 1);

  const canonicalBase = `${envCanonical(c, SITE_URL)}/news`;
  const canonical = canonicalBase; // hoặc `${canonicalBase}?locale=${locale}` nếu muốn

  const pageTitle = `${locale === "vi" ? "Tin tức" : "News"} | ${BRAND}`;

  // 1) Lấy data news
  let newsData = [];
  try {
    const res = await fetch(new URL("/api/news", url).toString(), { headers: { Accept: "application/json" }});
    const j = await res.json().catch(() => ({}));
    newsData = Array.isArray(j?.news) ? j.news : (Array.isArray(j) ? j : []);
  } catch {}

  // 2) Desc + ogImage + keywords
  const topSnippets = (newsData || [])
    .slice(0, 6)
    .map((n) => n?.meta_description || stripMd(n?.content || "").slice(0, 140) || n?.title)
    .filter(Boolean)
    .join(" • ");

  const pageDesc = topSnippets || (
    locale === "vi"
      ? `Tin tức ${BRAND}: cập nhật thị trường, quy trình xuất khẩu, chứng nhận, đối tác, logistics nông sản Việt Nam.`
      : `${BRAND} news: market updates, export process, certifications, partners, and logistics for Vietnamese agriculture.`
  );

  const ogImage = (newsData.find((n) => n?.image_url)?.image_url) || `${SITE_URL}/banner.jpg`;

  const kwsFromItems = (newsData || [])
    .flatMap((n) => String(n?.keywords || "").split(",").map((s) => s.trim()).filter(Boolean));
  const baseKW = locale === "vi"
    ? ["news","tin tức","xuất khẩu","nông sản","Vietnam export",BRAND]
    : ["news","vietnam export","agriculture","logistics","updates",BRAND];
  const keywords = Array.from(new Set([...baseKW, ...kwsFromItems])).join(", ");

  // 3) times + noindex
  const publishedTime = (newsData || [])
    .map((n) => n?.published_at || n?.created_at)
    .filter(Boolean).sort()[0];
  const modifiedTime = (newsData || [])
    .map((n) => n?.updated_at || n?.published_at || n?.created_at)
    .filter(Boolean).sort().slice(-1)[0] || publishedTime;

  const noindex = (newsData || []).length === 0;

  // 4) Pagination slice cho ItemList
  const start = (currentPage - 1) * PAGE_SIZE;
  const paginated = (newsData || []).slice(start, start + PAGE_SIZE);

  // 5) JSON-LD
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: locale === "vi" ? "Tin tức" : "News", item: canonical },
    ],
  };

  const collectionPageLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: pageTitle,
    description: pageDesc,
    url: canonical,
    isPartOf: { "@type": "WebSite", name: BRAND, url: SITE_URL },
  };

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: paginated.map((n, i) => ({
      "@type": "ListItem",
      position: start + i + 1,
      item: {
        "@type": "NewsArticle",
        headline: n?.title,
        url: `${SITE_URL}/news/news-detail/${encodeURIComponent(n?.slug || "")}`,
        datePublished: n?.published_at || n?.created_at || undefined,
        dateModified: n?.updated_at || undefined,
        image: n?.image_url || undefined,
        publisher: { "@type": "Organization", name: BRAND, logo: `${SITE_URL}/logo-512.png` },
      },
    })),
  };

  // 6) Head
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

    ${publishedTime ? `<meta property="article:published_time" content="${escapeAttr(publishedTime)}" />` : ""}
    ${modifiedTime ? `<meta property="article:modified_time" content="${escapeAttr(modifiedTime)}" />` : ""}

    <script type="application/ld+json">${JSON.stringify(breadcrumbLd)}</script>
    <script type="application/ld+json">${JSON.stringify(collectionPageLd)}</script>
    <script type="application/ld+json">${JSON.stringify(itemListLd)}</script>
  `;

  return renderIndexWithHead(c, head);
}
