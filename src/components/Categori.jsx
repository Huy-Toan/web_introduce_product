import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { groupByGenre } from "../lib/utils";

function ProductCategories({ categories = [], onSelectCategory }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef(null);
  const intervalRef = useRef(null);

  // Swipe states
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const containerRef = useRef(null);

  // Fetch genres from API
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/books");
        const data = await res.json();
        const booksArray = data.books || [];
        const grouped = groupByGenre(booksArray);
        const genreArray = grouped.map((genre) => ({
          id: genre.name,
          ...genre,
        }));

        setGenres(genreArray);
      } catch (err) {
        console.error("Failed to load genres:", err);
        // Fallback data for fruits
        setGenres([
          {
            id: 1,
            name: "Tropical Fruits",
            description: "Fresh tropical fruits from Vietnam",
            count: 25
          },
          {
            id: 2, 
            name: "Citrus Fruits",
            description: "Sweet and sour citrus varieties",
            count: 18
          },
          {
            id: 3,
            name: "Exotic Fruits", 
            description: "Rare and exotic fruit selections",
            count: 12
          },
          {
            id: 4,
            name: "Organic Fruits",
            description: "100% organic certified fruits",
            count: 30
          },
          {
            id: 5,
            name: "Dried Fruits",
            description: "Premium dried fruit collections",
            count: 22
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGenres();
  }, []);

  // Responsive items per view
  const [itemsPerView, setItemsPerView] = useState(4);
  
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 640) { 
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) { 
        setItemsPerView(2);
      } else { 
        setItemsPerView(4);
      }
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  // Sử dụng categories từ props hoặc genres từ API
  const displayCategories = categories.length > 0 ? categories : genres;

  // Circular navigation logic - LUÔN LUÔN circular
  const goToNext = () => {
    setCurrentIndex(prev => {
      if (displayCategories.length <= itemsPerView) {
        // Nếu ít hơn hoặc bằng itemsPerView, vẫn có thể navigate nhưng sẽ circular
        return (prev + 1) % displayCategories.length;
      } else {
        // Logic cũ cho trường hợp có nhiều items
        return prev >= displayCategories.length - itemsPerView ? 0 : prev + 1;
      }
    });
  };

  const goToPrev = () => {
    setCurrentIndex(prev => {
      if (displayCategories.length <= itemsPerView) {
        // Nếu ít hơn hoặc bằng itemsPerView, circular navigation
        return prev <= 0 ? displayCategories.length - 1 : prev - 1;
      } else {
        // Logic cũ cho trường hợp có nhiều items
        return prev <= 0 ? Math.max(0, displayCategories.length - itemsPerView) : prev - 1;
      }
    });
  };

  const goToSlide = (index) => {
    if (displayCategories.length <= itemsPerView) {
      // Nếu ít items, index là chính xác item đó
      setCurrentIndex(index);
    } else {
      // Logic cũ
      const maxIndex = Math.max(0, displayCategories.length - itemsPerView);
      setCurrentIndex(Math.min(index, maxIndex));
    }
  };

  // Auto play slider với circular logic - LUÔN LUÔN hoạt động
  useEffect(() => {
    if (isAutoPlay && displayCategories.length > 0) { // Chỉ cần có categories
      intervalRef.current = setInterval(() => {
        goToNext();
      }, 4000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlay, itemsPerView, displayCategories.length]);

  const handleCategoryClick = (category) => {
    // Navigate to product page with genre query parameter
    const genreName = category.name || category.title;
    if (genreName) {
      // Use encodeURIComponent to handle special characters and spaces
      window.location.href = `/product?genre=${encodeURIComponent(genreName)}`;
    } else {
      window.location.href = '/product';
    }
    
    // Call onSelectCategory if provided
    if (onSelectCategory) {
      onSelectCategory(category);
    }
  };

  // Swipe handling functions
  const handleStart = (clientX) => {
    setIsDragging(true);
    setStartX(clientX);
    setIsAutoPlay(false); // Pause auto-play when dragging
  };

  const handleMove = (clientX) => {
    if (!isDragging) return;
    
    const diff = clientX - startX;
    setTranslateX(diff);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // Nếu kéo đủ xa (> 50px) thì chuyển slide
    if (Math.abs(translateX) > 50) {
      if (translateX > 0) {
        // Vuốt phải - về slide trước
        goToPrev();
      } else {
        // Vuốt trái - sang slide tiếp theo
        goToNext();
      }
    }
    
    setTranslateX(0);
    setIsAutoPlay(true); // Resume auto-play
  };

  // Mouse events
  const handleMouseDown = (e) => {
    e.preventDefault();
    handleStart(e.clientX);
  };

  const handleMouseMove = (e) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  // Touch events
  const handleTouchStart = (e) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    e.preventDefault(); // Prevent scrolling
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Global mouse events for dragging
  useEffect(() => {
    const handleMouseMoveGlobal = (e) => handleMouseMove(e);
    const handleMouseUpGlobal = () => handleMouseUp();

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMoveGlobal);
      document.addEventListener('mouseup', handleMouseUpGlobal);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMoveGlobal);
      document.removeEventListener('mouseup', handleMouseUpGlobal);
    };
  }, [isDragging, startX]);

  const handleMouseEnter = () => setIsAutoPlay(false);
  const handleMouseLeave = () => {
    if (!isDragging) setIsAutoPlay(true); // Only resume if not dragging
  };

  // Loading state
  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Fruit Categories</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Loading our wide range of fresh fruits...
            </p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (displayCategories.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Fruit Categories</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              No categories available at the moment.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Calculate total slides for dots - LUÔN LUÔN hiển thị dots
  const totalSlides = displayCategories.length <= itemsPerView 
    ? displayCategories.length  // Nếu ít items, mỗi dot = 1 item
    : Math.max(1, displayCategories.length - itemsPerView + 1); // Logic cũ

  return (
    <section className="py-16 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">Our Fruit Categories</h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Discover our wide range of fresh and exotic fruits
          </p>
        </div>

        {/* Slider Container */}
        <div 
          ref={containerRef}
          className={`relative max-w-6xl mx-auto select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Navigation Buttons - LUÔN LUÔN hiển thị */}
          <button
            onClick={goToPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-50 shadow-lg rounded-full p-3 transition-all duration-300 hover:shadow-xl pointer-events-auto"
          >
            <ChevronLeft className="h-6 w-6 text-gray-600" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-50 shadow-lg rounded-full p-3 transition-all duration-300 hover:shadow-xl pointer-events-auto"
          >
            <ChevronRight className="h-6 w-6 text-gray-600" />
          </button>

          {/* Slider Track */}
          <div className="overflow-hidden rounded-lg">
            <div 
              ref={sliderRef}
              className="flex transition-transform duration-500 ease-in-out pointer-events-none"
              style={{ 
                transform: `${displayCategories.length <= itemsPerView 
                  ? `translateX(-${currentIndex * (100 / Math.max(itemsPerView, displayCategories.length))}%)`
                  : `translateX(-${currentIndex * (100 / itemsPerView)}%)`
                } ${isDragging ? `translateX(${translateX * 0.3}px)` : ''}`,
                transition: isDragging ? 'none' : 'transform 0.5s ease-in-out'
              }}
            >
              {displayCategories.map((category, index) => (
                <div
                  key={category.id || category.name || index}
                  className="flex-shrink-0 px-2"
                  style={{ width: `${100 / itemsPerView}%` }}
                >
                  <div
                    onClick={() => handleCategoryClick(category)}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 group h-full pointer-events-auto"
                  >
                    <div className="p-4 sm:p-5 lg:p-6 text-center h-full flex flex-col">
                      {/* Image/Icon Container */}
                      <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center group-hover:from-green-200 group-hover:to-green-300 transition-all duration-300">
                        <span className="text-2xl sm:text-3xl pointer-events-none">🍎</span>
                      </div>
                      
                      {/* Category Name */}
                      <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors line-clamp-2">
                        {category.name || category.title}
                      </h3>
                      
                      {/* Description - Hidden on mobile */}
                      <p className="hidden sm:block text-gray-600 text-xs sm:text-sm leading-relaxed mb-3 flex-grow">
                        {category.description || `Fresh fruits in ${category.name || category.title} category`}
                      </p>
                      
                      {/* Fruit Count */}
                      {(category.books || category.count) && (
                        <div className="text-xs text-green-600 font-medium mb-3">
                          {category.count || (category.books ? category.books.length : 0)} varieties
                        </div>
                      )}
                      
                      {/* View Fruits Link */}
                      <div className="inline-flex items-center text-green-600 font-medium group-hover:text-green-700 transition-colors text-xs sm:text-sm">
                        <span className="mr-1">View Fruits</span>
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

          {/* Dots Indicators - LUÔN LUÔN hiển thị */}
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 pointer-events-auto ${
                  index === currentIndex 
                    ? 'bg-green-600 w-8' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-8 sm:mt-12">
          <button 
            onClick={() => window.location.href = "/product"}
            className="bg-green-600 hover:bg-green-700 cursor-pointer text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold transition-colors duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base"
          >
            Browse All Fruits
          </button>
        </div>
      </div>
    </section>
  );
}

export default ProductCategories;