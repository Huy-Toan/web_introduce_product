import { escapeHtml, escapeAttr, renderIndexWithHead, envBrand, envCanonical } from "../../seo/utils.js";

export async function contactSSR(c){
  const url = new URL(c.req.url);
  const BRAND = envBrand(c);
  const SITE_URL = url.origin;
  const canonical = `${envCanonical(c, SITE_URL)}/contact`;

  const pageTitle = `Contact | ${BRAND}`;
  const pageDesc = `Liên hệ ${BRAND}: địa chỉ, email, số điện thoại, WhatsApp. Gửi yêu cầu báo giá/đối tác về xuất khẩu nông sản Việt Nam.`;
  const keywords = ["Contact","Liên hệ",BRAND,"xuất khẩu nông sản","Vietnam export","address","email","phone","whatsapp"].join(", ");
  const ogImage = `${SITE_URL}/banner.jpg`; // hoặc undefined nếu chưa có

  const breadcrumbLd = {
    "@context":"https://schema.org","@type":"BreadcrumbList",
    itemListElement:[
      {"@type":"ListItem","position":1,"name":"Home","item":`${SITE_URL}/`},
      {"@type":"ListItem","position":2,"name":"Contact","item":canonical},
    ],
  };
  const contactPageLd = {
    "@context":"https://schema.org","@type":"ContactPage",
    name: pageTitle, description: pageDesc, url: canonical,
    isPartOf: {"@type":"WebSite", name: BRAND, url: SITE_URL},
  };
  const organizationLd = {
    "@context":"https://schema.org","@type":"Organization",
    name: BRAND, url: SITE_URL, logo: `${SITE_URL}/logo-512.png`,
    email: "info@allxone.com", telephone: "+84 383 655 628",
    address: { "@type":"PostalAddress", streetAddress:"140 Nguyen Xi Street", addressLocality:"Binh Thanh District", addressRegion:"Ho Chi Minh City", addressCountry:"VN" },
    contactPoint: [{ "@type":"ContactPoint", telephone:"+84 7755 68646", contactType:"customer service", areaServed:["VN","Global"], availableLanguage:["vi","en"]}],
  };

  const head = `
    <title>${escapeHtml(pageTitle)}</title>
    <meta name="description" content="${escapeHtml(pageDesc)}" />
    <meta name="keywords" content="${escapeHtml(keywords)}" />
    <link rel="canonical" href="${escapeAttr(canonical)}" />

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

    <script type="application/ld+json">${JSON.stringify(breadcrumbLd)}</script>
    <script type="application/ld+json">${JSON.stringify(contactPageLd)}</script>
    <script type="application/ld+json">${JSON.stringify(organizationLd)}</script>
  `;

  return renderIndexWithHead(c, head);
}
