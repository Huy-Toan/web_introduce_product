/// <reference types="@cloudflare/workers-types" />
import type { PagesFunction } from "@cloudflare/workers-types";
interface Env { CANONICAL_HOST?: string; }

type ProductItem = {
  id?: string | number;
  slug?: string;
  updated_at?: string;
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

  let data = await fetchJson<{ products?: ProductItem[]; items?: ProductItem[] }>("/api/products?limit=1000");
  if (!data) data = await fetchJson("/api/products");
  const list: ProductItem[] = (data?.products || (data as any)?.items || (data as any) || []) as ProductItem[];

  const items = list
    .filter((p) => p?.slug || p?.id)
    .map((p) => {
      const slug = (p.slug ?? p.id) as string | number;
      return {
        loc: `${base}/product/product-detail/${encodeURIComponent(String(slug))}`,
        lastmod: p.updated_at || p.created_at
      };
    });

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
      "cache-control": "public, s-maxage=1800"
    }
  });
};
