// src/pages/News_Detail.jsx
import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import TopNavigation from "../components/Navigation";
import Footer from "../components/Footer";
import NewsDetail from "../components/NewsDetail";
import SidebarNews from "../components/NewsSidebar";
import Breadcrumbs from "../components/Breadcrumbs";

const SUPPORTED = ["vi", "en"];
const DEFAULT_LOCALE = "vi";

function getInitialLocale(search) {
  const sp = new URLSearchParams(search);
  const urlLc = (sp.get("locale") || "").toLowerCase();
  const lsLc = (localStorage.getItem("locale") || "").toLowerCase();
  return SUPPORTED.includes(urlLc) ? urlLc : (SUPPORTED.includes(lsLc) ? lsLc : DEFAULT_LOCALE);
}

function News_Detail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [locale, setLocale] = useState(getInitialLocale(location.search));
  const [newsData, setNewsData] = useState(null);
  const [allNews, setAllNews] = useState([]);
  const [loading, setLoading] = useState(true);

  // giữ id hiện tại để dự phòng map qua locale nếu cần
  const lastGoodIdRef = useRef(null);

  // Đồng bộ khi ?locale đổi
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const urlLc = (sp.get("locale") || "").toLowerCase();
    if (SUPPORTED.includes(urlLc) && urlLc !== locale) {
      setLocale(urlLc);
      localStorage.setItem("locale", urlLc);
      try { document.documentElement.lang = urlLc; } catch { }
    }
  }, [location.search, locale]);

  // Breadcrumbs theo ngôn ngữ
  const items = useMemo(() => {
    const title = newsData?.news?.title;
    return [
      { label: locale === "vi" ? "Tin tức" : "News", to: "/news" + location.search },
      { label: title || (locale === "vi" ? "Chi tiết" : "Detail") },
    ];
  }, [newsData?.news?.title, locale, location.search]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // --- Chi tiết bài hiện tại theo locale ---
        const detailUrl = new URL(`/api/news/${encodeURIComponent(slug)}`, window.location.origin);
        detailUrl.searchParams.set("locale", locale);
        const newsRes = await fetch(detailUrl.toString(), { cache: "no-store" });
        const newsDetail = await newsRes.json();

        // --- Danh sách cho sidebar (cùng locale) ---
        const listUrl = new URL("/api/news", window.location.origin);
        listUrl.searchParams.set("locale", locale);
        const allNewsRes = await fetch(listUrl.toString(), { cache: "no-store" });
        const allNewsData = await allNewsRes.json();

        // Lưu list cho sidebar
        setAllNews(allNewsData.news || []);

        if (newsRes.ok && newsDetail?.news) {
          const current = newsDetail.news;
          setNewsData({ news: current });

          // lưu id gốc để fallback lần sau
          if (current?.id) lastGoodIdRef.current = current.id;

          // ⬇️ Fix chính: nếu slug "chuẩn" theo locale khác URL hiện tại → replace URL
          const canonicalSlug = (current.slug || "").trim();
          if (canonicalSlug && canonicalSlug !== slug) {
            navigate(`/news/news-detail/${encodeURIComponent(canonicalSlug)}?locale=${locale}`, {
              replace: true,
            });
          }
        } else {
          // Fallback nhẹ: nếu fail theo slug cũ, thử map theo id đã xem trước đó (nếu có)
          const id = lastGoodIdRef.current;
          if (id && Array.isArray(allNewsData.news)) {
            const sameId = allNewsData.news.find(n => n.id === id);
            if (sameId?.slug) {
              navigate(`/news/news-detail/${encodeURIComponent(sameId.slug)}?locale=${locale}`, {
                replace: true,
              });
              return; // để effect rerun với slug mới
            }
          }
          setNewsData(null);
        }
      } catch (err) {
        console.error("Failed to load news data:", err);
        setNewsData(null);
        setAllNews([]);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchData();
  }, [slug, locale, navigate]);

  // Handler khi click vào bài khác trong sidebar: giữ ?locale
  const handleSelectNews = (n) => {
    navigate(`/news/news-detail/${encodeURIComponent(n.slug)}?locale=${locale}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNavigation />
        <div className="flex justify-center items-center py-20">
          <div className="h-10 w-10 border-2 border-blue-800 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!newsData || !newsData.news) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNavigation />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center text-gray-600">
            <h2 className="text-2xl font-semibold mb-4">
              {locale === "vi" ? "Không tìm thấy bài viết" : "Article not found"}
            </h2>
            <p>
              {locale === "vi"
                ? `Bài viết với slug "${slug}" không tồn tại hoặc đã bị xóa.`
                : `The article with slug "${slug}" does not exist or has been removed.`}
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />
      <Breadcrumbs items={items} className="mt-16" />
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <SidebarNews
              newsItems={allNews}
              currentNewsId={newsData?.news?.id}
              onSelectNews={handleSelectNews}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <NewsDetail newsData={newsData} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default News_Detail;
