import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeSanitize from 'rehype-sanitize';
import { defaultSchema } from 'hast-util-sanitize';
import Slugger from 'github-slugger';
import SEO, { buildNewsArticleJsonLd, stripMd } from './SEOhead'
import { getSiteOrigin, getCanonicalBase, isNonCanonicalHost } from "../lib/siteUrl";

function NewsDetail({ newsData }) {
  const { news } = newsData || {};
  const markdown = news?.content || '';
  const SITE_URL = getSiteOrigin();
  const CANON_BASE = getCanonicalBase();
  const BRAND = import.meta.env.VITE_BRAND_NAME || 'ITXEASY';

  // Đường dẫn & canonical
  const slug = news?.slug && String(news.slug).trim();
  const path = slug ? `/news/${encodeURIComponent(slug)}` : `/news`;
  const canonical = `${CANON_BASE}${path}`;
  const noindex = isNonCanonicalHost();

  const seoTitle =
    (news?.title && news.title.trim()) ||
    (markdown.match(/^#\s+(.+)$/m) || [])[1] ||
    'Bài viết';
  const seoDesc =
    (news?.meta_description && news.meta_description.trim()) ||
    stripMd(markdown).slice(0, 300);
  const keywords = String(news?.keywords || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  const published = news?.published_at || news?.created_at;
  const modified = news?.updated_at || published;
  const jsonLd = buildNewsArticleJsonLd({
    url: canonical,
    headline: seoTitle,
    images: news?.image_url ? [news.image_url] : [],
    datePublished: published,
    dateModified: modified,
    authorName: news?.author || 'ITXEASY',
    publisherName: 'ITXEASY',
    publisherLogo: `${SITE_URL}/logo-512.png`,
  })


  // Sanitize schema: cho phép ảnh + id trên headings (để anchor hoạt động)
  const schema = useMemo(() => {
    const s = JSON.parse(JSON.stringify(defaultSchema));
    s.tagNames = Array.from(new Set([...(s.tagNames || []), 'img', 'figure', 'figcaption', 'mark', 'kbd']));
    s.attributes = {
      ...(s.attributes || {}),
      h1: [['id']], h2: [['id']], h3: [['id']], h4: [['id']], h5: [['id']], h6: [['id']],
      img: [
        ['src'], ['alt'], ['title'], ['width'], ['height'], ['loading'], ['decoding'], ['srcset'], ['sizes'],
      ],
      a: [['href'], ['title'], ['target'], ['rel'], ['aria-label']],
      code: [['className']],
    };
    return s;
  }, []);

  // TOC khớp rehype-slug
  const toc = useMemo(() => {
    const lines = markdown.split('\n');
    const slugger = new Slugger();
    const items = [];
    for (const line of lines) {
      const m = line.match(/^(#{1,6})\s+(.*)$/);
      if (m) {
        const level = m[1].length;
        const text = m[2].trim();
        const id = slugger.slug(text);
        items.push({ level, text, id });
      }
    }
    return items;
  }, [markdown]);

  if (!news) return null;

  return (
    <div>
      <SEO
        title={seoTitle}
        description={seoDesc}
        url={canonical}
        image={news?.image_url}
        keywords={keywords}
        publishedTime={published}
        modifiedTime={modified}
        siteName="Your Brand"
        ogType="article"
        twitterCard="summary_large_image"
        jsonLd={jsonLd}
      />

      <div className="space-y-12">
        <div className="card">
          {/* Tiêu đề */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              {news.title}
            </h1>
          </div>

          {/* Ảnh cover */}
          {news.image_url ? (
            <div className="mb-8">
              <img
                src={news.image_url}
                alt={news.title || 'cover image'}
                loading="lazy"
                decoding="async"
                className="w-full h-auto object-cover rounded-lg shadow-lg"
              />
            </div>
          ) : null}

          {/* TOC (đánh số tăng dần) */}
          {toc.length > 1 && (
            <nav className="mb-8 rounded-2xl border bg-white/60 p-4 shadow-sm">
              <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">
                Mục lục
              </div>
              <ol className="space-y-1 text-sm">
                {toc.map((h, idx) => (
                  <li
                    key={h.id}
                    className="flex items-start gap-2"
                    style={{ marginLeft: (h.level - 1) * 12 }}
                  >
                    <span className="min-w-6 text-right tabular-nums text-neutral-500">
                      {idx + 1}.
                    </span>
                    <a href={`#${h.id}`} className="inline-block hover:underline">
                      {h.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}


          {/* Nội dung Markdown */}
          <article className="prose prose-neutral max-w-none text-justify">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
              rehypePlugins={[
                rehypeSlug,
                [rehypeAutolinkHeadings, { behavior: 'wrap' }],
                [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
                [rehypeSanitize, schema],
              ]}
              components={{
                img({ node, ...props }) {
                  return <img loading="lazy" decoding="async" {...props} />;
                },
                a({ node, ...props }) {
                  return <a target="_blank" rel="noopener noreferrer" {...props} />;
                },
              }}
            >
              {markdown}
            </ReactMarkdown>
          </article>
        </div>
      </div>
    </div>
  );
}

export default NewsDetail;
