// api/routes/seo-news-detail.js
import { escapeHtml, escapeAttr, stripMd, renderIndexWithHead, envBrand, envCanonical } from "../../seo/utils.js";

function isAbs(u) { return /^https?:\/\//i.test(u || ""); }
function joinUrl(base, p) {
  const b = (base || "").replace(/\/+$/, "");
  const q = (p || "").replace(/^\/+/, "");
  return `${b}/${q}`;
}

export async function newsDetailSSR(c) {
  const url = new URL(c.req.url);
  const params = c.req.param?.() || {};
  const slugInUrl = params.slug || ""; // /news/news-detail/:slug

  const SUPPORTED = ["vi", "en"];
  const lc = (url.searchParams.get("locale") || "").toLowerCase();
  const locale = SUPPORTED.includes(lc) ? lc : "vi";

  // 1) Lấy chi tiết bài hiện tại theo locale
  let item = null;
  try {
    const apiUrl = new URL(`/api/news/${encodeURIComponent(slugInUrl)}`, url.origin);
    apiUrl.searchParams.set("locale", locale);
    const r = await fetch(apiUrl.toString(), { headers: { Accept: "application/json" }, cache: "no-store" });
    const j = await r.json().catch(() => ({}));
    item = j?.news || null;
  } catch {}

  const BRAND = envBrand(c);
  const SITE_URL = url.origin;

  // Nếu API trả về slug "chuẩn" khác với slug trong URL, vẫn canonical theo slug chuẩn
  const slug = (item?.slug || slugInUrl || "").trim();
  const canonical = `${envCanonical(c, SITE_URL)}/news/news-detail/${encodeURIComponent(slug)}`;

  // 2) META
  const title0 = item?.title?.trim();
  const pageTitle = title0 ? `${title0} | ${BRAND}` : `${locale === "vi" ? "Tin tức" : "News"} | ${BRAND}`;

  const raw = [item?.summary, item?.content].filter(Boolean).map(stripMd).join(" ");
  const pageDesc = raw
    ? raw.slice(0, 300)
    : (locale === "vi"
        ? `Tin tức từ ${BRAND}: cập nhật thông tin, hoạt động, đối tác và chia sẻ chuyên môn.`
        : `News from ${BRAND}: updates, activities, partners, and insights.`);

  const keywordsBase = locale === "vi"
    ? ["Tin tức","bài viết","cập nhật","ITXEASY","Việt Nam"]
    : ["News","article","update","ITXEASY","Vietnam"];
  const extra = (item?.tags || [])
    .concat(item?.title ? [item.title] : [])
    .map(s => (s || "").toString().trim())
    .filter(Boolean);
  const keywords = Array.from(new Set([...keywordsBase, ...extra])).join(", ");

  const ogImage = (() => {
    const img = item?.image_url || "/banner.jpg";
    return isAbs(img) ? img : joinUrl(SITE_URL, img);
  })();

  const publishedTime = item?.published_at || item?.created_at || "";
  const modifiedTime = item?.updated_at || publishedTime || "";

  // 3) JSON-LD
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {"@type":"ListItem","position":1,"name":"Home","item":`${SITE_URL}/`},
      {"@type":"ListItem","position":2,"name": locale === "vi" ? "Tin tức" : "News", "item": `${envCanonical(c, SITE_URL)}/news`},
      {"@type":"ListItem","position":3,"name": title0 || (locale === "vi" ? "Chi tiết" : "Detail"), "item": canonical},
    ],
  };

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    headline: title0 || "",
    description: pageDesc,
    image: ogImage ? [ogImage] : undefined,
    datePublished: publishedTime || undefined,
    dateModified: modifiedTime || undefined,
    author: item?.author ? [{ "@type": "Person", "name": item.author }] : undefined,
    publisher: {
      "@type": "Organization",
      name: BRAND,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo-512.png` },
    },
  };

  const organizationLd = {
    "@context":"https://schema.org","@type":"Organization",
    name: BRAND, url: SITE_URL, logo: `${SITE_URL}/logo-512.png`,
  };

  const noindex = !item; // không tìm thấy bài → noindex để tránh index 404

  const head = `
    <title>${escapeHtml(pageTitle)}</title>
    <meta name="description" content="${escapeHtml(pageDesc)}" />
    <meta name="keywords" content="${escapeHtml(keywords)}" />
    <link rel="canonical" href="${escapeAttr(canonical)}" />
    ${noindex ? '<meta name="robots" content="noindex,follow" />' : ''}

    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="${escapeHtml(BRAND)}" />
    <meta property="og:title" content="${escapeHtml(pageTitle)}" />
    <meta property="og:description" content="${escapeHtml(pageDesc)}" />
    <meta property="og:url" content="${escapeAttr(canonical)}" />
    <meta property="og:image" content="${escapeAttr(ogImage)}" />
    ${publishedTime ? `<meta property="article:published_time" content="${escapeAttr(publishedTime)}" />` : ""}
    ${modifiedTime ? `<meta property="article:modified_time" content="${escapeAttr(modifiedTime)}" />` : ""}

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(pageTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(pageDesc)}" />
    <meta name="twitter:image" content="${escapeAttr(ogImage)}" />

    <script type="application/ld+json">${JSON.stringify(breadcrumbLd)}</script>
    <script type="application/ld+json">${JSON.stringify(articleLd)}</script>
    <script type="application/ld+json">${JSON.stringify(organizationLd)}</script>
  `;

  return renderIndexWithHead(c, head);
}
