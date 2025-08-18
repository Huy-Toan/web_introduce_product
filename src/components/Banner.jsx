import { useEffect, useState, useMemo } from "react";

const ROTATE_MS = 3000;

const DEFAULT_BANNERS = [
  {
    id: "default-1",
    content: "PREMIUM VIETNAMESE FRUITS",
    image_url: "/banner.jpg", // đổi sang ảnh mặc định của bạn nếu khác path
  },
];

export default function Banner() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);

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

  // auto-rotate mỗi 3s
  useEffect(() => {
    if (banners.length <= 1) return; // 1 banner thì không cần chạy
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % banners.length);
    }, ROTATE_MS);
    return () => clearInterval(t);
  }, [banners.length]);

  // banner hiện tại
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
      className="
        relative text-white
        bg-cover bg-center bg-no-repeat
        min-h-[70vh] md:min-h-screen
        flex
      "
      style={{
        backgroundImage: current.image_url ? `url(${current.image_url})` : "none",
      }}
      aria-label="Banner"
    >
      {/* overlay tối để chữ dễ đọc */}
      <div className="absolute inset-0 bg-black/30 md:bg-black/40" />

      {/* nội dung */}
      <div className="container mx-auto px-4 relative z-10 flex-1 flex flex-col justify-center items-center text-center">
        <div
          key={current.id ?? idx}
          className="bg-black/30 backdrop-blur-sm rounded-2xl p-4 sm:p-6 md:p-10 lg:p-12 shadow-2xl w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl mx-4
                     transition-opacity duration-500 opacity-100"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight !text-white">
            {current.content || "Welcome to our store"}
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

        {/* dots điều hướng */}
        {banners.length > 1 && (
          <div className="flex items-center gap-2 mt-6">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`Chuyển đến banner ${i + 1}`}
                className={`h-2.5 w-2.5 rounded-full transition-all
                  ${i === idx ? "w-6 bg-white" : "bg-white/60 hover:bg-white"}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
