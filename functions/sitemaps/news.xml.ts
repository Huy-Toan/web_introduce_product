/// <reference types="@cloudflare/workers-types" />
import type { PagesFunction } from "@cloudflare/workers-types";
interface Env { CANONICAL_HOST?: string; }

type NewsItem = {
  slug?: string;
  updated_at?: string;
  published_at?: string;
  created_at?: string;
};

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

  const data = await fetchJson<{ news?: NewsItem[] }>("/api/news");
  const items = (data?.news || [])
    .filter((n) => n?.slug)
    .map((n) => ({
      loc: `${base}/news/news-detail/${encodeURIComponent(n.slug!)}`,
      lastmod: n.updated_at || n.published_at || n.created_at
    }));

  const body = xml(
`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items.map(({ loc, lastmod }) => {
  const lm = lastmod ? `<lastmod>${new Date(lastmod).toISOString()}</lastmod>` : "";
  return `  <url><loc>${esc(loc)}</loc>${lm}</url>`;
}).join("\n")}
</urlset>`
  );

  return new Response(body, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, s-maxage=900"
    }
  });
};
