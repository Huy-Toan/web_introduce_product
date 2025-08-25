// src/pages/ProductDetailPage.jsx
import { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import TopNavigation from "../components/Navigation";
import MarkdownOnly from "../components/MarkdownOnly";
import Footer from "../components/Footer";
import Breadcrumbs from "../components/Breadcrumbs";

const SUPPORTED = ["vi", "en"];
const DEFAULT_LOCALE = "vi";
const getLocaleFromSearch = (search) =>
  new URLSearchParams(search).get("locale")?.toLowerCase() || "";

export default function ProductDetailPage() {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const trackRef = useRef(null);

  // ==== locale: URL -> localStorage -> default
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
      try { document.documentElement.lang = urlLc; } catch { }
    }
  }, [location.search, locale]);

  const qs = `?locale=${encodeURIComponent(locale)}`;

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [relLoading, setRelLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchParentBySub = async (subSlug, signal) => {
    // Ưu tiên route bạn đang mount: /api/sub_categories
    let res = await fetch(
      `/api/sub_categories/${encodeURIComponent(subSlug)}${qs}`,
      { signal }
    );
    if (!res.ok) {
      // fallback nếu BE dùng tên khác
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

  // i18n labels
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
  };

  // Breadcrumbs
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

  const imageSrc = useMemo(() => {
    if (!product?.image_url || product.image_url === "null") return "/banner.jpg";
    return product.image_url;
  }, [product]);

  useEffect(() => {
    if (!idOrSlug) return;

    const ac = new AbortController();
    const safeJson = async (res) => {
      try {
        return await res.json();
      } catch {
        return {};
      }
    };

    (async () => {
      try {
        setLoading(true);
        setError("");

        // 1) Fetch chi tiết (kèm locale)
        const res = await fetch(
          `/api/products/${encodeURIComponent(idOrSlug)}${qs}`,
          { cache: "no-store", signal: ac.signal }
        );
        if (!res.ok) {
          let msg = `HTTP ${res.status}`;
          try {
            msg = (await res.json())?.error || msg;
          } catch { }
          throw new Error(msg);
        }
        const data = await res.json();
        const p = data?.product || null;
        setProduct(p);

        // Bổ sung parent nếu thiếu
        if (!p?.parent_slug && p?.subcategory_slug) {
          const parent = await fetchParentBySub(p.subcategory_slug, ac.signal);
          if (parent?.parent_slug) {
            setProduct((prev) => ({ ...prev, ...parent }));
          }
        }

        // 2) Related theo sub -> parent (kèm locale)
        setRelLoading(true);
        let relatedList = [];

        const subSlug = p?.subcategory_slug ?? p?.subcategory?.slug ?? null;
        const parentSlug = p?.parent_slug ?? p?.parent?.slug ?? null;

        if (subSlug) {
          // Ưu tiên route có join translations
          let relRes = await fetch(
            `/api/sub_categories/${encodeURIComponent(subSlug)}/products${qs}`,
            { cache: "no-store", signal: ac.signal }
          );

          // Fallback tên khác
          if (!relRes.ok) {
            relRes = await fetch(
              `/api/subcategories/${encodeURIComponent(subSlug)}/products${qs}`,
              { cache: "no-store", signal: ac.signal }
            );
          }

          if (relRes.ok) {
            const relData = await safeJson(relRes);
            relatedList = Array.isArray(relData?.products) ? relData.products : [];
          }
        } else if (parentSlug) {
          const relRes = await fetch(
            `/api/parent_categories/${encodeURIComponent(parentSlug)}/products${qs}`,
            { cache: "no-store", signal: ac.signal }
          );
          if (relRes.ok) {
            const relData = await safeJson(relRes);
            relatedList = Array.isArray(relData?.products) ? relData.products : [];
          }
        }

        // loại chính nó + giới hạn
        relatedList = relatedList.filter((x) => x.id !== p?.id).slice(0, 12);
        setRelated(relatedList);
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error("Load product error:", e);
          setError(e.message || (locale === "vi" ? "Không tải được sản phẩm" : "Failed to load product"));
          setProduct(null);
          setRelated([]);
        }
      } finally {
        setRelLoading(false);
        setLoading(false);
      }
    })();

    return () => ac.abort();
    // Re-fetch khi đổi locale để lấy bản dịch
  }, [idOrSlug, locale]);

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

  const handleRelatedClick = (item) => {
    navigate(`/product/product-detail/${encodeURIComponent(item.product_slug)}${qs}`);
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
                : (locale === "vi"
                  ? `Sản phẩm "${idOrSlug}" không tồn tại hoặc đã bị xóa.`
                  : `Product "${idOrSlug}" does not exist or was removed.`)}
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
            <div className="md:w-1/2 flex-shrink-0 mb-6 md:mb-0">
              {/* Khung cố định chiều cao, full chiều ngang */}
              <div className="w-full h-[520px] md:h-[560px] rounded-md border border-gray-200 bg-white overflow-hidden">
                <img
                  src={imageSrc}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/banner.jpg";
                  }}
                />
              </div>
            </div>

            <div className="md:w-2/3 lg:w-3/4">
              <h1 className="text-2xl font-semibold mb-3">{product.title}</h1>

              {/* Badge danh mục */}
              {product.subcategory_name && (
                <div className="mb-5">
                  <button
                    type="button"
                    onClick={handleCategoryClick}
                    className="inline-flex items-center px-4 py-1 rounded-full text-xl bg-gray-100 text-gray-800 
                               hover:bg-green-100 hover:text-green-800 transition-colors cursor-pointer"
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
              {/* Track */}
              <div
                ref={trackRef}
                className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar"
              >
                {related.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => handleRelatedClick(rel)}
                    className="shrink-0 w-1/2 md:w-1/4 snap-start cursor-pointer rounded-md border border-gray-200 overflow-hidden hover:shadow group transition"
                  >
                    <div className="w-full aspect-[3/4] overflow-hidden bg-white">
                      <img
                        src={!rel.image_url || rel.image_url === "null" ? "/banner.jpg" : rel.image_url}
                        alt={rel.title}
                        className="block w-full h-full object-cover transform transition-transform duration-300 ease-in-out group-hover:scale-110"
                        loading="lazy"
                      />
                    </div>
                    <div className="px-3 py-2 text-center">
                      <div className="font-medium text-gray-900 line-clamp-2">{rel.title}</div>
                    </div>
                  </div>
                ))}
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

      <Footer />
    </div>
  );
}
