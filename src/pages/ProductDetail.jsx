// src/pages/ProductDetailPage.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import TopNavigation from "../components/Navigation";
import MarkdownOnly from "../components/MarkdownOnly";
import Footer from "../components/Footer";
import Breadcrumbs from "../components/Breadcrumbs";
import { trackViewItem, trackSelectItem, trackPageView } from "../lib/ga";


const SUPPORTED = ["vi", "en"];
const DEFAULT_LOCALE = "vi";
const getLocaleFromSearch = (search) =>
  new URLSearchParams(search).get("locale")?.toLowerCase() || "";

/* ================= Helpers for images & cover ================= */
// Giữ lại cho fallback rất cũ (images_json key tương đối)
function normalizeImages(input) {
  let arr = [];
  if (!input) return [];
  if (Array.isArray(input)) arr = input;
  else {
    try {
      const j = JSON.parse(input);
      if (Array.isArray(j)) arr = j;
    } catch {
      arr = [];
    }
  }
  const out = arr
    .map((it, i) => {
      if (!it) return null;
      if (typeof it === "string") {
        return { url: it, is_primary: i === 0 ? 1 : 0, sort_order: i };
      }
      if (typeof it === "object" && it.url) {
        return {
          url: String(it.url).trim(),
          is_primary: it.is_primary ? 1 : 0,
          sort_order: Number.isFinite(it.sort_order) ? it.sort_order : i,
        };
      }
      return null;
    })
    .filter(Boolean)
    .sort((a, b) => (a?.sort_order ?? 0) - (b?.sort_order ?? 0));

  if (out.length) {
    const hasPrimary = out.some((x) => x.is_primary === 1);
    if (!hasPrimary) out[0].is_primary = 1;
    out.forEach((x, i) => (x.sort_order = i));
  }
  return out;
}

// Ưu tiên cover_image (URL tuyệt đối do BE build sẵn) -> image_url (tuyệt đối) -> images[0] -> fallback images_json cũ
function coverFromProduct(p) {
  if (p?.cover_image) return p.cover_image;
  if (p?.image_url) return p.image_url;
  if (Array.isArray(p?.images) && p.images.length) return p.images[0];
  const imgs = normalizeImages(p?.images_json);
  if (imgs.length) {
    const primary = imgs.find((x) => x.is_primary === 1) || imgs[0];
    return primary?.url || "";
  }
  return "";
}

