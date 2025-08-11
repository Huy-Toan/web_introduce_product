import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router";
import { NewsCard } from './NewsCard';

// Header/About Component
export const AboutSection = () => {
  const [aboutData, setAboutData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Function để cắt text
  const truncateText = (text, maxLength = 120) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    
    // Tìm vị trí space gần nhất để không cắt giữa từ
    const truncated = text.substring(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    
    if (lastSpaceIndex > maxLength * 0.8) {
      return truncated.substring(0, lastSpaceIndex) + '...';
    }
    
    return truncated + '...';
  };
  
  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const res = await fetch("/api/about");
        const data = await res.json();
        const aboutArray = data.about || [];
        setAboutData(aboutArray);
      } catch (err) {
        console.error("Failed to load about data:", err);
        setAboutData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
  }, []);

  if (loading) {
    return (
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="h-10 w-10 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            {aboutData.length > 0 && (
              <>
                <h1 className="text-4xl lg:text-5xl font-bold text-yellow-600 mb-4 tracking-wider">
                  {aboutData[0].title}
                </h1>
                <h2 className="text-xl font-semibold text-green-800 mb-6 tracking-wide">
                  THƯ VIỆN HIỆN ĐẠI – CHẤT LƯỢNG DỊCH VỤ
                </h2>
                
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    {truncateText(aboutData[0].content, 150)}
                  </p>
                  
                  {aboutData[1] && (
                    <div className="mt-6">
                      <p className="font-semibold italic text-green-800 mb-2">{aboutData[1].title}:</p>
                      <p>
                        {truncateText(aboutData[1].content, 100)}
                      </p>
                    </div>
                  )}
                </div>
                
                <button
                  className="bg-gradient-to-r cursor-pointer from-yellow-500 to-yellow-600 text-white px-8 py-3 rounded-full font-semibold hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
                  onClick={() => navigate("/about")}
                >
                  Đọc thêm →
                </button>
              </>
            )}
          </div>
          
          <div className="relative">
            <div className="rounded-xl overflow-hidden shadow-2xl transform hover:-translate-y-2 transition-transform duration-300">
              <img 
                src={aboutData[0]?.image_url || "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"} 
                alt={aboutData[0]?.title || "Thư viện"}
                className="w-full h-80 object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Promotion Section Component
export const PromotionSection = () => {
  const [promotionData, setPromotionData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromotionData = async () => {
      try {
        const res = await fetch("/api/promotions");
        const data = await res.json();
        const promotionArray = data.promotions || [];
        setPromotionData(promotionArray);
      } catch (err) {
        console.error("Failed to load promotion data:", err);
        // Fallback data nếu API lỗi
        setPromotionData([
          { id: 1, title: "Sách mới", image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
          { id: 2, title: "Sách văn học", image_url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
          { id: 3, title: "Sách khoa học", image_url: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
          { id: 4, title: "Sách thiếu nhi", image_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotionData();
  }, []);

  return (
    <section className="bg-gradient-to-br from-gray-50 to-gray-200 py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-gray-600 text-lg mb-4 font-medium">
            TÌM KIẾM SÁCH HAY NHẤT TUẦN
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold text-yellow-600 mb-6 tracking-wider">
            ƯU ĐÃI ĐẶC BIỆT
          </h2>
          <p className="text-gray-700 text-xl italic">
            Từ thư viện đến tận tay bạn.
          </p>
        </div>
        
        {loading ? (
          <div className="text-center">
            <div className="h-10 w-10 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {promotionData.map((item) => (
              <div 
                key={item.id}
                className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-300 relative group"
              >
                <div className="relative overflow-hidden">
                  <img 
                    src={item.image_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"} 
                    alt={item.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-yellow-600 bg-opacity-90 text-white px-4 py-2 rounded-full text-sm font-bold">
                    THƯ VIỆN
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-center text-gray-800">{item.title}</h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// Testimonial Component
export const TestimonialSection = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [testimonialData, setTestimonialData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonialData = async () => {
      try {
        const res = await fetch("/api/testimonials");
        const data = await res.json();
        const testimonialArray = data.testimonials || [];
        setTestimonialData(testimonialArray);
      } catch (err) {
        console.error("Failed to load testimonial data:", err);
        // Fallback data
        setTestimonialData([
          {
            id: 1,
            content: "Thư viện có nhiều sách hay và dịch vụ tuyệt vời!",
            author_name: "Nguyễn Văn A",
            author_title: "Sinh viên | TP.HCM"
          },
          {
            id: 2,
            content: "Môi trường học tập lý tưởng, nhân viên thân thiện và nhiệt tình.",
            author_name: "Trần Thị B",
            author_title: "Giáo viên | Hà Nội"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonialData();
  }, []);

  
  if (loading || testimonialData.length === 0) {
    return (
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="h-10 w-10 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-8 flex items-center justify-center">
            <span className="text-2xl">👤</span>
          </div>
          
          <div className="relative mb-8">
            <p className="text-xl lg:text-2xl text-gray-700 italic leading-relaxed px-8 relative">
              <span className="text-6xl text-yellow-500 absolute -top-4 -left-2">"</span>
              {testimonialData[activeSlide].content}
              <span className="text-6xl text-yellow-500 absolute -bottom-8 -right-2">"</span>
            </p>
          </div>
          
          <div className="mb-6">
            <p className="font-bold text-lg text-gray-800 mb-1">
              {testimonialData[activeSlide].author_name}
            </p>
            <p className="text-gray-600">
              {testimonialData[activeSlide].author_title}
            </p>
          </div>
          
          <div className="flex justify-center space-x-3 mb-12">
            {testimonialData.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  activeSlide === index ? 'bg-yellow-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
        </div>
      </div>
    </section>
  );
};

// News Section Component
export const NewsSection = () => {
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  const handleNewsSelect = (newsId) => {
    navigate(`/news/news-detail/${newsId}`);
  };


  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-yellow-600 tracking-wider">
            TIN TỨC
          </h2>
        </div>
        
        {loading ? (
          <div className="text-center">
            <div className="h-10 w-10 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {newsData.map((newsItem) => (
              <NewsCard
                key={newsItem.id}
                news={newsItem}
                onClick={() => handleNewsSelect(newsItem.id)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// Main App Component
const TakimexWebsite = () => {
  return (
    <div className="min-h-screen">
      <AboutSection />
      <PromotionSection />
      <TestimonialSection />
      <NewsSection />
    </div>
  );
};

export default TakimexWebsite;