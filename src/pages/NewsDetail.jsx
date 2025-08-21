import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopNavigation from "../components/Navigation";
import Footer from "../components/Footer";
import NewsDetail from "../components/NewsDetail";
import SidebarNews from "../components/NewsSidebar";
import Breadcrumbs from "../components/Breadcrumbs";

function News_Detail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [newsData, setNewsData] = useState(null);
  const [allNews, setAllNews] = useState([]); 
  const [loading, setLoading] = useState(true);

  const items = useMemo(() => {
    const title = newsData?.news?.title;
    return [
      { label: "News", to: "/news" },
      { label: title || "Chi tiết" },
    ];
  }, [newsData?.news?.title]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch chi tiết bài viết hiện tại
        const newsRes = await fetch(`/api/news/${slug}`);
        const newsDetail = await newsRes.json();

        // Fetch tất cả bài viết cho sidebar
        const allNewsRes = await fetch("/api/news");
        const allNewsData = await allNewsRes.json();

        setNewsData({
          news: newsDetail.news,
        });

        const sidebarNews = (allNewsData.news || []);

        setAllNews(sidebarNews);

      } catch (err) {
        console.error("Failed to load news data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchData();
    }
  }, [slug]);

  // Handler khi click vào bài khác trong sidebar
  const handleSelectNews = (n) => {
    navigate(`/news/news-detail/${n.slug}`);
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
            <h2 className="text-2xl font-semibold mb-4">Không tìm thấy bài viết</h2>
            <p>Bài viết với ID "{slug}" không tồn tại hoặc đã bị xóa.</p>
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