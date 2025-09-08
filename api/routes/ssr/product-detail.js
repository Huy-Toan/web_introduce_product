// api/routes/seo-product-detail.js
import { escapeHtml, escapeAttr, stripMd, renderIndexWithHead, envBrand, envCanonical } from "../../seo/utils.js";

const SUPPORTED = ["vi", "en"];

function isAbs(u) { return /^https?:\/\//i.test(u || ""); }
function joinUrl(base, p) {
  const b = (base || "").replace(/\/+$/, "");
  const q = (p || "").replace(/^\/+/, "");
  return `${b}/${q}`;
}

async function fetchProduct(base, idOrSlug, lc, signal) {
  const u = new URL(`/api/products/${encodeURIComponent(idOrSlug)}`, base);
  u.searchParams.set("locale", lc);
  const r = await fetch(u.toString(), { headers: { Accept: "application/json" }, cache: "no-store", signal });
  if (!r.ok) return null;
  const j = await r.json().catch(() => ({}));
  return j?.product || null;
}

export async function productDetailSSR(c) {
  const url = new URL(c.req.url);
  const params = c.req.param?.() || {};
  const idOrSlug = (params.idOrSlug || "").toString();

  // locale ưu tiên ?locale, fallback vi
  const lc = (url.searchParams.get("locale") || "").toLowerCase();
  const locale = SUPPORTED.includes(lc) ? lc : "vi";

  const BRAND = envBrand(c);
  const SITE_URL = url.origin;
  const CANON_ORIGIN = envCanonical(c, SITE_URL);

  // ===== 1) Resolve sản phẩm + canonical slug theo locale hiện tại =====
  let item = null;
  let baseId = null;

  try {
    // Thử theo locale hiện tại
    item = await fetchProduct(SITE_URL, idOrSlug, locale);
    // Nếu không có, thử qua locale khác để lấy id chung rồi fetch lại theo id
    if (!item) {
      for (const lc2 of SUPPORTED) {
        if (lc2 === locale) continue;
        const it2 = await fetchProduct(SITE_URL, idOrSlug, lc2);
        if (it2?.id) {
          baseId = it2.id;
          item = await fetchProduct(SITE_URL, baseId, locale);
          break;
        }
      }
    } else {
      baseId = item.id;
    }
  } catch {}

  // Nếu không tìm thấy → trả SSR head tối thiểu + noindex
  if (!item) {
    const head404 = `
      <title>${escapeHtml(locale === "vi" ? `Sản phẩm | ${BRAND}` : `Product | ${BRAND}`)}</title>
      <meta name="robots" content="noindex,follow" />
      <link rel="canonical" href="${escapeAttr(`${CANON_ORIGIN}/product`)}" />
    `;
    return renderIndexWithHead(c, head404);
  }

  const canonicalSlug = (item.slug || item.product_slug || item.id)?.toString().trim().toLowerCase();
  const canonical = `${CANON_ORIGIN}/product/product-detail/${encodeURIComponent(canonicalSlug)}`;

  // ===== 2) META cơ bản =====
  const title0 = item.title?.trim() || item.name?.trim() || "";
  const pageTitle = title0 ? `${title0} | ${BRAND}` : `${locale === "vi" ? "Sản phẩm" : "Product"} | ${BRAND}`;

  const raw = [item.description, item.content].filter(Boolean).map(stripMd).join(" ");
  const pageDesc = raw
    ? raw.slice(0, 300)
    : (locale === "vi"
        ? `Sản phẩm của ${BRAND}: thông tin chi tiết, mô tả và hình ảnh.`
        : `Products from ${BRAND}: details, description and images.`);

  const keywordsBase = locale === "vi"
    ? ["sản phẩm","nông sản","ITXEASY","Việt Nam","xuất khẩu"]
    : ["product","agriculture","ITXEASY","Vietnam","export"];
  const extra = []
    .concat(item.tags || [])
    .concat(item.subcategory_name || item.subcategory?.name || [])
    .concat(item.parent_name || item.parent?.name || [])
    .concat(title0 ? [title0] : []);
  const keywords = Array.from(new Set(extra.reduce((a, v) => (v ? a.concat([String(v)]) : a), keywordsBase))).join(", ");

  const ogImage = (() => {
    const img = item.image_url || "/banner.jpg";
    return isAbs(img) ? img : joinUrl(SITE_URL, img);
  })();

  const created = item.created_at || item.published_at || null;
  const updated = item.updated_at || created || null;

  // ===== 3) JSON-LD =====
  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: title0 || "",
    description: pageDesc,
    image: ogImage ? [ogImage] : undefined,
    sku: item.sku || undefined,
    productID: item.id ? String(item.id) : undefined,
    brand: { "@type": "Brand", name: BRAND },
    category: item.subcategory_name || item.subcategory?.name || item.parent_name || item.parent?.name || undefined,
    url: canonical,
    // Nếu bạn có price/currency/availability thì thêm Offers ở đây (đang để trống để không leak dữ liệu sai)
    // offers: {
    //   "@type": "Offer",
    //   priceCurrency: "USD",
    //   price: "1.00",
    //   availability: "https://schema.org/InStock",
    //   url: canonical,
    // },
  };

  // Breadcrumbs: /product -> /product/:parent -> /product/:parent/:sub -> current
  const bc = [
    { name: "Home", url: `${SITE_URL}/` },
    { name: locale === "vi" ? "Sản phẩm" : "Products", url: `${CANON_ORIGIN}/product` },
  ];
  if (item.parent_slug && item.parent_name) {
    bc.push({ name: item.parent_name, url: `${CANON_ORIGIN}/product/${encodeURIComponent(item.parent_slug)}` });
  }
  if (item.subcategory_slug && item.subcategory_name && item.parent_slug) {
    bc.push({
      name: item.subcategory_name,
      url: `${CANON_ORIGIN}/product/${encodeURIComponent(item.parent_slug)}/${encodeURIComponent(item.subcategory_slug)}`
    });
  }
  bc.push({ name: title0 || (locale === "vi" ? "Chi tiết" : "Detail"), url: canonical });

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: bc.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: b.name,
      item: b.url
    })),
  };

  const organizationLd = {
    "@context":"https://schema.org","@type":"Organization",
    name: BRAND, url: SITE_URL, logo: `${SITE_URL}/logo-512.png`,
  };

  // ===== 4) (Optional) hreflang trong <head> cho các locale khác =====
  // Nếu tìm được baseId thì query các locale để lấy slug chuẩn, gắn <link rel="alternate">.
  const altLinks = [];
  try {
    const baseKey = baseId || item.id || canonicalSlug; // ưu tiên id
    for (const L of SUPPORTED) {
      const it = await fetchProduct(SITE_URL, baseKey, L);
      if (it?.slug || it?.product_slug || it?.id) {
        const s = (it.slug || it.product_slug || it.id).toString();
        altLinks.push(
          `<link rel="alternate" hreflang="${L}" href="${escapeAttr(`${CANON_ORIGIN}/product/product-detail/${encodeURIComponent(s)}?locale=${L}`)}" />`
        );
      }
    }
    // x-default → canonical hiện tại
    altLinks.push(`<link rel="alternate" hreflang="x-default" href="${escapeAttr(canonical)}" />`);
  } catch {}

  // ===== 5) HEAD =====
  const head = `
    <title>${escapeHtml(pageTitle)}</title>
    <meta name="description" content="${escapeHtml(pageDesc)}" />
    <meta name="keywords" content="${escapeHtml(keywords)}" />
    <link rel="canonical" href="${escapeAttr(canonical)}" />
    ${altLinks.join("\n    ")}

    <meta property="og:type" content="product" />
    <meta property="og:site_name" content="${escapeHtml(BRAND)}" />
    <meta property="og:title" content="${escapeHtml(pageTitle)}" />
    <meta property="og:description" content="${escapeHtml(pageDesc)}" />
    <meta property="og:url" content="${escapeAttr(canonical)}" />
    <meta property="og:image" content="${escapeAttr(ogImage)}" />
    ${created ? `<meta property="article:published_time" content="${escapeAttr(created)}" />` : ""}
    ${updated ? `<meta property="article:modified_time" content="${escapeAttr(updated)}" />` : ""}

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(pageTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(pageDesc)}" />
    <meta name="twitter:image" content="${escapeAttr(ogImage)}" />

    <script type="application/ld+json">${JSON.stringify(breadcrumbLd)}</script>
    <script type="application/ld+json">${JSON.stringify(productLd)}</script>
    <script type="application/ld+json">${JSON.stringify(organizationLd)}</script>
  `;

  return renderIndexWithHead(c, head);
}
