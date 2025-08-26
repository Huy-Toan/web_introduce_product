// src/components/ProductHeaderBanner.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const SUPPORTED = ["vi", "en"];
const DEFAULT_LOCALE = "vi";
const getLocale = (s) =>
  new URLSearchParams(s).get("locale")?.toLowerCase() || "";

export default function ProductHeaderBanner() {
  const navigate = useNavigate();
  const location = useLocation();

  // ===== Locale =====
  const [locale, setLocale] = useState(() => {
    const urlLc = getLocale(window.location.search);
    const lsLc = (localStorage.getItem("locale") || "").toLowerCase();
    return SUPPORTED.includes(urlLc)
      ? urlLc
      : SUPPORTED.includes(lsLc)
        ? lsLc
        : DEFAULT_LOCALE;
  });
  useEffect(() => {
    const urlLc = getLocale(location.search);
    if (SUPPORTED.includes(urlLc) && urlLc !== locale) {
      setLocale(urlLc);
      localStorage.setItem("locale", urlLc);
      try { document.documentElement.lang = urlLc; } catch { }
    }
  }, [location.search, locale]);
  const qs = useMemo(() => `?locale=${encodeURIComponent(locale)}`, [locale]);

  // ===== Data =====
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const r = await fetch(`/api/parent_categories${qs}`);
        const j = await r.json();
        if (alive) setParents(j?.parents || []);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [qs]);

  const goHome = () => navigate("/" + qs);
  const goParent = (p) => navigate(`/product/${p.slug}${qs}`);

  const T = {
    title: locale === "vi" ? "SẢN PHẨM" : "SHOP",
    home: locale === "vi" ? "Trang chủ" : "Home",
    shop: locale === "vi" ? "Sản phẩm" : "Shop",
    productsTxt: locale === "vi" ? "Sản phẩm" : "Products",
  };

  const bannerImage = "/banner_header.jpg"; // background + fallback category image

  // ===== Mobile carousel =====
  const scrollerRef = useRef(null);
  const scrollByCards = (dir = 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const delta = el.clientWidth * 0.9 * dir; // lướt ~2 cards
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <section className="relative">
      {/* ===== Banner (không overlap) ===== */}
      <div className="relative h-48 md:h-64">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${bannerImage}')` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-black/25" aria-hidden />

        {/* Title + Breadcrumb */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-wide">
            {T.title}
          </h1>
          <div className="mt-2 flex items-center justify-center gap-2 text-gray-200 text-sm">
            <button onClick={goHome} className="hover:text-white">{T.home}</button>
            <span>/</span>
            <span className="font-semibold text-yellow-300">{T.shop}</span>
          </div>
        </div>
      </div>

      {/* ===== Categories section: NẰM HẲN DƯỚI banner ===== */}
      {/* Mobile: mt-6 (cách banner rõ ràng) | Desktop: -mt-12 (kéo nhẹ lên cho cảm giác nổi) */}
      <div className="relative z-20 mt-6 md:-mt-[72px] lg:-mt-[40px]">
        <div className="container mx-auto max-w-7xl px-4">
          {/* Desktop / Tablet: lưới tự do */}
          <div className="hidden md:flex flex-wrap justify-center gap-8">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-28 h-28 rounded-full bg-gray-200 animate-pulse" />
              ))
              : parents.map((p) => {
                const imgSrc = p.image_url || bannerImage;
                return (
                  <button
                    key={p.id}
                    onClick={() => goParent(p)}
                    className="group w-32 flex flex-col items-center focus:outline-none"
                    title={p.name}
                  >
                    <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white bg-white shadow-md transition-transform group-hover:scale-105">
                      <img
                        src={imgSrc}
                        alt={p.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <span className="mt-3 text-sm font-medium text-gray-900 text-center group-hover:text-green-700">
                      {p.name}
                    </span>
                    {p.product_count != null && (
                      <span className="text-xs text-gray-500">
                        {p.product_count} {T.productsTxt}
                      </span>
                    )}
                  </button>
                );
              })}
          </div>

          {/* Mobile: carousel hiển thị đúng 2 ô/khung nhìn + mũi tên */}
          <div className="relative md:hidden">
            {/* arrows */}
            <button
              aria-label="Prev"
              onClick={() => scrollByCards(-1)}
              className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 grid place-items-center w-8 h-8 rounded-full bg-white/90 shadow hover:bg-white"
            >
              ‹
            </button>
            <button
              aria-label="Next"
              onClick={() => scrollByCards(1)}
              className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 grid place-items-center w-8 h-8 rounded-full bg-white/90 shadow hover:bg-white"
            >
              ›
            </button>

            <div
              ref={scrollerRef}
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-4 scroll-smooth"
            >
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="shrink-0 basis-1/2 max-w-1/2 snap-center px-2">
                    <div className="w-full aspect-square rounded-full bg-gray-200 animate-pulse" />
                  </div>
                ))
                : parents.map((p) => {
                  const imgSrc = p.image_url || bannerImage;
                  return (
                    <div key={p.id} className="shrink-0 basis-1/2 max-w-1/2 snap-center px-2">
                      <button
                        onClick={() => goParent(p)}
                        className="group w-full flex flex-col items-center focus:outline-none"
                        title={p.name}
                      >
                        <div className="w-full aspect-square rounded-full overflow-hidden border-4 border-white bg-white shadow-md transition-transform group-hover:scale-105">
                          <img
                            src={imgSrc}
                            alt={p.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <span className="mt-2 text-sm font-medium text-gray-900 text-center group-hover:text-green-700">
                          {p.name}
                        </span>
                        {p.product_count != null && (
                          <span className="text-xs text-gray-500">
                            {p.product_count} {T.productsTxt}
                          </span>
                        )}
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
