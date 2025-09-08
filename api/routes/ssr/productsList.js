// api/routes/ssr/productsList.js
import {
  escapeHtml,
  escapeAttr,
  stripMd,
  renderIndexWithHead,
  envBrand,
  envCanonical,
} from "../../seo/utils.js";

/**
 * Hỗ trợ 3 route:
 *   /product
 *   /product/:parent
 *   /product/:parent/:sub
 */
export async function productsListSSR(c) {
  const url = new URL(c.req.url);
  const params = c.req.param ? c.req.param() : {}; // Hono
  const parentSlug = params?.parent || "";
  const subSlug = params?.sub || "";

  const SITE_URL = url.origin;
  const BRAND = envBrand(c);
  const canonicalHost = envCanonical(c, SITE_URL);

  // canonical path
  let p = "/product";
  if (parentSlug) p += `/${encodeURIComponent(parentSlug)}`;
  if (subSlug) p += `/${encodeURIComponent(subSlug)}`;
  const canonical = `${canonicalHost}${p}`;

  // 1) Lấy dữ liệu
  const toJson = (r) => r.json().catch(() => ({}));
  const [catsRes, subsRes, prodsRes] = await Promise.all([
    fetch(new URL("/api/parent_categories", url), { headers: { Accept: "application/json" } }).then(toJson),
    fetch(new URL("/api/sub_categories", url),   { headers: { Accept: "application/json" } }).then(toJson),
    fetch(new URL("/api/products", url),         { headers: { Accept: "application/json" } }).then(toJson),
  ]);

  const parents = Array.isArray(catsRes?.parent_categories) ? catsRes.parent_categories
                : Array.isArray(catsRes) ? catsRes : [];
  const subs    = Array.isArray(subsRes?.sub_categories) ? subsRes.sub_categories
                : Array.isArray(subsRes) ? subsRes : [];
  const products = Array.isArray(prodsRes?.products) ? prodsRes.products
                 : Array.isArray(prodsRes) ? prodsRes : [];

  const parentMeta = parents.find((p) => p?.slug === parentSlug);
  const subMeta    = subs.find((s) => s?.slug === subSlug && s?.parent_slug === parentSlug) || subs.find((s) => s?.slug === subSlug);

  // 2) Tiêu đề + mô tả
  const pageTitle = subMeta?.name
    ? `${subMeta.name} | Sản phẩm | ${BRAND}`
    : parentMeta?.name
      ? `${parentMeta.name} | Sản phẩm | ${BRAND}`
      : `Sản phẩm | ${BRAND}`;

  // lọc sản phẩm theo slug nếu có đủ thông tin; nếu schema khác, cứ để toàn bộ
  const filtered = products.filter((p) => {
    if (parentSlug && subSlug) {
      // thử các variant field phổ biến
      return (
        p?.parent_slug === parentSlug && (p?.sub_slug === subSlug || p?.category_slug === subSlug)
      ) || (
        p?.category_parent_slug === parentSlug && (p?.category_sub_slug === subSlug || p?.category_slug === subSlug)
      ) || (!p?.parent_slug && !p?.category_parent_slug); // fallback giữ lại nếu schema không có
    }
    if (parentSlug && !subSlug) {
      return (
        p?.parent_slug === parentSlug ||
        p?.category_parent_slug === parentSlug ||
        p?.category_slug === parentSlug // 1 số schema chỉ có 1 cấp
      ) || (!p?.parent_slug && !p?.category_parent_slug);
    }
    return true;
  });

  const topTitles = filtered.slice(0, 12).map((p) => p?.title || p?.name).filter(Boolean);
  const prefix = subMeta?.description || parentMeta?.description || "";
  const tail = topTitles.join(", ");
  const base = [prefix, tail].filter(Boolean).join(" — ");
  const pageDesc = base || `Danh mục sản phẩm ${subMeta?.name || parentMeta?.name || BRAND}. Xuất khẩu nông sản Việt Nam chất lượng cao.`;

  // 3) Keywords
  const kwSet = new Set([
    subMeta?.name,
    parentMeta?.name,
    "sản phẩm","xuất khẩu","nông sản","trái cây","export","agriculture","Vietnam", BRAND
  ].filter(Boolean));
  const keywords = Array.from(kwSet).join(", ");

  // 4) JSON-LD
  const breadcrumbItems = [
    { name: "Product", url: `${SITE_URL}/product` },
  ];
  if (parentSlug) {
    breadcrumbItems.push({
      name: parentMeta?.name || decodeURIComponent(parentSlug),
      url: `${SITE_URL}/product/${encodeURIComponent(parentSlug)}`
    });
  }
  if (subSlug) {
    breadcrumbItems.push({
      name: subMeta?.name || decodeURIComponent(subSlug),
      url: `${SITE_URL}/product/${encodeURIComponent(parentSlug)}/${encodeURIComponent(subSlug)}`
    });
  }
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: b.name,
      item: b.url,
    })),
  };

  const collectionPageLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: pageTitle,
    description: pageDesc,
    url: canonical,
    isPartOf: { "@type": "WebSite", name: BRAND, url: SITE_URL },
  };

  // đơn giản: lấy 1 trang đầu 12 item để tạo ItemList
  const PAGE_SIZE = parseInt(url.searchParams.get("pageSize") || "12", 10);
  const currentPage = Math.max(parseInt(url.searchParams.get("page") || "1", 10), 1);
  const start = (currentPage - 1) * PAGE_SIZE;
  const paginated = filtered.slice(start, start + PAGE_SIZE);

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: paginated.map((p, idx) => ({
      "@type": "ListItem",
      position: idx + 1 + start,
      item: {
        "@type": "Product",
        name: p?.title || p?.name,
        url: `${SITE_URL}/product/product-detail/${encodeURIComponent(p?.slug || p?.id || "")}`,
        image: p?.image_url || undefined,
        brand: BRAND,
      },
    })),
  };

  const noindex = (filtered || []).length === 0;

  // 5) Head
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

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(pageTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(pageDesc)}" />

    <script type="application/ld+json">${JSON.stringify(breadcrumbLd)}</script>
    <script type="application/ld+json">${JSON.stringify(collectionPageLd)}</script>
    <script type="application/ld+json">${JSON.stringify(itemListLd)}</script>
  `;

  return renderIndexWithHead(c, head);
}
