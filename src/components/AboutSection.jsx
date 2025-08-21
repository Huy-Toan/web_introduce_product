import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router";

const AboutSection = () => {
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
    <section className="bg-white py-20">
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

export default AboutSection;