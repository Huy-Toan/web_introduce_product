import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ROTATE_MS = 5000;
const SWIPE_THRESHOLD = 50; // px

const DEFAULT_BANNERS = [
  { id: "default-1", content: "PREMIUM VIETNAMESE FRUITS", image_url: "/banner.jpg" },
  { id: "default-1", content: "PREMIUM VIETNAMESE FRUITS ảnh 1", image_url: "/banner.jpg" },
  { id: "default-1", content: "PREMIUM VIETNAMESE FRUITS ảnh 2", image_url: "/banner.jpg" },
];

export default function Banner() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  // refs cho swipe/drag
  const trackRef = useRef(null);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const dragging = useRef(false);

  // fetch banners
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/banners");
        const data = await res.json();
        if (!mounted) return;
        if (res.ok && data.ok !== false) {
          const list = data.items || data.banners || [];
          setBanners(list.length ? list : DEFAULT_BANNERS);
        } else {
          setBanners(DEFAULT_BANNERS);
          console.error(data.error || "Không lấy được banner");
        }
      } catch (err) {
        console.error("Lỗi fetch banner:", err);
        if (mounted) setBanners(DEFAULT_BANNERS);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  // auto-rotate
  useEffect(() => {
    if (banners.length <= 1) return;
    if (paused) return;
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % banners.length);
    }, ROTATE_MS);
    return () => clearInterval(t);
  }, [banners.length, paused]);

  // helpers
  const goTo = (i) => setIdx((i + banners.length) % banners.length);
  const prev = () => goTo(idx - 1);
  const next = () => goTo(idx + 1);

  // swipe handlers
  const onTouchStart = (e) => {
    setPaused(true);
    dragging.current = true;
    touchStartX.current = e.touches ? e.touches[0].clientX : e.clientX;
    touchDeltaX.current = 0;
  };

  const onTouchMove = (e) => {
    if (!dragging.current) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    touchDeltaX.current = x - touchStartX.current;

    // translate track theo delta để có cảm giác kéo
    const track = trackRef.current;
    if (track) {
      const width = track.clientWidth; // width container
      // translate theo phần trăm (chỉ hiệu ứng, không đổi idx)
      const percent = (touchDeltaX.current / width) * 100;
      track.style.transition = "none";
      track.style.transform = `translateX(calc(${-idx * 100}% + ${percent}%))`;
    }
  };

  const endDrag = () => {
    if (!dragging.current) return;
    dragging.current = false;

    const delta = touchDeltaX.current;
    const track = trackRef.current;
    // reset style transition
    if (track) track.style.transition = "";

    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      delta < 0 ? next() : prev();
    } else {
      // snap back
      if (track) track.style.transform = `translateX(${-idx * 100}%)`;
    }
    touchDeltaX.current = 0;

    // resume auto-rotate sau 1s
    setTimeout(() => setPaused(false), 1000);
  };

  // keyboard arrows
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") { setPaused(true); prev(); }
      if (e.key === "ArrowRight") { setPaused(true); next(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, banners.length]);

  const current = useMemo(() => banners[idx] || DEFAULT_BANNERS[0], [banners, idx]);

  if (loading) {
    return (
      <section className="min-h-[70vh] md:min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Đang tải banner...</p>
      </section>
    );
  }

  return (
    <section
      className="relative text-white min-h-[70vh] md:min-h-screen overflow-hidden"
      aria-label="Banner"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Track: flex các slide, trượt bằng translateX */}
      <div
        ref={trackRef}
        className="h-full w-full flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(${-idx * 100}%)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={endDrag}
        onMouseDown={(e) => { e.preventDefault(); onTouchStart(e); }}
        onMouseMove={(e) => dragging.current && onTouchMove(e)}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
      >
        {banners.map((b, i) => (
          <Slide key={b.id ?? i} banner={b} />
        ))}
      </div>

      {/* Prev / Next buttons (desktop) */}
      {banners.length > 1 && (
        <>
          <button
            aria-label="Prev"
            onClick={() => { setPaused(true); prev(); }}
            className="hidden md:flex absolute left-4 top-1/2 cursor-pointer -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur text-white items-center justify-center"
          >
            <ChevronLeft />
          </button>
          <button
            aria-label="Next"
            onClick={() => { setPaused(true); next(); }}
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer h-10 w-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur text-white items-center justify-center"
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
              aria-label={`Chuyển đến banner ${i + 1}`}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                i === idx ? "w-7 bg-white" : "w-2.5 bg-white/60 hover:bg-white"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function Slide({ banner }) {
  return (
    <div
      className="relative w-full flex-shrink-0 bg-cover bg-center bg-no-repeat min-h-[70vh] md:min-h-screen"
      style={{ backgroundImage: banner.image_url ? `url(${banner.image_url})` : "none" }}
    >
      <div className="absolute inset-0 bg-black/30 md:bg-black/40" />
      <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center z-10">
        <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-4 sm:p-6 md:p-10 lg:p-12 shadow-2xl w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl mx-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight !text-white">
            {banner.content || "Welcome to our store"}
          </h1>
          <div className="flex justify-center">
            <a
              href="/contact"
              className="bg-white cursor-pointer text-green-800 px-5 sm:px-6 md:px-8 py-2.5 md:py-3 rounded-lg font-semibold transition-transform duration-300 hover:scale-105"
            >
              Contact now →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
