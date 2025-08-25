// src/components/Banner.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ROTATE_MS = 5000;
const SWIPE_THRESHOLD = 50;

const SUPPORTED = ["vi", "en"];
const DEFAULT_LOCALE = "vi";

function pickLocale(propLocale, search) {
  const urlLc = new URLSearchParams(search).get("locale")?.toLowerCase() || "";
  const lsLc = (localStorage.getItem("locale") || "").toLowerCase();
  const fromProp = (propLocale || "").toLowerCase();
  if (SUPPORTED.includes(fromProp)) return fromProp;
  if (SUPPORTED.includes(urlLc)) return urlLc;
  if (SUPPORTED.includes(lsLc)) return lsLc;
  return DEFAULT_LOCALE;
}

const DEFAULTS = {
  vi: [
    { id: "def-vi-1", content: "NÔNG SẢN VIỆT CHẤT LƯỢNG CAO", image_url: "/banner.jpg" },
    { id: "def-vi-2", content: "XUẤT KHẨU TOÀN CẦU • CHUẨN CHẤT LƯỢNG", image_url: "/banner_header.jpg" },
  ],
  en: [
    { id: "def-en-1", content: "PREMIUM VIETNAMESE FRUITS", image_url: "/banner.jpg" },
    { id: "def-en-2", content: "GLOBAL EXPORT • QUALITY FIRST", image_url: "/banner_header.jpg" },
  ],
};

export default function Banner({ locale: localeProp }) {
  const navigate = useNavigate();
  const location = useLocation();

  const locale = useMemo(
    () => pickLocale(localeProp, location.search),
    [localeProp, location.search]
  );

  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  // refs cho swipe/drag
  const trackRef = useRef(null);
  const viewportRef = useRef(null);
  const startX = useRef(0);
  const deltaX = useRef(0);
  const dragging = useRef(false);

  // đồng bộ <html lang> + localStorage
  useEffect(() => {
    try {
      document.documentElement.lang = locale;
      localStorage.setItem("locale", locale);
    } catch { }
  }, [locale]);

  // fetch banners theo locale
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/banners?locale=${encodeURIComponent(locale)}`, {
          cache: "no-store",
          signal: ac.signal,
        });
        const data = await res.json();
        const list = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.banners)
            ? data.banners
            : [];
        setBanners(list.length ? list : DEFAULTS[locale]);
      } catch (err) {
        console.error("Lỗi fetch banner:", err);
        setBanners(DEFAULTS[locale]);
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [locale]);

  // auto-rotate
  useEffect(() => {
    if (banners.length <= 1 || paused) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % banners.length), ROTATE_MS);
    return () => clearInterval(t);
  }, [banners.length, paused]);

  const goTo = (i) => setIdx((i + banners.length) % banners.length);
  const prev = () => goTo(idx - 1);
  const next = () => goTo(idx + 1);

  // swipe handlers
  const onDragStart = (clientX) => {
    setPaused(true);
    dragging.current = true;
    startX.current = clientX;
    deltaX.current = 0;
  };
  const onDragMove = (clientX) => {
    if (!dragging.current) return;
    deltaX.current = clientX - startX.current;

    const track = trackRef.current;
    const viewportW = viewportRef.current?.offsetWidth || 1;
    const percent = (deltaX.current / viewportW) * 100;

    if (track) {
      track.style.transition = "none";
      track.style.transform = `translateX(calc(${-idx * 100}% + ${percent}%))`;
    }
  };
  const onDragEnd = () => {
    if (!dragging.current) return;
    dragging.current = false;

    const track = trackRef.current;
    if (track) track.style.transition = "";

    if (Math.abs(deltaX.current) > SWIPE_THRESHOLD) {
      deltaX.current < 0 ? next() : prev();
    } else {
      if (track) track.style.transform = `translateX(${-idx * 100}%)`;
    }

    deltaX.current = 0;
    setTimeout(() => setPaused(false), 800);
  };

  // arrows key
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") { setPaused(true); prev(); }
      if (e.key === "ArrowRight") { setPaused(true); next(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, banners.length]);

  const tCTA = locale === "vi" ? "Liên hệ ngay →" : "Contact now →";
  const contactHref = `/contact?locale=${encodeURIComponent(locale)}`;

  if (loading) {
    return (
      <section className="min-h-[70vh] md:min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </section>
    );
  }

  return (
    <section
      ref={viewportRef}
      className="relative text-white min-h-[70vh] md:min-h-screen overflow-hidden"
      aria-label="Banner"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Track */}
      <div
        ref={trackRef}
        className="h-full w-full flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(${-idx * 100}%)` }}
        onTouchStart={(e) => onDragStart(e.touches[0].clientX)}
        onTouchMove={(e) => onDragMove(e.touches[0].clientX)}
        onTouchEnd={onDragEnd}
        onMouseDown={(e) => { e.preventDefault(); onDragStart(e.clientX); }}
        onMouseMove={(e) => dragging.current && onDragMove(e.clientX)}
        onMouseUp={onDragEnd}
        onMouseLeave={onDragEnd}
      >
        {banners.map((b, i) => (
          <Slide key={b.id ?? i} banner={b} />
        ))}
      </div>

      {/* Prev / Next (desktop) */}
      {banners.length > 1 && (
        <>
          <button
            aria-label="Prev"
            onClick={() => { setPaused(true); prev(); }}
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur text-white items-center justify-center"
          >
            <ChevronLeft />
          </button>
          <button
            aria-label="Next"
            onClick={() => { setPaused(true); next(); }}
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur text-white items-center justify-center"
          >
            <ChevronRight />
          </button>
        </>
      )}

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => { setPaused(true); setIdx(i); }}
              aria-label={`Slide ${i + 1}`}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${i === idx ? "w-7 bg-white" : "w-2.5 bg-white/60 hover:bg-white"}`}
            />
          ))}
        </div>
      )}

      {/* CTA overlay — luôn cố định, không nhảy theo slide */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="pointer-events-auto bg-black/35 backdrop-blur-sm rounded-2xl p-4 sm:p-6 md:p-10 lg:p-12 shadow-2xl w-[92%] max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl">
          <h1 className="text-2x sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight !text-white text-center line-clamp-3">
            {(banners[idx]?.content || "").trim() || (locale === "vi" ? "Chào mừng bạn" : "Welcome")}
          </h1>
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => navigate(contactHref)}
              className="bg-white text-green-800 px-5 sm:px-6 md:px-8 py-2.5 md:py-3 rounded-lg font-semibold transition-transform duration-300 hover:scale-105"
            >
              {tCTA}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Slide({ banner }) {
  const bg = banner.image_url ? `url(${banner.image_url})` : "none";
  return (
    <div
      className="relative w-full flex-shrink-0 bg-cover bg-center bg-no-repeat min-h-[70vh] md:min-h-screen"
      style={{ backgroundImage: bg }}
    >
      {/* overlay gradient để nội dung nổi hơn */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40" />
    </div>
  );
}
