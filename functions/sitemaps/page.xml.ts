/// <reference types="@cloudflare/workers-types" />
import type { PagesFunction } from "@cloudflare/workers-types";
interface Env { CANONICAL_HOST?: string; }

const esc = (s = "") => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const xml = (parts: string) => `<?xml version="1.0" encoding="UTF-8"?>\n${parts}`;

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const { origin } = new URL(request.url);
  const CANON = (env.CANONICAL_HOST || "").replace(/\/+$/, "");
  const base = CANON ? `https://${CANON}` : origin;

  const urls = ["/", "/about", "/contact", "/what_we_do", "/news", "/product"];

  const body = xml(
`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((p) => `  <url><loc>${esc(base + p)}</loc></url>`).join("\n")}
</urlset>`
  );

  return new Response(body, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, s-maxage=3600"
    }
  });
};
