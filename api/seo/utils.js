export function escapeHtml(s=""){return s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")}
export function escapeAttr(s=""){return s.replaceAll('"',"&quot;")}
export function stripMd(s=""){return (s||"")
  .replace(/!\[[^\]]*\]\([^)]*\)/g,"")
  .replace(/\[[^\]]*\]\([^)]*\)/g,"")
  .replace(/[#>*_`~-]+/g,"")
  .replace(/\s+/g," ")
  .trim()}

/** Luôn trả index.html rồi tiêm <head> trước </head> (tránh 304/ETag) */
// api/seo/utils.js
export async function renderIndexWithHead(c, headHtml){
  // fetch trực tiếp file index.html từ ASSETS (không dựa vào URL hiện tại)
  const indexRes = await c.env.ASSETS.fetch(new Request("http://assets/index.html", { method: "GET" }));

  let html = await indexRes.text();
  if (/(<\/head>)/i.test(html)) {
    html = html.replace(/<\/head>/i, `${headHtml}\n</head>`);
  } else {
    html = `${headHtml}\n${html}`;
  }

  const headers = new Headers(indexRes.headers);
  headers.set("content-type","text/html; charset=utf-8");
  headers.delete("etag");
  headers.delete("last-modified");
  headers.set("cache-control","no-store");
  headers.set("x-ssr","1");

  return new Response(html, { headers, status: 200 });
}


/** Helper môi trường chung */
export function envBrand(c){
  return c.env.BRAND_NAME || c.env.VITE_BRAND_NAME || "ITXEASY";
}
export function envCanonical(c, fallbackOrigin){
  return (c.env.CANONICAL_HOST || fallbackOrigin || "").replace(/\/+$/,"");
}
