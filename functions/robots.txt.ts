/// <reference types="@cloudflare/workers-types" />
import type { PagesFunction } from "@cloudflare/workers-types";

interface Env {
  CANONICAL_HOST?: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const url = new URL(request.url);
  const host = url.host;
  const CANON = (env.CANONICAL_HOST || "").replace(/\/+$/, "");

  const isCanonical = CANON ? host === CANON : false;

  const bodyProd = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "Disallow: /admin/",
    "Disallow: /static/admin/",
    "Disallow: /*?_cf_recache=",
    "Disallow: /*?preview=",
    "Disallow: /*?utm_",
    "Disallow: /*&utm_",
    "Disallow: /*?fbclid=",
    `Sitemap: https://${CANON || host}/sitemap.xml`,
    ""
  ].join("\n");

  const bodyPreview = ["User-agent: *", "Disallow: /", ""].join("\n");

  return new Response(isCanonical ? bodyProd : bodyPreview, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, s-maxage=3600"
    }
  });
};
