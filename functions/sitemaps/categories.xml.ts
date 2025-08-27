/// <reference types="@cloudflare/workers-types" />
import type { PagesFunction } from "@cloudflare/workers-types";
interface Env { CANONICAL_HOST?: string; }

type CategoryItem = { slug?: string; updated_at?: string };

const esc = (s = "") => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const xml = (parts: string) => `<?xml version="1.0" encoding="UTF-8"?>\n${parts}`;

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const origin = url.origin;
  const CANON = (env.CANONICAL_HOST || "").replace(/\/+$/, "");
  const base = CANON ? `https://${CANON}` : origin;

  const fetchJson = async <T = unknown>(path: string): Promise<T | null> => {
    try {
      const res = await fetch(`${origin}${path}`, { cf: { cacheTtl: 300 } as any });
      if (!res.ok) return null;
      return await res.json() as T;
    } catch { return null; }
  };

  const parentsJson = await fetchJson<{ items?: CategoryItem[]; parent_categories?: CategoryItem[] }>("/api/parent_categories");
  const parentItems: { loc: string; lastmod?: string }[] =
    (parentsJson?.items || parentsJson?.parent_categories || [])
      .filter((c) => c?.slug)
      .map((c) => ({
        loc: `${base}/product/${encodeURIComponent(String(c.slug))}`,
        lastmod: c.updated_at
      }));

  const body = xml(
`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${parentItems.map(({ loc, lastmod }) => {
  const lm = lastmod ? `<lastmod>${new Date(lastmod).toISOString()}</lastmod>` : "";
  return `  <url><loc>${esc(loc)}</loc>${lm}</url>`;
}).join("\n")}
</urlset>`
  );

  return new Response(body, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, s-maxage=3600"
    }
  });
};
