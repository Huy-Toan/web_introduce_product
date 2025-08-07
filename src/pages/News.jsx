import TopNavigation from "../components/Navigation";
import Footer from "../components/Footer";

function News() {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />
      <main className="container mx-auto px-4 py-6 mt-12 max-w-7xl">
        <h1 className="text-3xl font-bold">News</h1>
        <p className="mt-4 text-gray-700">
          Đây là trang tin tức
        </p>
      </main>
      <Footer />
    </div>
  );
}

export default News;
