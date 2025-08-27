// src/pages/HomePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import TopNavigation from "../components/Navigation";
import Footer from "../components/Footer";
import Banner from "../components/Banner";
import ProductCategories from "../components/Categori";
import IntroduceProductsSection from "../components/IntroduceProducts.jsx";
import AboutSection from "../components/AboutSection";
import NewsSection from "../components/NewsSection";
import FieldHighlightsSection from "../components/FieldSection";
import CerPartnersSection from "../components/Cer_PartnerSection";
import UserChatBox from "../components/UserChatBox";
import { getSiteOrigin, getCanonicalBase, isNonCanonicalHost } from "../lib/siteUrl";

import SEO, { stripMd } from "../components/SEOhead";

export default function HomePage() {
  // (Enrich SEO) Lấy nhanh danh mục / sản phẩm / tin tức / lĩnh vực
  const [cats, setCats] = useState([]);
  const [news, setNews] = useState([]);
  const [fields, setFields] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const ac = new AbortController();

    // Danh mục (parent)
    (async () => {
      try {
        const res = await fetch("/api/parent_categories", { signal: ac.signal });
        if (!res.ok) return;
        const data = await res.json();
        const items = (data.items || data.parent_categories || data || [])
          .map(x => ({ name: x?.name || x?.title, slug: x?.slug || x?.id }))
          .filter(x => x.name && x.slug);
          setProducts(items);
      } catch { }
    })();

    // Tin tức
    (async () => {
      try {
        const res = await fetch("/api/news", { signal: ac.signal });
        if (!res.ok) return;
        const data = await res.json();
        const items = (data.news || [])
          .map(n => ({
            title: n?.title,
            slug: n?.slug,
            image_url: n?.image_url,
            published_at: n?.published_at || n?.created_at,
            updated_at: n?.updated_at,
            author: n?.author
          }))
          .filter(n => n.title && n.slug);
        setNews(items.slice(0, 4));
      } catch { }
    })();

    // Lĩnh vực (fields)
    (async () => {
      try {
        const res = await fetch("/api/fields", { signal: ac.signal });
        if (!res.ok) return;
        const data = await res.json();
        const items = (data.items || data || [])
          .map(f => ({
            name: f?.name,
            content: f?.content || "",
            image_url: f?.image_url
          }))
          .filter(f => f.name);
        setFields(items.slice(0, 6));
      } catch { }
    })();

    // Sản phẩm nổi bật (thử nhiều endpoint cho chắc)
    (async () => {
      try {
          const res = await fetch("/api/products", { signal: ac.signal });
        if (!res.ok) return;
        const data = await res.json();
        const items = (data.products || data.items || data || [])
          .map(p => ({
            title: p?.title || p?.name,
            slug: p?.slug || p?.id,
            image_url: p?.image_url,
            price: p?.price,
            currency: p?.currency
          }))
          .filter(p => p.title && p.slug);
        setProducts(items.slice(0, 8));
      } catch { }
    })();

    return () => ac.abort();
  }, []);

  /* ====================== SEO cho Home ====================== */
  const SITE_URL = getSiteOrigin();
  const BRAND = import.meta.env.VITE_BRAND_NAME || "ITXEASY";
  const TAGLINE = import.meta.env.VITE_TAGLINE || "Choose Us — Choose Quality";

  const canonical = `${getCanonicalBase()}/`;
  const pageTitle = `${BRAND} — ${TAGLINE}`;
  const pageDesc =
    `Trang chủ ${BRAND}: xuất khẩu nông sản Việt Nam, danh mục sản phẩm, lĩnh vực dịch vụ, ` +
    `đối tác chứng nhận quốc tế và tin tức thị trường mới nhất.`;

  const ogImage = import.meta.env.VITE_OG_HOME || `${SITE_URL}/og-home.jpg`;

  // Keywords mở rộng từ dữ liệu
  const keywords = useMemo(() => {
    const kCats = cats.map(c => c.name);
    const kProds = products.map(p => p.title);
    const kFields = fields.map(f => f.name);
    const base = [
      BRAND, "xuất khẩu nông sản", "Vietnam export",
      "trái cây", "agriculture", "logistics", "GAP", "partners", "news"
    ];
    return Array.from(new Set([...base, ...kCats, ...kProds, ...kFields].filter(Boolean)));
  }, [cats, products, fields, BRAND]);

  // Organization
  const organizationLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND,
    url: SITE_URL,
    logo: `${SITE_URL}/logo-512.png`,
    contactPoint: [{
      "@type": "ContactPoint",
      telephone: "+84 383 655 628",
      contactType: "customer service",
      areaServed: ["VN", "Global"],
      availableLanguage: ["vi", "en"]
    }]
  }), [BRAND, SITE_URL]);

  // WebSite + SearchAction
  const webSiteLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BRAND,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  }), [BRAND, SITE_URL]);

  // WebPage (Home)
  const webPageLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: pageTitle,
    description: pageDesc,
    url: canonical,
    isPartOf: { "@type": "WebSite", name: BRAND, url: SITE_URL }
  }), [pageTitle, pageDesc, canonical, BRAND, SITE_URL]);

  // ItemList: Danh mục
  const categoriesLd = useMemo(() => cats.length ? ({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Product Categories",
    itemListElement: cats.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: { "@type": "Thing", name: c.name, url: `${SITE_URL}/product/${encodeURIComponent(c.slug)}` }
    }))
  }) : null, [cats, SITE_URL]);

  // ItemList: Sản phẩm
  const productsLd = useMemo(() => products.length ? ({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Featured Products",
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: p.title,
        image: p.image_url || undefined,
        url: `${SITE_URL}/product/product-detail/${encodeURIComponent(p.slug)}`,
        brand: BRAND,
        offers: (p.price && p.currency) ? {
          "@type": "Offer",
          price: String(p.price),
          priceCurrency: p.currency,
          availability: "https://schema.org/InStock",
          url: `${SITE_URL}/product/product-detail/${encodeURIComponent(p.slug)}`
        } : undefined
      }
    }))
  }) : null, [products, SITE_URL, BRAND]);

  // ItemList: Lĩnh vực (dịch vụ)
  const fieldsLd = useMemo(() => fields.length ? ({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Services",
    itemListElement: fields.map((f, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Service",
        name: f.name,
        description: stripMd(f.content || "").slice(0, 200) || undefined,
        image: f.image_url || undefined,
        provider: { "@type": "Organization", name: BRAND, url: SITE_URL }
      }
    }))
  }) : null, [fields, BRAND, SITE_URL]);

  const newsLd = useMemo(() => news.length ? ({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Latest News",
    itemListElement: news.map((n, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "NewsArticle",
        headline: n.title,
        url: `${SITE_URL}/news/news-detail/${encodeURIComponent(n.slug)}`,
        image: n.image_url || undefined,
        datePublished: n.published_at || undefined,
        dateModified: n.updated_at || undefined,
        author: n.author ? [{ "@type": "Person", name: n.author }] : undefined,
        publisher: { "@type": "Organization", name: BRAND, logo: `${SITE_URL}/logo-512.png` }
      }
    }))
  }) : null, [news, SITE_URL, BRAND]);

  const jsonLd = useMemo(() => {
    return [organizationLd, webSiteLd, webPageLd, categoriesLd, productsLd, fieldsLd, newsLd].filter(Boolean);
  }, [organizationLd, webSiteLd, webPageLd, categoriesLd, productsLd, fieldsLd, newsLd]);
  /* =========================================================== */

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title={pageTitle}
        description={pageDesc}
        url={canonical}
        image={ogImage}
        siteName={BRAND}
        keywords={keywords}
        ogType="website"
        twitterCard="summary_large_image"
        jsonLd={jsonLd}
      />

      <TopNavigation />
      <Banner />
      <ProductCategories />
        <IntroduceProductsSection products={products} />
      <AboutSection />
      <FieldHighlightsSection />
      <CerPartnersSection />
      <NewsSection />
      <UserChatBox />
      <Footer />
    </div>
  );
}
