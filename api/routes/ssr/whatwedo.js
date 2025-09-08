import { escapeHtml, escapeAttr, stripMd, renderIndexWithHead, envBrand, envCanonical } from "../../seo/utils.js";

export async function whatWeDoSSR(c){
  const url = new URL(c.req.url);
  const SITE_URL = url.origin;
  const BRAND = envBrand(c);
  const canonical = `${envCanonical(c, SITE_URL)}/what_we_do`;

  // Lấy dữ liệu cần thiết (giống trang FE đang gọi)
  const [fieldsRes, certRes, partnerRes] = await Promise.all([
    fetch(new URL("/api/fields", url).toString(), { headers:{Accept:"application/json"}}).then(r=>r.json()).catch(()=>({fields:[]})),
    fetch(new URL("/api/cer-partners", url).toString(), { headers:{Accept:"application/json"}}).then(r=>r.json()).catch(()=>({partners:[]})),
    fetch(new URL("/api/cer-partners", url).toString(), { headers:{Accept:"application/json"}}).then(r=>r.json()).catch(()=>({partners:[]})), // nếu chứng nhận & partner chung API thì điều chỉnh lại
  ]);

  const fieldContent = Array.isArray(fieldsRes?.fields) ? fieldsRes.fields : (Array.isArray(fieldsRes) ? fieldsRes : []);
  const partners = Array.isArray(partnerRes?.partners) ? partnerRes.partners : (Array.isArray(partnerRes) ? partnerRes : []);
  const certifications = Array.isArray(certRes?.certifications) ? certRes.certifications : (Array.isArray(certRes) ? certRes : []);

  const breadcrumbName = "What we do";
  const firstName = fieldContent?.[0]?.name?.trim();
  const pageTitle = firstName ? `${firstName} | ${breadcrumbName} | ${BRAND}` : `${breadcrumbName} | ${BRAND}`;

  const a = fieldContent?.[0]?.content || ""; 
  const b = fieldContent?.[1]?.content || "";
  const rawDesc = [a,b].filter(Boolean).map(stripMd).join(" ");
  const fallbackDesc = `What we do at ${BRAND}: services, solutions, export agriculture, certifications & partners.`;
  const pageDesc = rawDesc ? rawDesc.slice(0,300) : fallbackDesc;

  const ogImage = fieldContent?.[0]?.image_url || `${SITE_URL}/banner.jpg`;

  const names = [
    ...(fieldContent||[]).map(x=>x?.name),
    ...(certifications||[]).map(x=>x?.name),
    ...(partners||[]).map(x=>x?.name),
  ].filter(Boolean);
  const baseKeywords = ["What we do","services","solutions","export","agriculture","Vietnam export",BRAND];
  const keywords = Array.from(new Set([...baseKeywords, ...names])).join(", ");

  const times = [...(fieldContent||[]), ...(partners||[]), ...(certifications||[])]
        .map(x=>x?.updated_at || x?.created_at).filter(Boolean).sort();
  const publishedTime = times[0];
  const modifiedTime = times[times.length-1] || publishedTime;
  const noindex = (fieldContent?.length||0)===0 && (partners?.length||0)===0 && (certifications?.length||0)===0;

  const breadcrumbLd = {
    "@context":"https://schema.org","@type":"BreadcrumbList",
    itemListElement:[
      {"@type":"ListItem","position":1,"name":"Home","item":`${SITE_URL}/`},
      {"@type":"ListItem","position":2,"name":breadcrumbName,"item":canonical},
    ],
  };
  const collectionPageLd = {
    "@context":"https://schema.org","@type":"CollectionPage",
    name: pageTitle, description: pageDesc, url: canonical,
    isPartOf:{ "@type":"WebSite", name: BRAND, url: SITE_URL },
  };

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
    <script type="application/ld+json">${JSON.stringify(collectionPageLd)}</script>
  `;
  return renderIndexWithHead(c, head);
}