/* ================= Zoomable main image with nav buttons ================= */
function ZoomableImage({ src, alt, onPrev, onNext, onOpenLightbox }) {
  const [zoomOn, setZoomOn] = useState(false);
  const [bgPos, setBgPos] = useState("center");

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setBgPos(`${x}% ${y}%`);
  };

  return (
    <div className="relative w-full h-full">
      <div
        className="
          w-full h-full bg-white overflow-hidden
          cursor-zoom-in rounded-md border border-gray-200
        "
        style={{
          backgroundImage: `url(${src})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: zoomOn ? bgPos : "center",
          backgroundSize: zoomOn ? "200%" : "contain",
          transition: "background-size 150ms ease",
        }}
        onMouseEnter={() => setZoomOn(true)}
        onMouseLeave={() => {
          setZoomOn(false);
          setBgPos("center");
        }}
        onMouseMove={handleMove}
        onClick={() => onOpenLightbox?.()}
        aria-label={alt}
        role="img"
      >
        {/* Hidden <img> just to preserve intrinsic size & fallback */}
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-contain opacity-0"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/banner.jpg";
          }}
        />
      </div>

      {/* Nav buttons on top of the main image */}
      {onPrev && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow rounded-full w-9 h-9 flex items-center justify-center"
          aria-label="Previous image"
          title="Previous"
        >
          ‹
        </button>
      )}
      {onNext && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow rounded-full w-9 h-9 flex items-center justify-center"
          aria-label="Next image"
          title="Next"
        >
          ›
        </button>
      )}
    </div>
  );
}

/* ================= Lightbox toàn màn hình ================= */
function Lightbox({ open, images, index, onClose, onPrev, onNext, title }) {
  const overlayRef = useRef(null);

  // ESC + ←/→
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowLeft") onPrev?.();
      if (e.key === "ArrowRight") onNext?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, onPrev, onNext]);

  // Swipe (mobile)
  useEffect(() => {
    if (!open) return;
    const el = overlayRef.current;
    if (!el) return;
    let startX = 0;
    const onTouchStart = (e) => (startX = e.touches[0].clientX);
    const onTouchEnd = (e) => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) dx > 0 ? onPrev?.() : onNext?.();
    };
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [open, onPrev, onNext]);

  if (!open) return null;

  const imgs = images || [];
  const curr = imgs[index] || {};
  const src = curr.url || "";

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[1000] bg-black/90 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-xl"
        aria-label="Close"
        title="Close"
      >
        ✕
      </button>

      {/* Prev / Next */}
      {imgs.length > 1 && (
        <>
          <button
            onClick={onPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-2xl flex items-center justify-center"
            aria-label="Previous"
            title="Previous"
          >
            ‹
          </button>
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-2xl flex items-center justify-center"
            aria-label="Next"
            title="Next"
          >
            ›
          </button>
        </>
      )}

      {/* Ảnh */}
      {/* Ảnh: khung cố định để mọi ảnh cùng kích thước */}
      <div className="w-[min(95vw,1100px)] h-[85vh] max-h-[85vh] flex items-center justify-center">
        <img
          src={src || "/banner.jpg"}
          alt={title || "image"}
          className="w-full h-full object-contain"
          loading="eager"
          onError={(e) => (e.currentTarget.src = "/banner.jpg")}
        />
      </div>
      {!!title && (
        <div className="mt-2 text-center text-white/80 text-sm line-clamp-1">
          {title}
        </div>
      )}


      {/* Counter */}
      {imgs.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm">
          {index + 1} / {imgs.length}
        </div>
      )}
    </div>
  );
}

/* ======================= Page ======================= */
export default function ProductDetailPage() {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const trackRef = useRef(null);

  const [locale, setLocale] = useState(() => {
    const urlLc = getLocaleFromSearch(window.location.search);
    const lsLc = (localStorage.getItem("locale") || "").toLowerCase();
    return SUPPORTED.includes(urlLc)
      ? urlLc
      : SUPPORTED.includes(lsLc)
        ? lsLc
        : DEFAULT_LOCALE;
  });

  useEffect(() => {
    const urlLc = getLocaleFromSearch(location.search);
    if (SUPPORTED.includes(urlLc) && urlLc !== locale) {
      setLocale(urlLc);
      localStorage.setItem("locale", urlLc);
      try {
        document.documentElement.lang = urlLc;
      } catch { }
    }
  }, [location.search, locale]);

  const qs = `?locale=${encodeURIComponent(locale)}`;

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [relLoading, setRelLoading] = useState(false);
  const [error, setError] = useState("");

  // Gallery state
  const [gallery, setGallery] = useState([]); // [{url,is_primary,sort_order}]
  const [activeIdx, setActiveIdx] = useState(0);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const fetchParentBySub = async (subSlug, signal) => {
    let res = await fetch(
      `/api/sub_categories/${encodeURIComponent(subSlug)}${qs}`,
      { signal }
    );
    if (!res.ok) {
      res = await fetch(
        `/api/subcategories/${encodeURIComponent(subSlug)}${qs}`,
        { signal }
      );
      if (!res.ok) return null;
    }
    const data = await res.json();
    const sub = data.subcategory || data;
    return {
      parent_slug: sub.parent_slug || sub.parent?.slug || null,
      parent_name: sub.parent_name || sub.parent?.name || null,
    };
  };

  const scrollRelated = (dir = 1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  };

  const t = {
    product: locale === "vi" ? "Sản phẩm" : "Products",
    detail: locale === "vi" ? "Chi tiết" : "Details",
    notFound: locale === "vi" ? "Không tìm thấy sản phẩm" : "Product not found",
    loading: locale === "vi" ? "Đang tải..." : "Loading...",
    content: locale === "vi" ? "Nội dung" : "Content",
    seeIn: (name) =>
      locale === "vi" ? `Xem sản phẩm trong ${name}` : `See products in ${name}`,
    relatedSameSub: (name) =>
      locale === "vi" ? `Sản phẩm cùng loại: ${name}` : `More from: ${name}`,
    relatedUnderParent: (name) =>
      locale === "vi" ? `Sản phẩm thuộc: ${name}` : `Products under: ${name}`,
    relatedMaybe: locale === "vi" ? "Có thể bạn cũng thích" : "You might also like",
    noRelated: locale === "vi" ? "Chưa có sản phẩm liên quan." : "No related products.",
    prev: locale === "vi" ? "Trước" : "Prev",
    next: locale === "vi" ? "Sau" : "Next",
    views: locale === "vi" ? "lượt xem" : "views",
  };

  const items = [
    { label: t.product, to: `/product${qs}` },
    ...(product?.parent_name && product?.parent_slug
      ? [
        {
          label: product.parent_name,
          to: `/product/${encodeURIComponent(product.parent_slug)}${qs}`,
        },
      ]
      : []),
    ...(product?.subcategory_name && product?.subcategory_slug
      ? [
        {
          label: product.subcategory_name,
          to: `/product/${encodeURIComponent(product.parent_slug)}/${encodeURIComponent(
            product.subcategory_slug
          )}${qs}`,
        },
      ]
      : []),
    { label: product?.title || t.detail },
  ];

  // Ảnh chính theo gallery
  const imageSrc = useMemo(() => {
    const g = gallery;
    if (g && g.length && g[activeIdx]?.url) return g[activeIdx].url;
    const cov = coverFromProduct(product || {});
    return cov || "/banner.jpg";
  }, [gallery, activeIdx, product]);

  // ===== Helpers resolve & fetch =====
  const isNumeric = (s) => /^\d+$/.test(String(s || "").trim());

  const fetchBy = async (key, lc, signal) => {
    const url = `/api/products/${encodeURIComponent(key)}?locale=${lc}`;
    const r = await fetch(url, { cache: "no-store", signal });
    if (!r.ok) return null;
    const d = await r.json();
    return d?.product || null;
  };

  // Bump views best-effort + chống trùng trong phiên (BE là POST)
  const bumpViews = async (productId) => {
    if (!productId) return;
    try {
      const key = `product:viewed:${productId}`;
      if (sessionStorage.getItem(key)) return;

      const r = await fetch(`/api/products/${encodeURIComponent(productId)}/view`, {
        method: "POST",
        cache: "no-store",
      });

      if (r.ok) {
        sessionStorage.setItem(key, "1");
        setProduct((prev) => (prev ? { ...prev, views: (prev.views || 0) + 1 } : prev));
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (!idOrSlug) return;
    const ac = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError("");

        let baseProduct = null;

        if (isNumeric(idOrSlug)) {
          baseProduct = await fetchBy(idOrSlug, locale, ac.signal);
        } else {
          baseProduct = await fetchBy(idOrSlug, locale, ac.signal);

          if (!baseProduct) {
            for (const lc of SUPPORTED) {
              if (lc === locale) continue;
              const p = await fetchBy(idOrSlug, lc, ac.signal);
              if (p) {
                baseProduct = await fetchBy(p.id, locale, ac.signal);
                break;
              }
            }
          }
        }

        if (!baseProduct) throw new Error("Not found");

        // Chuẩn hoá URL sang slug của locale hiện tại (nhưng giữ ?locale)
        const routeSlug = decodeURIComponent(String(idOrSlug)).toLowerCase();
        const canonicalSlug = (
          baseProduct.slug || baseProduct.product_slug || baseProduct.id
        )
          ?.toString()
          .toLowerCase();

        if (canonicalSlug && canonicalSlug !== routeSlug) {
          navigate(
            `/product/product-detail/${encodeURIComponent(
              baseProduct.slug || baseProduct.product_slug || baseProduct.id
            )}${qs}`,
            { replace: true }
          );
          return;
        }

        // Setup product + gallery
        setProduct(baseProduct);

        // Ưu tiên dùng mảng URL tuyệt đối do BE trả về: product.images
        const imgs = (() => {
          if (Array.isArray(baseProduct.images) && baseProduct.images.length) {
            return baseProduct.images.map((u, i) => ({
              url: u,
              is_primary: i === 0 ? 1 : 0,
              sort_order: i,
            }));
          }
          const cov = baseProduct.cover_image || baseProduct.image_url || "";
          return cov ? [{ url: cov, is_primary: 1, sort_order: 0 }] : [];
        })();

        const idxPrimary = Math.max(
          0,
          imgs.findIndex((x) => x.is_primary === 1)
        );
        setGallery(imgs);
        setActiveIdx(idxPrimary >= 0 ? idxPrimary : 0);

        // Bổ sung parent nếu thiếu
        if (!baseProduct?.parent_slug && baseProduct?.subcategory_slug) {
          const parent = await fetchParentBySub(baseProduct.subcategory_slug, ac.signal);
          if (parent?.parent_slug) {
            setProduct((prev) => ({ ...prev, ...parent }));
          }
        }

        // Related theo sub/parent
        setRelLoading(true);
        let relatedList = [];

        const subSlug =
          baseProduct?.subcategory_slug ?? baseProduct?.subcategory?.slug ?? null;
        const parentSlug =
          baseProduct?.parent_slug ?? baseProduct?.parent?.slug ?? null;

        if (subSlug) {
          let relRes = await fetch(
            `/api/sub_categories/${encodeURIComponent(subSlug)}/products${qs}`,
            { cache: "no-store", signal: ac.signal }
          );
          if (!relRes.ok) {
            relRes = await fetch(
              `/api/subcategories/${encodeURIComponent(subSlug)}/products${qs}`,
              { cache: "no-store", signal: ac.signal }
            );
          }
          if (relRes.ok) {
            const relData = await relRes.json().catch(() => ({}));
            relatedList = Array.isArray(relData?.products) ? relData.products : [];
          }
        } else if (parentSlug) {
          const relRes = await fetch(
            `/api/parent_categories/${encodeURIComponent(parentSlug)}/products${qs}`,
            { cache: "no-store", signal: ac.signal }
          );
          if (relRes.ok) {
            const relData = await relRes.json().catch(() => ({}));
            relatedList = Array.isArray(relData?.products) ? relData.products : [];
          }
        }

        relatedList = relatedList.filter((x) => x.id !== baseProduct?.id).slice(0, 12);
        setRelated(relatedList);

        // Tăng views
        bumpViews(baseProduct.id || idOrSlug);
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error("Load product error:", e);
          setError(
            e.message || (locale === "vi" ? "Không tải được sản phẩm" : "Failed to load product")
          );
          setProduct(null);
          setRelated([]);
        }
      } finally {
        setRelLoading(false);
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [idOrSlug, locale]); // re-run khi đổi slug hoặc locale

  const handleCategoryClick = () => {
    const subSlug = product?.subcategory_slug ?? product?.subcategory?.slug ?? null;
    const parentSlug = product?.parent_slug ?? product?.parent?.slug ?? null;
    if (parentSlug && subSlug) {
      navigate(`/product/${encodeURIComponent(parentSlug)}/${encodeURIComponent(subSlug)}${qs}`);
    } else if (parentSlug) {
      navigate(`/product/${encodeURIComponent(parentSlug)}${qs}`);
    } else {
      navigate(`/product${qs}`);
    }
  };

  // Page view cho trang chi tiết SP: bắn SAU khi có product
  useEffect(() => {
    if (!product?.id) return;

    const path = location.pathname + location.search;
    const title = `${product.title} | ITXEASY`;

    document.title = title; // đổi tiêu đề trước

    // chống double-fire trong cùng phiên + đảm bảo title đã kịp cập nhật 1 frame
    const key = `ga:pv:product:${product.id}:${path}`;
    if (sessionStorage.getItem(key)) return;

    requestAnimationFrame(() => {
      trackPageView(title, path);
      sessionStorage.setItem(key, "1");
    });
  }, [product?.id, location.pathname, location.search]);

  // GA4: chỉ bắn 1 lần mỗi ID/phiên
  // useEffect(() => {
  //   if (!product?.id) return;

  //   // chống bắn lặp lại trong cùng phiên
  //   const key = `ga:view_item:${product.id}`;
  //   if (sessionStorage.getItem(key)) return;

  //   trackViewItem(product);
  //   sessionStorage.setItem(key, "1");
  // }, [product?.id]);


  const handleRelatedClick = (item) => {
    trackSelectItem(item, "related_products"); // ghi lại chọn item

    const target = item.slug || item.product_slug || item.id || item.product_id;
    if (!target) return;
    navigate(`/product/product-detail/${encodeURIComponent(target)}${qs}`);
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNavigation />
        <Breadcrumbs items={items} className="mb-4" />
        <div className="flex justify-center items-center py-20">
          <div className="h-10 w-10 border-2 border-blue-800 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNavigation />
        <Breadcrumbs items={items} className="mb-4" />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center text-gray-600">
            <h2 className="text-2xl font-semibold mb-4">{t.notFound}</h2>
            <p>
              {error
                ? `${locale === "vi" ? "Lỗi" : "Error"}: ${error}`
                : locale === "vi"
                  ? `Sản phẩm "${idOrSlug}" không tồn tại hoặc đã bị xóa.`
                  : `Product "${idOrSlug}" does not exist or was removed.`}
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />
      <Breadcrumbs items={items} className="mt-16" />

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="card p-4 space-y-6">
          <div className="md:flex gap-10">
            {/* Khối ảnh */}
            <div className="md:w-1/2 flex-shrink-0 mb-6 md:mb-0">
              <div
                className="
                  w-full rounded-md border border-gray-200 bg-white overflow-hidden
                  aspect-square md:aspect-auto md:h-[420px] lg:h-[480px]
                "
              >
                <ZoomableImage
                  src={imageSrc}
                  alt={product.title}
                  onPrev={
                    gallery.length > 1
                      ? () => setActiveIdx((i) => (i - 1 + gallery.length) % gallery.length)
                      : null
                  }
                  onNext={
                    gallery.length > 1
                      ? () => setActiveIdx((i) => (i + 1) % gallery.length)
                      : null
                  }
                  onOpenLightbox={() => setLightboxOpen(true)}
                />
              </div>

              {/* Thumbnails */}
              {gallery.length > 1 && (
                <div className="mt-3 grid grid-cols-5 sm:grid-cols-6 md:grid-cols-5 lg:grid-cols-6 gap-2">
                  {gallery.map((g, idx) => (
                    <button
                      key={`${g.url}-${idx}`}
                      type="button"
                      onClick={() => setActiveIdx(idx)}
                      className={[
                        "cursor-pointer relative border rounded overflow-hidden",
                        "aspect-square",
                        idx === activeIdx
                          ? "ring-2 ring-blue-500 border-blue-400"
                          : "border-gray-200 hover:border-gray-300",
                      ].join(" ")}
                      title={product.title}
                    >
                      <img
                        src={g.url}
                        alt={`${product.title}-${idx + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.opacity = 0.3;
                        }}
                      />
                      {g.is_primary === 1 && (
                        <span className="absolute top-1 left-1 text-[10px] px-1.5 py-0.5 rounded bg-black/60 text-white">
                          Cover
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Thông tin */}
            <div className="md:w-2/3 lg:w-3/4">
              <h1 className="text-2xl font-semibold mb-2">{product.title}</h1>

              <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                {product.views != null && (
                  <span>
                    {product.views} {t.views}
                  </span>
                )}
                {product.updated_at && (
                  <span>• {new Date(product.updated_at).toLocaleDateString()}</span>
                )}
              </div>

              {product.subcategory_name && (
                <div className="mb-5">
                  <button
                    type="button"
                    onClick={handleCategoryClick}
                    className="inline-flex items-center px-4 py-1 rounded-full text-xl bg-gray-100 text-gray-800 hover:bg-green-100 hover:text-green-800 transition-colors cursor-pointer"
                    title={t.seeIn(product.subcategory_name)}
                  >
                    <span className="block truncate font-medium">
                      {product.subcategory_name}
                    </span>
                  </button>
                </div>
              )}

              {product.description && (
                <p className="text-gray-900 leading-relaxed">{product.description}</p>
              )}
            </div>
          </div>

          <section className="prose max-w-none">
            <h2 className="text-xl font-semibold mb-3">{t.content}</h2>
            <MarkdownOnly value={product.content || ""} />
          </section>
        </div>

        {/* Related */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {product.subcategory_name
                ? t.relatedSameSub(product.subcategory_name)
                : product.parent_name
                  ? t.relatedUnderParent(product.parent_name)
                  : t.relatedMaybe}
            </h3>

            {related.length > 0 && (
              <div className="hidden md:flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollRelated(-1)}
                  className="cursor-pointer px-3 py-1.5 rounded-md border hover:bg-gray-50"
                  aria-label="Prev"
                  title={t.prev}
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => scrollRelated(1)}
                  className="cursor-pointer px-3 py-1.5 rounded-md border hover:bg-gray-50"
                  aria-label="Next"
                  title={t.next}
                >
                  ›
                </button>
              </div>
            )}
          </div>

          {relLoading ? (
            <p>{t.loading}</p>
          ) : related.length === 0 ? (
            <p className="text-gray-600">{t.noRelated}</p>
          ) : (
            <div className="relative">
              <div
                ref={trackRef}
                className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar"
              >
                {related.map((rel) => {
                  const relTitle = rel.title || rel.name;
                  const relCover =
                    rel.cover_image ||
                    (Array.isArray(rel.images) && rel.images[0]) ||
                    coverFromProduct(rel) ||
                    "/banner.jpg";
                  return (
                    <div
                      key={rel.id}
                      onClick={() => handleRelatedClick(rel)}
                      className="shrink-0 w-1/2 md:w-1/4 snap-start cursor-pointer rounded-md border border-gray-200 overflow-hidden hover:shadow group transition"
                    >
                      <div className="w-full aspect-[5/6] overflow-hidden bg-white">
                        <img
                          src={relCover}
                          alt={relTitle}
                          className="block w-full h-full object-cover transform transition-transform duration-300 ease-in-out group-hover:scale-110"
                          loading="lazy"
                        />
                      </div>
                      <div className="px-3 py-3 text-center">
                        <div className="font-medium text-xl text-gray-900 line-clamp-2">
                          {relTitle}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Nút điều hướng nổi (mobile) */}
              {related.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => scrollRelated(-1)}
                    className="md:hidden absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 bg-white cursor-pointer hover:bg-gray-50 shadow rounded-full w-9 h-9 flex items-center justify-center"
                    aria-label="Prev"
                    title={t.prev}
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollRelated(1)}
                    className="md:hidden absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 bg-white cursor-pointer hover:bg-gray-50 shadow rounded-full w-9 h-9 flex items-center justify-center"
                    aria-label="Next"
                    title={t.next}
                  >
                    ›
                  </button>
                </>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        images={gallery}
        index={activeIdx}
        title={product.title}
        onClose={() => setLightboxOpen(false)}
        onPrev={
          gallery.length > 1
            ? () => setActiveIdx((i) => (i - 1 + gallery.length) % gallery.length)
            : undefined
        }
        onNext={
          gallery.length > 1 ? () => setActiveIdx((i) => (i + 1) % gallery.length) : undefined
        }
      />

      <Footer />
    </div>
  );
}
