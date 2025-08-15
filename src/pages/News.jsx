import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import TopNavigation from "../components/Navigation";
import Footer from "../components/Footer";
import { NewsCard } from "../components/NewsCard";
import { NewsHeaderBanner } from "../components/Newsheader";

function News() {
  const navigate = useNavigate();
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        const res = await fetch("/api/news");
        const data = await res.json();
        const newsArray = data.news || [];
        setNewsData(newsArray);
      } catch (err) {
        console.error("Failed to load news data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsData();
  }, []);

  const handleNewsSelect = (item) => {
    navigate(`/news/news-detail/${item.slug}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />
      <NewsHeaderBanner />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Latest News</h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="h-10 w-10 border-2 border-blue-800 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : newsData.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Hiện tại chưa có tin tức nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsData.map((newsItem) => (
              console.log(newsItem),
              <NewsCard
                key={newsItem.id}
                news={newsItem}
                onClick={() => handleNewsSelect(newsItem)}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default News;