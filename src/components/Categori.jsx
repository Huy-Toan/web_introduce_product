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

  // Fetch genres from API
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/books");
        const data = await res.json();
        const booksArray = data.books || [];
        const grouped = groupByGenre(booksArray);
        
        // Convert grouped object to array format
        // const genreArray = Object.entries(grouped).map(([name, genreData]) => ({
        //   id: name,
        //   name: genreData.name || name,
        //   books: genreData.books || genreData,
        //   count: genreData.count || (genreData.books ? genreData.books.length : 0)
        // }));
        const genreArray = grouped.map((genre) => ({
          id: genre.name,
          ...genre,
        }));

        setGenres(genreArray);
      } catch (err) {
        console.error("Failed to load genres:", err);
        // Fallback to empty array if API fails
        setGenres([]);
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
  }, [isAutoPlay, maxIndex, itemsPerView, displayCategories.length]);

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

  const handleMouseEnter = () => setIsAutoPlay(false);
  const handleMouseLeave = () => setIsAutoPlay(true);

  // Loading state
  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Book Categories</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Loading our wide range of book genres...
            </p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Book Categories</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              No categories available at the moment.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">Our Book Categories</h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Discover our wide range of book genres and collections
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
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white cursor-pointer hover:bg-gray-50 shadow-lg rounded-full p-3 transition-all duration-300 hover:shadow-xl"
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
              className="flex transition-transform duration-500 ease-in-out gap-3 sm:gap-4 lg:gap-6"
              style={{ 
                transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
                width: `${(displayCategories.length / itemsPerView) * 100}%`
              }}
            >
              {displayCategories.map((category, index) => (
                <div
                  key={category.id || category.name || index}
                  className="flex-shrink-0"
                  style={{ width: `${100 / displayCategories.length}%` }}
                >
                  <div
                    onClick={() => handleCategoryClick(category)}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 group h-full mx-1 sm:mx-2 lg:mx-3"
                  >
                    <div className="p-4 sm:p-5 lg:p-6 text-center h-full flex flex-col">
                      {/* Image/Icon Container */}
                      <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300">
                        <span className="text-2xl sm:text-3xl">📚</span>
                      </div>
                      
                      {/* Category Name */}
                      <h3 className="text-sm sm:text-base lg:text-base font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {category.name || category.title}
                      </h3>
                      
                      {/* Description - Hidden on mobile */}
                      <p className="hidden sm:block text-gray-600 text-xs sm:text-sm leading-relaxed mb-3 flex-grow">
                        {category.description || `Books in ${category.name || category.title} genre`}
                      </p>
                      
                      {/* Book Count */}
                      {(category.books || category.count) && (
                        <div className="text-xs text-blue-600 font-medium mb-3">
                          {category.count || (category.books ? category.books.length : 0)} books
                        </div>
                      )}
                      
                      {/* View Books Link */}
                      <div className="inline-flex items-center text-blue-600 font-medium group-hover:text-blue-700 transition-colors text-xs sm:text-sm">
                        <span className="mr-1">View Books</span>
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
                    <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-b-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
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
                      ? 'bg-blue-600 w-8' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-8 sm:mt-12">
          <button 
            onClick={() => window.location.href = "/product"}
            className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold transition-colors duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base"
          >
            Browse All Books
          </button>
        </div>
      </div>
    </section>
  );
}

export default ProductCategories;