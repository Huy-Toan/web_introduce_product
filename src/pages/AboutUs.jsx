import TopNavigation from "../components/Navigation";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";

function AboutPage() {
  const [aboutContent, setAboutContent] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAboutContent = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/about");
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        
        // Xử lý data giống như LibraryPage
        const aboutArray = data.about || [];
        console.log("About array:", aboutArray);
        
        if (aboutArray.length > 0) {
          setAboutContent(aboutArray);
        } else {
          setAboutContent([]);
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu About Us:", err);
        setAboutContent([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAboutContent();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />
      
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="h-10 w-10 border-2 border-blue-800 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <main className="bg-white">
          {/* Header Section */}
          <div className="text-center py-12 bg-gray-50 mt-16">
            <h1 className="text-4xl font-bold text-yellow-600 mb-4">
              VỀ CHÚNG TÔI
            </h1>
            <h2 className="text-2xl font-semibold text-gray-700">
              THÔNG TIN VỀ THƯ VIỆN
            </h2>
            <div className="w-24 h-1 bg-yellow-500 mx-auto mt-6"></div>
          </div>

          {aboutContent.length > 0 ? (
            aboutContent.map((item, index) => (
              <div key={item.id}>
                {/* First Section - About Us with Image on Left */}
                {index === 0 && (
                  <section className="py-16 px-4">
                    <div className="max-w-7xl mx-auto">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Image */}
                        <div className="order-2 lg:order-1">
                          {item.image_url && (
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="w-full h-[400px] object-cover rounded-lg shadow-lg"
                            />
                          )}
                        </div>
                        
                        {/* Content */}
                        <div className="order-1 lg:order-2">
                          <div className="mb-6">
                            <h4 className="text-3xl font-bold text-yellow-600 mb-6">
                              {item.title}
                            </h4>
                          </div>
                          
                          <div className="space-y-6 text-gray-600 leading-relaxed">
                            <p className="whitespace-pre-wrap">
                              {item.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {/* Second Section - Mission/Vision with Image on Right */}
                {index === 1 && (
                  <section className="py-16 px-4 bg-gray-50">
                    <div className="max-w-7xl mx-auto">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Content */}
                        <div>
                          <h3 className="text-3xl font-bold text-yellow-600 mb-8">
                            {item.title}
                          </h3>
                          
                          <div className="space-y-6 text-gray-600">
                            <div className="whitespace-pre-wrap">
                              {item.content}
                            </div>
                          </div>
                        </div>
                        
                        {/* Image */}
                        <div>
                          {item.image_url && (
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="w-full h-[500px] object-cover rounded-lg shadow-lg"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </section>
                )}
              </div>
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

export default AboutPage;