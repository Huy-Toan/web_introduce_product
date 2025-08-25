// src/components/Cer_PartnerSection.jsx
import { useEffect, useState, useRef, useMemo } from "react";
import { useLocation } from "react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SUPPORTED = ["vi", "en"];
const DEFAULT_LOCALE = "vi";

function resolveLocale(propLocale, search) {
  const fromProp = (propLocale || "").toLowerCase();
  const urlLc =
    new URLSearchParams(search).get("locale")?.toLowerCase() || "";
  const lsLc = (localStorage.getItem("locale") || "").toLowerCase();

  if (SUPPORTED.includes(fromProp)) return fromProp;
  if (SUPPORTED.includes(urlLc)) return urlLc;
  if (SUPPORTED.includes(lsLc)) return lsLc;
  return DEFAULT_LOCALE;
}

function CerLogoCard({ item }) {
  const defaultImg = "/banner.jpg";
  return (
    <div className="flex items-center justify-center rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition w-40 h-40">
      <img
        src={item.image_url || defaultImg}
        alt={item.name || "logo"}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = defaultImg;
        }}
      />
    </div>
  );
}

export default function CerPartnersSection({ locale: localeProp }) {
  const location = useLocation();
  const locale = useMemo(
    () => resolveLocale(localeProp, location.search),
    [localeProp, location.search]
  );

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [perSlide, setPerSlide] = useState(4); // cập nhật theo resize bên dưới
  const scrollRef = useRef(null);

  // drag state
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  // set html lang + nhớ locale
  useEffect(() => {
    try {
      document.documentElement.lang = locale;
      localStorage.setItem("locale", locale);
    } catch { }
  }, [locale]);

  // responsive: tính itemsPerSlide theo width
  useEffect(() => {
    const calc = () => {
      if (typeof window === "undefined") return;
      setPerSlide(window.innerWidth < 640 ? 2 : 4);
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  // fetch list theo locale
  useEffect(() => {
    const ac = new AbortController();
    const fetchAll = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/cer-partners?locale=${encodeURIComponent(locale)}`,
          { signal: ac.signal }
        );
        const data = await res.json();
        if (!res.ok || data.ok === false)
          throw new Error(data.error || "Failed to load cp");
        setItems(Array.isArray(data.items) ? data.items : []);
      } catch (e) {
        console.error("Lỗi khi tải certifications_partners:", e);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
    return () => ac.abort();
  }, [locale]);

  // cập nhật dot khi scroll
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft: sl, offsetWidth } = scrollRef.current;
    const index = Math.max(
      0,
      Math.min(Math.round(sl / offsetWidth), Math.ceil(items.length / perSlide) - 1)
    );
    setActiveIndex(index);
  };

  // kéo chuột để scroll
  useEffect(() => {
    const slider = scrollRef.current;
    if (!slider) return;

    const handleMouseDown = (e) => {
      isDown.current = true;
      slider.classList.add("cursor-grabbing");
      startX.current = e.pageX - slider.offsetLeft;
      scrollLeft.current = slider.scrollLeft;
    };
    const handleMouseLeave = () => {
      isDown.current = false;
      slider.classList.remove("cursor-grabbing");
    };
    const handleMouseUp = () => {
      isDown.current = false;
      slider.classList.remove("cursor-grabbing");
    };
    const handleMouseMove = (e) => {
      if (!isDown.current) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX.current) * 1;
      slider.scrollLeft = scrollLeft.current - walk;
    };

    slider.addEventListener("mousedown", handleMouseDown);
    slider.addEventListener("mouseleave", handleMouseLeave);
    slider.addEventListener("mouseup", handleMouseUp);
    slider.addEventListener("mousemove", handleMouseMove);

    return () => {
      slider.removeEventListener("mousedown", handleMouseDown);
      slider.removeEventListener("mouseleave", handleMouseLeave);
      slider.removeEventListener("mouseup", handleMouseUp);
      slider.removeEventListener("mousemove", handleMouseMove);
    };
  }, [items]);

  const scrollToIndex = (index) => {
    if (!scrollRef.current) return;
    const { offsetWidth } = scrollRef.current;
    scrollRef.current.scrollTo({
      left: offsetWidth * index,
      behavior: "smooth",
    });
  };

  const scrollBy = (offset) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const totalSlides = Math.ceil(items.length / perSlide);

  const t = useMemo(
    () =>
      locale === "vi"
        ? {
          title: "Chứng nhận & Đối tác",
          noData: "Không có dữ liệu để hiển thị.",
          prev: "Trước",
          next: "Sau",
        }
        : {
          title: "Certifications & Partners",
          noData: "No data to display.",
          prev: "Prev",
          next: "Next",
        },
    [locale]
  );

  return (
    <section className="bg-gray-50 py-12 px-4 relative">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-yellow-600 text-center">
          {t.title}
        </h2>

        {loading ? (
          <div className="mt-6 flex gap-4 overflow-x-auto no-scrollbar">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="w-40 h-32 rounded-lg bg-gray-100 animate-pulse shrink-0"
              />
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="relative mt-6">
            {/* Scroll container */}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex justify-center gap-4 overflow-x-auto scroll-smooth no-scrollbar snap-x snap-mandatory cursor-grab active:cursor-grabbing px-4"
            >
              {items.map((cp) => (
                <div
                  key={cp.id}
                  className="snap-start shrink-0 w-1/2 sm:w-1/4 flex justify-center"
                >
                  <CerLogoCard item={cp} />
                </div>
              ))}
            </div>

            {/* Buttons desktop */}
            <button
              type="button"
              onClick={() => scrollBy(-300)}
              className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 bg-white rounded-full cursor-pointer p-2 shadow hover:bg-yellow-50 transition"
              aria-label={t.prev}
              title={t.prev}
            >
              <ChevronLeft className="w-6 h-6 text-yellow-600" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(300)}
              className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 cursor-pointer shadow hover:bg-yellow-50 transition"
              aria-label={t.next}
              title={t.next}
            >
              <ChevronRight className="w-6 h-6 text-yellow-600" />
            </button>

            {/* Dot indicator */}
            <div className="flex justify-center mt-6 gap-2">
              {Array.from({ length: totalSlides }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollToIndex(i)}
                  className={`w-3 h-3 rounded-full transition ${i === activeIndex
                      ? "bg-yellow-600"
                      : "bg-gray-300 hover:bg-gray-400"
                    }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center mt-6">{t.noData}</p>
        )}
      </div>
    </section>
  );
}
