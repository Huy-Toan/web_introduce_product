// src/pages/News.jsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import TopNavigation from "../components/Navigation";
import { getSiteOrigin, getCanonicalBase } from "../lib/siteUrl";
import Footer from "../components/Footer";
import { NewsCard } from "../components/NewsCard";
import NewsHeaderBanner from "../components/Newsheader";
import Breadcrumbs from "../components/Breadcrumbs";
import SEO, { stripMd } from "../components/SEOhead";

const PAGE_SIZE = 4;
const SUPPORTED = ["vi", "en"];
const DEFAULT_LOCALE = "vi";

// Ưu tiên ?locale=, sau đó localStorage, cuối cùng là mặc định
function getInitialLocale() {
  const urlLc = new URLSearchParams(window.location.search).get("locale")?.toLowerCase() || "";
  const lsLc = (localStorage.getItem("locale") || "").toLowerCase();
  return SUPPORTED.includes(urlLc) ? urlLc : (SUPPORTED.includes(lsLc) ? lsLc : DEFAULT_LOCALE);
}

export default function News() {
  const navigate = useNavigate();
  const location = useLocation();

  const [locale, setLocale] = useState(getInitialLocale());
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Đồng bộ locale khi URL thay đổi do language switcher ở TopNavigation
  useEffect(() => {
    const urlLc = new URLSearchParams(location.search).get("locale")?.toLowerCase() || "";
    if (SUPPORTED.includes(urlLc) && urlLc !== locale) {
      setLocale(urlLc);
      localStorage.setItem("locale", urlLc);
      try { document.documentElement.lang = urlLc; } catch { }
    }
  }, [location.search, locale]);

  // Tải dữ liệu theo locale
  useEffect(() => {
    const fetchNewsData = async () => {
      setLoading(true);
      try {
        const url = new URL("/api/news", window.location.origin);
        url.searchParams.set("locale", locale);
        const res = await fetch(url.toString());
        const data = await res.json();
        setNewsData(data.news || []);
      } catch (err) {
        console.error("Failed to load news data:", err);
        setNewsData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNewsData();
  }, [locale]);

  // reset về trang 1 khi dataset thay đổi
  useEffect(() => setCurrentPage(1), [newsData]);

  // Breadcrumbs theo ngôn ngữ
  const items = useMemo(
    () => [{ label: locale === "vi" ? "Tin tức" : "News", to: "/news" + location.search }],
    [locale, location.search]
  );

  const totalPages = Math.max(1, Math.ceil((newsData?.length || 0) / PAGE_SIZE));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return (newsData || []).slice(start, start + PAGE_SIZE);
  }, [newsData, currentPage]);

  const goToPage = (n) => {
    const page = Math.max(1, Math.min(n, totalPages));
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNewsSelect = (item) => {
    navigate(`/news/news-detail/${encodeURIComponent(item.slug)}?locale=${locale}`);
  };

  /* ====================== SEO cho News list ====================== */
  const SITE_URL = getSiteOrigin();
  const BRAND = import.meta.env.VITE_BRAND_NAME || "ITXEASY";
  // Bạn có thể thêm ?locale vào canonical nếu muốn tách từng ngôn ngữ thành URL chuẩn riêng
  const canonicalBase = `${getCanonicalBase()}/news`;
  const canonical = canonicalBase; // hoặc `${canonicalBase}?locale=${locale}`

  const pageTitle = `${locale === "vi" ? "Tin tức" : "News"} | ${BRAND}`;

  const topSnippets = (newsData || [])
    .slice(0, 6)
    .map((n) => n.meta_description || stripMd(n.content || "").slice(0, 140) || n.title)
    .filter(Boolean)
    .join(" • ");

  const pageDesc =
    topSnippets ||
    (locale === "vi"
      ? `Tin tức ${BRAND}: cập nhật thị trường, quy trình xuất khẩu, chứng nhận, đối tác, logistics nông sản Việt Nam.`
      : `${BRAND} news: market updates, export process, certifications, partners, and logistics for Vietnamese agriculture.`);

  const ogImage = (newsData?.find((n) => n.image_url)?.image_url) || undefined;

  const keywords = useMemo(() => {
    const kws = (newsData || [])
      .flatMap((n) =>
        String(n.keywords || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      );
    const base =
      locale === "vi"
        ? ["news", "tin tức", "xuất khẩu", "nông sản", "Vietnam export", BRAND]
        : ["news", "vietnam export", "agriculture", "logistics", "updates", BRAND];
    return Array.from(new Set([...base, ...kws]));
  }, [newsData, BRAND, locale]);

  const publishedTime = useMemo(() => {
    const dates = (newsData || [])
      .map((n) => n.published_at || n.created_at)
      .filter(Boolean)
      .sort();
    return dates[0];
  }, [newsData]);

  const modifiedTime = useMemo(() => {
    const dates = (newsData || [])
      .map((n) => n.updated_at || n.published_at || n.created_at)
      .filter(Boolean)
      .sort();
    return dates[dates.length - 1] || publishedTime;
  }, [newsData, publishedTime]);

  const noindex = !loading && newsData.length === 0;

  // JSON-LD
  const breadcrumbLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: locale === "vi" ? "Tin tức" : "News", item: canonical },
      ],
    }),
    [SITE_URL, canonical, locale]
  );

  const collectionPageLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: pageTitle,
      description: pageDesc,
      url: canonical,
      isPartOf: { "@type": "WebSite", name: BRAND, url: SITE_URL },
    }),
    [pageTitle, pageDesc, canonical, BRAND, SITE_URL]
  );

  const itemListLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: (paginated || []).map((n, i) => ({
        "@type": "ListItem",
        position: (currentPage - 1) * PAGE_SIZE + i + 1,
        item: {
          "@type": "NewsArticle",
          headline: n.title,
          url: `${SITE_URL}/news/news-detail/${encodeURIComponent(n.slug)}`,
          datePublished: n.published_at || n.created_at || undefined,
          dateModified: n.updated_at || undefined,
          image: n.image_url || undefined,
          // author/publisher giữ nguyên nếu bạn có
          publisher: { "@type": "Organization", name: BRAND, logo: `${SITE_URL}/logo-512.png` },
        },
      })),
    }),
    [paginated, currentPage, SITE_URL, BRAND]
  );
  /* ============================================================= */

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ⬇️ SEO cho trang News */}
      <SEO
        title={pageTitle}
        description={pageDesc}
        url={canonical}
        image={ogImage}
        siteName={BRAND}
        noindex={noindex}
        publishedTime={publishedTime}
        modifiedTime={modifiedTime}
        keywords={keywords}
        ogType="website"
        twitterCard="summary_large_image"
        jsonLd={[breadcrumbLd, collectionPageLd, itemListLd]}
      />

      <TopNavigation />
      <Breadcrumbs items={items} className="mt-16" />
      <NewsHeaderBanner />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {locale === "vi" ? "Tin mới nhất" : "Latest News"}
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="h-10 w-10 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : newsData.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">
              {locale === "vi" ? "Hiện tại chưa có tin tức nào." : "No news yet."}
            </p>
          </div>
        ) : (
          <>
            {/* Grid: mobile 1 cột, desktop 2 cột → hiển thị tối đa 4 tin/trang */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {paginated.map((newsItem) => (
                <NewsCard
                  key={newsItem.id}
                  news={newsItem}
                  onClick={() => handleNewsSelect(newsItem)}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1.5  rounded border transition ${currentPage === 1
                    ? "text-gray-400 border-gray-200 cursor-not-allowed bg-gray-100"
                    : "hover:bg-red-200 cursor-pointer"
                  }`}
                aria-label="Previous page"
                title={locale === "vi" ? "Trang trước" : "Previous"}
              >
                ‹ {locale === "vi" ? "Trước" : "Prev"}
              </button>

              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1;
                const active = page === currentPage;
                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => goToPage(page)}
                    className={`min-w-9 px-3 py-1.5 cursor-pointer rounded border transition ${active
                        ? "bg-yellow-500 border-yellow-500 text-white"
                        : "border-gray-200 hover:bg-gray-50"
                      }`}
                    aria-current={active ? "page" : undefined}
                    aria-label={`Page ${page}`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1.5 rounded border transition ${currentPage === totalPages
                    ? "text-gray-400 border-gray-200 cursor-not-allowed bg-gray-100"
                    : "hover:bg-red-200 cursor-pointer"
                  }`}
                aria-label="Next page"
                title={locale === "vi" ? "Trang sau" : "Next"}
              >
                {locale === "vi" ? "Sau" : "Next"} ›
              </button>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
