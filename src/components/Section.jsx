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
    <section className="bg-gradient-to-br from-gray-70 to-gray-100 py-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            {aboutData.length > 0 && (
              <>
                <h1 className="text-xl font-semibold text-green-800 mb-6 tracking-wide">
                  FRESH QUALITY – GLOBAL DELIVERY
                </h1>
                <h2 className="text-4xl lg:text-5xl font-bold text-yellow-600 mb-4 tracking-wider">
                  {aboutData[0].title}
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
                  Learn more →
                </button>
              </>
            )}
          </div>
          
          <div className="relative">
            <div className="rounded-xl overflow-hidden shadow-2xl transform hover:-translate-y-2 transition-transform duration-300">
              <img 
                src={aboutData[0]?.image_url} 
                alt={aboutData[0]?.title || "About Image"}
                className="w-full h-[500px] object-cover"
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
          { id: 1, title: "Sách mới", image_url: "./promotion1.jpg" },
          { id: 2, title: "Sách văn học", image_url: "./promotion2.jpg" },
          { id: 3, title: "Sách khoa học", image_url: "./promotion3.jpg" },
          { id: 4, title: "Sách thiếu nhi", image_url: "./promotion4.jpg" }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotionData();
  }, []);

  return (
    <section className="bg-gradient-to-br py-20 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <p className="text-gray-600 text-lg mb-4 font-medium">
            SEARCH NEWEST PRODUCTS OF THE WEEK
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold text-yellow-600 mb-6 tracking-wider">
            SPECIAL OFFERS
          </h2>
          <p className="text-gray-700 text-xl italic">
            From us to you.
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
                    src={item.image_url} 
                    className="w-full h-90 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-yellow-600 bg-opacity-90 text-white px-4 py-2 rounded-full text-sm font-bold">
                    AllXone
                  </div>
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
            content: "The imported fruits from FreshFruit are always fresh and high quality. The Thai red dragon fruit I bought last week is still as delicious as freshly picked!",
            author_name: "Nguyen Thi Mai",
            author_title: "Fruit Store Owner | Ho Chi Minh City",
            author_avatar: "./banner.jpg"
          },
          {
            id: 2,
            content: "Fast export service with careful packaging. Our durian shipment arrived in Singapore in perfect condition. Looking forward to long-term cooperation!",
            author_name: "Tran Van Duc",
            author_title: "Export Director | Tien Giang",
            author_avatar: "./promotion1.jpg"
          },
          {
            id: 3,
            content: "Reasonable prices and always fresh fruits. Especially mangosteen and rambutan - my customers are very satisfied. On-time delivery every time!",
            author_name: "Le Thi Huong",
            author_title: "Distributor | Hanoi",
            author_avatar: "./promotion2.jpg"
          },
          {
            id: 4,
            content: "Professional import process with complete documentation. Japanese Fuji apples and Chilean green grapes are excellent quality. Very helpful consulting team!",
            author_name: "Pham Minh Tam",
            author_title: "Supermarket Owner | Da Nang",
            author_avatar: "./promotion3.jpg"
          },
          {
            id: 5,
            content: "Since partnering with FreshFruit, our revenue increased by 40%. Diverse imported fruits with consistent quality. Excellent marketing support!",
            author_name: "Vo Thanh Long",
            author_title: "Premium Fruit Store | Can Tho",
            author_avatar: "./promotion4.jpg"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonialData();
  }, []);

  // Function để chuyển đến slide trước (circular)
  const goToPrevious = () => {
    setActiveSlide(prev => 
      prev === 0 ? testimonialData.length - 1 : prev - 1
    );
  };

  // Function để chuyển đến slide tiếp (circular)
  const goToNext = () => {
    setActiveSlide(prev => 
      prev === testimonialData.length - 1 ? 0 : prev + 1
    );
  };

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
      <section className="bg-gray-60 py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="max-w-4xl mx-auto text-center relative">
            <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-8 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
              <img 
                src={testimonialData[activeSlide].author_avatar || "/promotion1.jpg"} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            </div>
            
            <div className="relative mb-8 flex items-center">
              {/* Previous Button */}
              <button
                onClick={goToPrevious}
                className="absolute -left-16 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:bg-yellow-50 border border-gray-200 z-10"
              >
                <span className="text-gray-600 group-hover:text-yellow-600 transition-colors duration-300 transform group-hover:-translate-x-0.5 text-xl">
                  ←
                </span>
              </button>

              {/* Next Button */}
              <button
                onClick={goToNext}
                className="absolute -right-16 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:bg-yellow-50 border border-gray-200 z-10"
              >
                <span className="text-gray-600 group-hover:text-yellow-600 transition-colors duration-300 transform group-hover:translate-x-0.5 text-xl">
                  →
                </span>
              </button>

              <p className="text-xl lg:text-2xl text-gray-700 italic leading-relaxed px-8 relative w-full">
                {testimonialData[activeSlide].content}
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

  const handleNewsSelect = (item) => {
    navigate(`/news/news-detail/${item.slug}`);
  };


  return (
    <section className="bg-white py-30">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-yellow-600 tracking-wider">
            NEWS
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
                onClick={() => handleNewsSelect(newsItem)}
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