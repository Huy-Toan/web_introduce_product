import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import TopNavigation from "../components/Navigation";
import Footer from "../components/Footer";
import { NewsCard } from "../components/NewsCard";
import { NewsHeaderBanner } from "../components/Newsheader";
import Breadcrumbs from "../components/Breadcrumbs";

const PAGE_SIZE = 4;

export default function News() {
  const navigate = useNavigate();
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Breadcrumbs
  const items = useMemo(() => [{ label: "News", to: "/news" }], []);

  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        const res = await fetch("/api/news");
        const data = await res.json();
        setNewsData(data.news || []);
      } catch (err) {
        console.error("Failed to load news data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNewsData();
  }, []);

  // reset về trang 1 khi dataset thay đổi
  useEffect(() => setCurrentPage(1), [newsData]);

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
    navigate(`/news/news-detail/${item.slug}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />
      <Breadcrumbs items={items} className="mt-16" />
      <NewsHeaderBanner />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Latest News</h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="h-10 w-10 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : newsData.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Hiện tại chưa có tin tức nào.</p>
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
                className={`px-3 py-1.5  rounded border transition ${
                  currentPage === 1
                    ? "text-gray-400 border-gray-200 cursor-not-allowed bg-gray-100"
                    : "hover:bg-red-200 cursor-pointer"
                }`}
                aria-label="Previous page"
                title="Previous"
              >
                ‹ Prev
              </button>

              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1;
                const active = page === currentPage;
                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => goToPage(page)}
                    className={`min-w-9 px-3 py-1.5 cursor-pointer rounded border transition ${
                      active
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
                className={`px-3 py-1.5 rounded border transition ${
                  currentPage === totalPages
                    ? "text-gray-400 border-gray-200 cursor-not-allowed bg-gray-100"
                    : "hover:bg-red-200 cursor-pointer"
                }`}
                aria-label="Next page"
                title="Next"
              >
                Next ›
              </button>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
