import TopNavigation from "../components/Navigation";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import AboutHeaderBanner from "../components/AboutBanner";
import MarkdownOnly from "../components/MarkdownOnly";

function FieldPage() {
  const [fieldContent, setFieldContent] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFieldContent = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/fields");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        const fieldArray = data.items || [];
        setFieldContent(fieldArray);
      } catch (err) {
        console.error("Lỗi khi tải fields:", err);
        setFieldContent([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFieldContent();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />
      <AboutHeaderBanner />

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="h-10 w-10 border-2 border-blue-800 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <main className="bg-white">
          {fieldContent.length > 0 ? (
            fieldContent.map((item) => (
              <section key={item.id} className="py-12 px-4">
                <div className="max-w-4xl mx-auto">
                  {/* Tên */}
                  <h2 className="text-3xl font-bold text-yellow-600 mb-6">
                    {item.name}
                  </h2>

                  {/* Nội dung (Markdown) */}
                  <div className="prose max-w-none prose-p:leading-relaxed text-gray-700">
                    <MarkdownOnly value={item.content} />
                  </div>

                  {item.image_url && (
                    <div className="mt-8">
                      <img
                        src={item.image_url || "./banner.jpg"}
                        alt={item.name || "Field image"}
                        className="w-full max-h-[520px] object-cover rounded-lg shadow"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "./banner.jpg"; 
                        }}
                      />
                    </div>
                  )}
                </div>
              </section>
            ))
          ) : (
            <div className="text-center py-20 text-gray-500">
              <p>Không có nội dung nào để hiển thị.</p>
            </div>
          )}
        </main>
      )}

      <Footer />
    </div>
  );
}

export default FieldPage;
