// src/components/Categori.jsx  (ProductCategories)
import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const SUPPORTED = ["vi", "en"];
const DEFAULT_LOCALE = "vi";

function resolveLocale(propLocale, search) {
  const fromProp = (propLocale || "").toLowerCase();
  const urlLc = new URLSearchParams(search).get("locale")?.toLowerCase() || "";
  const lsLc = (localStorage.getItem("locale") || "").toLowerCase();

  if (SUPPORTED.includes(fromProp)) return fromProp;
  if (SUPPORTED.includes(urlLc)) return urlLc;
  if (SUPPORTED.includes(lsLc)) return lsLc;
  return DEFAULT_LOCALE;
}

function normalizeParentsPayload(data) {
  // Hỗ trợ nhiều kiểu payload khác nhau từ BE
  const list =
    data?.parents ??
    data?.parent_categories ??
    data?.items ??
    (Array.isArray(data) ? data : []);
  return Array.isArray(list) ? list : [];
}

function ProductCategories({ categories = [], onSelectCategory, locale: localeProp }) {
  const navigate = useNavigate();
  const location = useLocation();

  // locale
  const locale = useMemo(
    () => resolveLocale(localeProp, location.search),
    [localeProp, location.search]
  );

  // i18n text
  const t = useMemo(
    () =>
      locale === "vi"
        ? {
          heading: "Danh mục sản phẩm",
          sub: "Chọn một danh mục để xem các sản phẩm liên quan",
          empty: "Chưa có danh mục.",
          ctaAll: "Xem tất cả sản phẩm",
          prev: "Trước",
          next: "Sau",
        }
        : {
          heading: "Product Categories",
          sub: "Select a category to view related products",
          empty: "No categories yet.",
          ctaAll: "Browse all products",
          prev: "Prev",
          next: "Next",
        },
    [locale]
  );

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

  // đồng bộ <html lang> + lưu
  useEffect(() => {
    try {
      document.documentElement.lang = locale;
      localStorage.setItem("locale", locale);
    } catch { }
  }, [locale]);

  // Fetch categories theo locale
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/parent_categories?locale=${encodeURIComponent(locale)}`, {
          cache: "no-store",
          signal: ac.signal,
        });
        const data = await res.json();
        const list = normalizeParentsPayload(data);
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
  }, [locale]);

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
        return displayCategories.length ? (prev + 1) % displayCategories.length : 0;
      }
      return prev >= displayCategories.length - itemsPerView ? 0 : prev + 1;
    });
  };
  const goToPrev = () => {
    setCurrentIndex((prev) => {
      if (displayCategories.length <= itemsPerView) {
        return prev <= 0 ? Math.max(0, displayCategories.length - 1) : prev - 1;
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
    navigate(`/product/${encodeURIComponent(slug)}?locale=${locale}`);
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
          <p className="text-center text-gray-600">{t.empty}</p>
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
        <div className="text-center mb-8 sm:mb-12 not-prose">
          {/* ép màu xanh lá */}
          <h2 className="text-2xl sm:text-3xl font-bold !text-green-600 mb-3 sm:mb-4">
            {t.heading}
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            {t.sub}
          </p>
        </div>


        {/* Slider Container */}
        <div
          ref={containerRef}
          className={`relative max-w-6xl mx-auto select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"
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
            aria-label={t.prev}
            title={t.prev}
          >
            <ChevronLeft className="h-6 w-6 text-gray-600" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white cursor-pointer hover:bg-gray-50 shadow-lg rounded-full p-3 transition-all duration-300 hover:shadow-xl pointer-events-auto"
            aria-label={t.next}
            title={t.next}
          >
            <ChevronRight className="h-6 w-6 text-gray-600" />
          </button>

          {/* Slider Track */}
          <div className="overflow-hidden rounded-lg">
            <div
              ref={sliderRef}
              className="flex transition-transform duration-500 ease-in-out pointer-events-none"
              style={{
                transform: `${baseTranslate} ${isDragging ? `translateX(${translateX * 0.3}px)` : ""}`,
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
                      title={name}
                      aria-label={name}
                    >
                      {/* Image */}
                      <div className="w-full aspect-[4/5] sm:aspect-[3/4] overflow-hidden">
                        <img
                          src={img}
                          alt={name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/banner.jpg";
                          }}
                        />
                      </div>

                      {/* Content */}
                      <div className="p-3 text-center">
                        <h3 className="text-sm font-semibold text-gray-800 group-hover:text-green-600 transition-colors line-clamp-2">
                          {name}
                        </h3>
                      </div>

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
                className={`w-3 h-3 rounded-full transition-all duration-300 pointer-events-auto ${index === currentIndex ? "bg-green-600 w-8" : "bg-gray-300 hover:bg-gray-400"
                  }`}
                aria-label={(locale === "vi" ? "Trang " : "Page ") + (index + 1)}
              />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-8 sm:mt-12">
          <button
            onClick={() => navigate(`/product?locale=${locale}`)}
            className="bg-gradient-to-r cursor-pointer from-yellow-500 to-yellow-600 text-white px-8 py-3 rounded-full font-semibold hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
          >
            {t.ctaAll}
          </button>
        </div>
      </div>
    </section>
  );
}

export default ProductCategories;
