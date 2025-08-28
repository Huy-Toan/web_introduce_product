/// <reference types="@cloudflare/workers-types" />
import type { PagesFunction } from "@cloudflare/workers-types";
interface Env { CANONICAL_HOST?: string; }

const xml = (parts: string) => `<?xml version="1.0" encoding="UTF-8"?>\n${parts}`;

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const origin = url.origin;
  const CANON = (env.CANONICAL_HOST || "").replace(/\/+$/, "");
  const base = CANON ? `https://${CANON}` : origin;

  const children = [
    `${base}/sitemaps/pages.xml`,
    `${base}/sitemaps/news.xml`,
    `${base}/sitemaps/products.xml`,
    `${base}/sitemaps/categories.xml`
  ];

  const body = xml(
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${children.map((loc) => `  <sitemap><loc>${loc}</loc></sitemap>`).join("\n")}
</sitemapindex>`
  );

  return new Response(body, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, s-maxage=3600"
    }
  });
};
