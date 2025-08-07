import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function ProductCategories({ categories = [], onSelectCategory }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const sliderRef = useRef(null);
  const intervalRef = useRef(null);

  // Default categories nếu không có props truyền vào
  const defaultCategories = [
    {
      id: 1,
      name: "HANDICRAFT PRODUCTS",
      image: "🏺",
      description: "Traditional Vietnamese handicrafts",
      count: 45
    },
    {
      id: 2,
      name: "CANNED & FROZEN",
      image: "🥫",
      description: "Preserved and frozen foods",
      count: 32
    },
    {
      id: 3,
      name: "AGRO WASTE PRODUCTS", 
      image: "🐄",
      description: "Agricultural waste and feed products",
      count: 28
    },
    {
      id: 4,
      name: "OTHER PRODUCTS",
      image: "🌿",
      description: "Various agricultural products",
      count: 56
    },
    {
      id: 5,
      name: "FRESH FRUITS",
      image: "🍓",
      description: "Fresh tropical fruits",
      count: 38
    },
    {
      id: 6,
      name: "COFFEE & TEA",
      image: "☕",
      description: "Premium coffee and tea",
      count: 24
    },
    {
      id: 7,
      name: "SPICES & HERBS",
      image: "🌶️",
      description: "Aromatic spices and herbs",
      count: 41
    },
    {
      id: 8,
      name: "RICE & GRAINS",
      image: "🌾",
      description: "Premium rice and grain products",
      count: 29
    }
  ];

  const displayCategories = categories.length > 0 ? categories : defaultCategories;
  const itemsPerView = 4; // Số items hiển thị cùng lúc
  const maxIndex = Math.max(0, displayCategories.length - itemsPerView);

  // Auto play slider
  useEffect(() => {
    if (isAutoPlay && displayCategories.length > itemsPerView) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => prev >= maxIndex ? 0 : prev + 1);
      }, 4000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlay, maxIndex, itemsPerView]);

  const goToNext = () => {
    setCurrentIndex(prev => prev >= maxIndex ? 0 : prev + 1);
  };

  const goToPrev = () => {
    setCurrentIndex(prev => prev <= 0 ? maxIndex : prev - 1);
  };

  const goToSlide = (index) => {
    setCurrentIndex(Math.min(index, maxIndex));
  };

  const handleCategoryClick = (category) => {
    if (onSelectCategory) {
      onSelectCategory(category);
    }
  };

  const handleMouseEnter = () => setIsAutoPlay(false);
  const handleMouseLeave = () => setIsAutoPlay(true);

  return (
    <section className="py-16 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Product Categories</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our wide range of premium Vietnamese agricultural and handicraft products
          </p>
        </div>

        {/* Slider Container */}
        <div 
          className="relative max-w-6xl mx-auto"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Navigation Buttons */}
          {displayCategories.length > itemsPerView && (
            <>
              <button
                onClick={goToPrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-50 shadow-lg rounded-full p-3 transition-all duration-300 hover:shadow-xl"
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="h-6 w-6 text-gray-600" />
              </button>
              
              <button
                onClick={goToNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-50 shadow-lg rounded-full p-3 transition-all duration-300 hover:shadow-xl"
                disabled={currentIndex === maxIndex}
              >
                <ChevronRight className="h-6 w-6 text-gray-600" />
              </button>
            </>
          )}

          {/* Slider Track */}
          <div className="overflow-hidden rounded-lg">
            <div 
              ref={sliderRef}
              className="flex transition-transform duration-500 ease-in-out gap-6"
              style={{ 
                transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
                width: `${(displayCategories.length / itemsPerView) * 100}%`
              }}
            >
              {displayCategories.map((category, index) => (
                <div
                  key={category.id || index}
                  className="flex-shrink-0"
                  style={{ width: `${100 / displayCategories.length}%` }}
                >
                  <div
                    onClick={() => handleCategoryClick(category)}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 group h-full mx-3"
                  >
                    <div className="p-6 text-center h-full flex flex-col">
                      {/* Image/Icon Container */}
                      <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center group-hover:from-green-200 group-hover:to-green-300 transition-all duration-300">
                        <span className="text-3xl">{category.image || category.icon || "📦"}</span>
                      </div>
                      
                      {/* Category Name */}
                      <h3 className="text-base font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors line-clamp-2">
                        {category.name || category.title}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-gray-600 text-sm leading-relaxed mb-3 flex-grow">
                        {category.description || `Products in ${category.name}`}
                      </p>
                      
                      {/* Product Count */}
                      {category.count && (
                        <div className="text-xs text-green-600 font-medium mb-3">
                          {category.count} products
                        </div>
                      )}
                      
                      {/* View Products Link */}
                      <div className="inline-flex items-center text-green-600 font-medium group-hover:text-green-700 transition-colors text-sm">
                        <span className="mr-1">View Products</span>
                        <svg 
                          className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Hover Effect Border */}
                    <div className="h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-b-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicators */}
          {displayCategories.length > itemsPerView && (
            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'bg-green-600 w-8' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <button 
            onClick={() => handleCategoryClick({ name: "All Products" })}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300 shadow-lg hover:shadow-xl"
          >
            Browse All Products
          </button>
        </div>
      </div>
    </section>
  );
}

export default ProductCategories;