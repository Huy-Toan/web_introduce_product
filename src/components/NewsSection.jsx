import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { NewsCard } from "./NewsCard";

export default function NewsSection() {
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  // drag state
  const isDown = useRef(false);
  const startX = useRef(0);
  const startLeft = useRef(0);

  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        const res = await fetch("/api/news");
        const data = await res.json();
        setNewsData(data.news || []);
      } catch (err) {
        console.error("Failed to load news data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNewsData();
  }, []);

  // items per slide: mobile 1, desktop (lg) 2
  const getItemsPerSlide = () =>
    window.matchMedia("(min-width: 1024px)").matches ? 2 : 1;

  const itemsPerSlide = getItemsPerSlide();
  const totalSlides = Math.ceil((newsData?.length || 0) / itemsPerSlide);

  // update active dot on scroll
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, offsetWidth } = scrollRef.current;
    setActiveIndex(Math.round(scrollLeft / offsetWidth));
  };

  // recalc index on resize (để dot đúng khi đổi breakpoint)
  useEffect(() => {
    const onResize = () => handleScroll();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const scrollToIndex = (idx) => {
    if (!scrollRef.current) return;
    const { offsetWidth } = scrollRef.current;
    scrollRef.current.scrollTo({ left: offsetWidth * idx, behavior: "smooth" });
  };

  const scrollByViewport = (dir = 1) => {
    if (!scrollRef.current) return;
    const { offsetWidth } = scrollRef.current;
    scrollRef.current.scrollBy({ left: dir * offsetWidth, behavior: "smooth" });
  };

  // mouse drag (desktop)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const down = (e) => {
      isDown.current = true;
      el.classList.add("cursor-grabbing");
      startX.current = e.pageX - el.offsetLeft;
      startLeft.current = el.scrollLeft;
    };
    const leave = () => {
      isDown.current = false;
      el.classList.remove("cursor-grabbing");
    };
    const up = () => {
      isDown.current = false;
      el.classList.remove("cursor-grabbing");
    };
    const move = (e) => {
      if (!isDown.current) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX.current) * 1; // speed
      el.scrollLeft = startLeft.current - walk;
    };

    el.addEventListener("mousedown", down);
    el.addEventListener("mouseleave", leave);
    el.addEventListener("mouseup", up);
    el.addEventListener("mousemove", move);
    return () => {
      el.removeEventListener("mousedown", down);
      el.removeEventListener("mouseleave", leave);
      el.removeEventListener("mouseup", up);
      el.removeEventListener("mousemove", move);
    };
  }, [newsData]);

  const handleNewsSelect = (item) => {
    navigate(`/news/news-detail/${item.slug}`);
  };

  return (
    <section className="bg-gray-70 py-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-10">
          <h2 className="text-4xl lg:text-5xl font-bold !text-yellow-600 tracking-wider">
            NEWS
          </h2>
        </div>

        {loading ? (
          <div className="text-center">
            <div className="h-10 w-10 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : newsData.length === 0 ? (
          <p className="text-center text-gray-500">Không có tin nào.</p>
        ) : (
          <div className="relative">
            {/* track */}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth cursor-grab active:cursor-grabbing px-1"
            >
              {/* mỗi item: mobile full width, desktop 1/2 width (hiện 2 cái/khung) */}
              {newsData.map((item) => (
                <div
                  key={item.id}
                  className="shrink-0 w-full lg:w-1/2 snap-start"
                >
                  <NewsCard news={item} onClick={() => handleNewsSelect(item)} />
                </div>
              ))}
            </div>

            {/* buttons: chỉ hiện desktop */}
            <button
              type="button"
              onClick={() => scrollByViewport(-1)}
              className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 bg-white cursor-pointer rounded-full p-2 shadow hover:bg-yellow-50 transition"
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6 text-yellow-600" />
            </button>
            <button
              type="button"
              onClick={() => scrollByViewport(1)}
              className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 bg-white cursor-pointer rounded-full p-2 shadow hover:bg-yellow-50 transition"
              aria-label="Next"
            >
              <ChevronRight className="w-6 h-6 text-yellow-600" />
            </button>

            {/* dots (optional, gọn) */}
            <div className="flex justify-center mt-6 gap-2">
              {Array.from({ length: totalSlides }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollToIndex(i)}
                  className={`w-2.5 h-2.5 rounded-full transition ${
                    i === activeIndex ? "bg-yellow-600" : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Trang ${i + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
