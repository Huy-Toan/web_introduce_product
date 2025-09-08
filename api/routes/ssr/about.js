import { escapeHtml, escapeAttr, stripMd, renderIndexWithHead, envBrand, envCanonical } from "../../seo/utils.js";

export async function aboutSSR(c){
  const url = new URL(c.req.url);
  const SUPPORTED = ["vi","en"];
  const lc = (url.searchParams.get("locale") || "").toLowerCase();
  const locale = SUPPORTED.includes(lc) ? lc : "vi";

  // 1) Lấy dữ liệu about
  const apiUrl = new URL("/api/about", url);
  apiUrl.searchParams.set("locale", locale);
  let about = [];
  try {
    const apiRes = await fetch(apiUrl.toString(), { headers: { Accept: "application/json" } });
    const j = await apiRes.json().catch(() => ({}));
    about = Array.isArray(j?.about) ? j.about : [];
  } catch {}

  // 2) Build meta
  const BRAND = envBrand(c);
  const SITE_URL = url.origin;
  const canonical = `${envCanonical(c, SITE_URL)}/about`;

  const tBreadcrumb = locale === "vi" ? "Giới thiệu" : "About Us";
  const title0 = about?.[0]?.title?.trim();
  const pageTitle = title0 ? `${title0} | ${BRAND}` : `${tBreadcrumb} | ${BRAND}`;

  const a = about?.[0]?.content || "";
  const b = about?.[1]?.content || "";
  const raw = [a, b].filter(Boolean).map(stripMd).join(" ");
  const pageDesc = raw
    ? raw.slice(0, 300)
    : (locale === "vi"
        ? `Giới thiệu ${BRAND}: đơn vị xuất khẩu nông sản Việt Nam, quy trình tiêu chuẩn, đối tác toàn cầu.`
        : `About ${BRAND}: Vietnamese agricultural exports, standardized processes, global partners.`);

  const keywordsBase = locale === "vi"
    ? ["Giới thiệu","xuất khẩu","nông sản","ITXEASY","Vietnam export"]
    : ["About Us","export","agriculture","ITXEASY","Vietnam export"];
  const extra = (about || []).map(s => s?.title).filter(Boolean);
  const keywords = Array.from(new Set([...keywordsBase, ...extra])).join(", ");

  const ogImage = about?.[0]?.image_url || `${SITE_URL}/banner.jpg`;

  const created = (about || []).map(s => s?.created_at).filter(Boolean).sort();
  const publishedTime = created[0];
  const modifiedTime = (about || [])
    .map(s => s?.updated_at || s?.created_at).filter(Boolean).sort().slice(-1)[0] || publishedTime;

  const breadcrumbLd = {
    "@context":"https://schema.org","@type":"BreadcrumbList",
    itemListElement:[
      {"@type":"ListItem","position":1,"name":"Home","item":`${SITE_URL}/`},
      {"@type":"ListItem","position":2,"name":tBreadcrumb,"item":canonical},
    ],
  };
  const aboutPageLd = {
    "@context":"https://schema.org","@type":"AboutPage",
    name: pageTitle, description: pageDesc, url: canonical,
    isPartOf: {"@type":"WebSite", name: BRAND, url: SITE_URL},
  };
  const organizationLd = {
    "@context":"https://schema.org","@type":"Organization",
    name: BRAND, url: SITE_URL, logo: `${SITE_URL}/logo-512.png`,
  };
  const noindex = (about || []).length === 0;

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
    <meta property="og:image" content="${escapeAttr(ogImage)}" />
    ${publishedTime ? `<meta property="article:published_time" content="${escapeAttr(publishedTime)}" />` : ""}
    ${modifiedTime ? `<meta property="article:modified_time" content="${escapeAttr(modifiedTime)}" />` : ""}

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(pageTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(pageDesc)}" />
    <meta name="twitter:image" content="${escapeAttr(ogImage)}" />

    <script type="application/ld+json">${JSON.stringify(breadcrumbLd)}</script>
    <script type="application/ld+json">${JSON.stringify(aboutPageLd)}</script>
    <script type="application/ld+json">${JSON.stringify(organizationLd)}</script>
  `;

  return renderIndexWithHead(c, head);
}
