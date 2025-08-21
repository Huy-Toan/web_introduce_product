import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

function ProductCategories({ categories = [], onSelectCategory }) {
  const navigate = useNavigate();

  // data từ API (khi không truyền props)
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);

  // slider states
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [itemsPerView, setItemsPerView] = useState(4);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const sliderRef = useRef(null);
  const containerRef = useRef(null);
  const intervalRef = useRef(null);

  // Fetch categories 1 lần khi load trang
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/parent_categories", { cache: "no-store", signal: ac.signal });
        const data = await res.json();
        const list = Array.isArray(data?.parents) ? data.parents : [];
        // Chuẩn hóa nhẹ
        setCats(
          list.map((c) => ({
            id: c.id,
            name: c.name ?? c.title ?? c.slug ?? "Category",
            slug: c.slug ?? (c.id != null ? String(c.id) : ""),
            image_url: c.image_url && c.image_url !== "null" ? c.image_url : null,
          }))
        );
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Failed to load parents:", err);
          setCats([]);
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);

  // Responsive items per view
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 640) setItemsPerView(1);
      else if (window.innerWidth < 1024) setItemsPerView(2);
      else setItemsPerView(3);
    };
    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  // ưu tiên props; nếu không có thì dùng cats từ API
  const displayCategories = categories.length > 0 ? categories : cats;

  // Next/Prev (có circular)
  const goToNext = () => {
    setCurrentIndex((prev) => {
      if (displayCategories.length <= itemsPerView) {
        return (prev + 1) % displayCategories.length;
      }
      return prev >= displayCategories.length - itemsPerView ? 0 : prev + 1;
    });
  };
  const goToPrev = () => {
    setCurrentIndex((prev) => {
      if (displayCategories.length <= itemsPerView) {
        return prev <= 0 ? displayCategories.length - 1 : prev - 1;
      }
      return prev <= 0 ? Math.max(0, displayCategories.length - itemsPerView) : prev - 1;
    });
  };
  const goToSlide = (index) => {
    if (displayCategories.length <= itemsPerView) setCurrentIndex(index);
    else setCurrentIndex(Math.min(index, Math.max(0, displayCategories.length - itemsPerView)));
  };

  // Auto play
  useEffect(() => {
    if (isAutoPlay && displayCategories.length > 0) {
      intervalRef.current = setInterval(goToNext, 4000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAutoPlay, itemsPerView, displayCategories.length]);

  // Swipe handlers
  const handleStart = (clientX) => {
    setIsDragging(true);
    setStartX(clientX);
    setIsAutoPlay(false);
  };
  const handleMove = (clientX) => {
    if (!isDragging) return;
    setTranslateX(clientX - startX);
  };
  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (Math.abs(translateX) > 50) (translateX > 0 ? goToPrev() : goToNext());
    setTranslateX(0);
    setIsAutoPlay(true);
  };

  // Global mouse events for dragging
  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMoveGlobal = (e) => handleMove(e.clientX);
    const handleMouseUpGlobal = () => handleEnd();
    document.addEventListener("mousemove", handleMouseMoveGlobal);
    document.addEventListener("mouseup", handleMouseUpGlobal);
    return () => {
      document.removeEventListener("mousemove", handleMouseMoveGlobal);
      document.removeEventListener("mouseup", handleMouseUpGlobal);
    };
  }, [isDragging, startX, translateX]);

  const handleMouseEnter = () => setIsAutoPlay(false);
  const handleMouseLeave = () => {
    if (!isDragging) setIsAutoPlay(true);
  };

  const handleCategoryClick = (category) => {
    const slug = category.slug || category.id;
    // Điều hướng SPA tới trang products kèm filter bằng slug
    navigate(`/product/${encodeURIComponent(slug)}`);
    onSelectCategory?.(category);
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        </div>
      </section>
    );
  }

  if (displayCategories.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-600">Chưa có danh mục.</p>
        </div>
      </section>
    );
  }

  const totalSlides =
    displayCategories.length <= itemsPerView
      ? displayCategories.length
      : Math.max(1, displayCategories.length - itemsPerView + 1);

  const baseTranslate =
    displayCategories.length <= itemsPerView
      ? `translateX(-${currentIndex * (100 / Math.max(itemsPerView, displayCategories.length))}%)`
      : `translateX(-${currentIndex * (100 / itemsPerView)}%)`;

  return (
    <section className="py-16 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">
            Product Categories
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Select a category to view related products
          </p>
        </div>

        {/* Slider Container */}
        <div
          ref={containerRef}
          className={`relative max-w-6xl mx-auto select-none ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseDown={(e) => {
            e.preventDefault();
            handleStart(e.clientX);
          }}
          onTouchStart={(e) => handleStart(e.touches[0].clientX)}
          onTouchMove={(e) => {
            e.preventDefault();
            handleMove(e.touches[0].clientX);
          }}
          onTouchEnd={handleEnd}
        >
          {/* Navigation Buttons */}
          <button
            onClick={goToPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white cursor-pointer hover:bg-gray-50 shadow-lg rounded-full p-3 transition-all duration-300 hover:shadow-xl pointer-events-auto"
          >
            <ChevronLeft className="h-6 w-6 text-gray-600" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white cursor-pointer hover:bg-gray-50 shadow-lg rounded-full p-3 transition-all duration-300 hover:shadow-xl pointer-events-auto"
          >
            <ChevronRight className="h-6 w-6 text-gray-600" />
          </button>

          {/* Slider Track */}
          <div className="overflow-hidden rounded-lg">
            <div
              ref={sliderRef}
              className="flex transition-transform duration-500 ease-in-out pointer-events-none"
              style={{
                transform: `${baseTranslate} ${
                  isDragging ? `translateX(${translateX * 0.3}px)` : ""
                }`,
                transition: isDragging ? "none" : "transform 0.5s ease-in-out",
              }}
            >
              {displayCategories.map((category, index) => {
                const name = category.name || category.title || category.slug || "Category";
                const img =
                  category.image_url && category.image_url !== "null"
                    ? category.image_url
                    : "/banner.jpg";
                  return (
                    <div
                      key={category.id || category.slug || name || index}
                      className="flex-shrink-0 px-2"
                      style={{ width: `${100 / itemsPerView}%` }}
                    >
                      <div
                        onClick={() => handleCategoryClick(category)}
                        className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 group h-full pointer-events-auto overflow-hidden"
                      >
                        {/* Image - chiếm toàn bộ phần trên */}
                        <div className="w-full aspect-[4/5] sm:aspect-[3/4] overflow-hidden">
                          <img
                            src={img}
                            alt={name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>
                        
                        {/* Content - phần dưới chứa tiêu đề, gần sát dưới */}
                        <div className="p-3 text-center">
                          <h3 className="text-sm font-semibold text-gray-800 group-hover:text-green-600 transition-colors line-clamp-2">
                            {name}
                          </h3>
                        </div>

                        {/* Hover border */}
                        <div className="h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-b-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                      </div>
                    </div>
                  );
              })}
            </div>
          </div>

          {/* Dots */}
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 pointer-events-auto ${
                  index === currentIndex ? "bg-green-600 w-8" : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-8 sm:mt-12">
          <button
            onClick={() => navigate("/product")}
            className="bg-green-600 hover:bg-green-700 cursor-pointer text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold transition-colors duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base"
          >
           Brown all products
          </button>
        </div>
      </div>
    </section>
  );
}

export default ProductCategories;
