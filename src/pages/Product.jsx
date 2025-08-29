// src/pages/Products.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import TopNavigation from "../components/Navigation";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import ProductHeaderBanner from "../components/ProductBanner";
import SidebarCategoriesTwoLevel from "../components/SidebarCategories";
import useProducts from "./admin/hook/Useproduct";
import Pagination from "../components/Pagination";
import Breadcrumbs from "../components/Breadcrumbs";
import { getSiteOrigin } from "../lib/siteUrl";
import SEO from "../components/SEOhead";

const PAGE_SIZE = 9;
const SUPPORTED = ["vi", "en"];
const DEFAULT_LOCALE = "vi";

// lấy locale tương tự News.jsx
function getInitialLocale() {
  const urlLc = new URLSearchParams(window.location.search).get("locale")?.toLowerCase() || "";
  const lsLc = (localStorage.getItem("locale") || "").toLowerCase();
  return SUPPORTED.includes(urlLc) ? urlLc : (SUPPORTED.includes(lsLc) ? lsLc : DEFAULT_LOCALE);
}

// Helper: lấy ảnh cover từ product (ưu tiên image_url, fallback images_json)
function coverFromProduct(p) {
  let cover = p?.image_url || "";
  if (!cover && p?.images_json) {
    try {
      const arr = Array.isArray(p.images_json) ? p.images_json : JSON.parse(p.images_json);
      if (Array.isArray(arr) && arr.length) {
        const primary = arr.find(it => it.is_primary === 1) || arr[0];
        cover = primary?.url || "";
      }
    } catch {
      // ignore parse error
    }
  }
  return cover;
}

export default function Products() {
  const navigate = useNavigate();
  const location = useLocation();
  const { parentSlug, subSlug } = useParams();

  const [locale, setLocale] = useState(getInitialLocale());

  // sync khi user đổi ngôn ngữ ở TopNavigation (nó đổi URL ?locale=..)
  useEffect(() => {
    const urlLc = new URLSearchParams(location.search).get("locale")?.toLowerCase() || "";
    if (SUPPORTED.includes(urlLc) && urlLc !== locale) {
      setLocale(urlLc);
      localStorage.setItem("locale", urlLc);
      try { document.documentElement.lang = urlLc; } catch { }
    }
  }, [location.search, locale]);

  const [parentMeta, setParentMeta] = useState(null);
  const [subMeta, setSubMeta] = useState(null);

  // fetch tên parent theo slug (CÓ locale)
  useEffect(() => {
    let ac = new AbortController();
    (async () => {
      setParentMeta(null);
      if (!parentSlug) return;
      try {
        const res = await fetch(`/api/parent_categories/${encodeURIComponent(parentSlug)}?locale=${encodeURIComponent(locale)}`, { signal: ac.signal });
        if (!res.ok) return;
        const data = await res.json();
        setParentMeta(data.parent || data);
      } catch { }
    })();
    return () => ac.abort();
  }, [parentSlug, locale]);

  // fetch tên sub theo slug (CÓ locale, giữ fallback alias cũ)
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      setSubMeta(null);
      if (!subSlug) return;
      try {
        let res = await fetch(`/api/sub_categories/${encodeURIComponent(subSlug)}?locale=${encodeURIComponent(locale)}`, { signal: ac.signal });
        if (!res.ok) {
          res = await fetch(`/api/subcategories/${encodeURIComponent(subSlug)}?locale=${encodeURIComponent(locale)}`, { signal: ac.signal });
        }
        if (!res.ok) return;
        const data = await res.json();
        setSubMeta(data.subcategory || data);
      } catch (e) {
        if (e.name !== "AbortError") console.error(e);
      }
    })();
    return () => ac.abort();
  }, [subSlug, locale]);

  // --- Breadcrumbs dựa theo URL + meta, GIỮ locale trong link ---
  const items = useMemo(() => {
    const qs = `?locale=${locale}`;
    const arr = [{ label: "Product", to: "/product" + qs }];
    if (!parentSlug && !subSlug) {
      arr.push({ label: "All" });
      return arr;
    }
    if (parentSlug && !subSlug) {
      arr.push({ label: parentMeta?.name || decodeURIComponent(parentSlug) });
      return arr;
    }
    arr.push({
      label: parentMeta?.name || decodeURIComponent(parentSlug),
      to: `/product/${encodeURIComponent(parentSlug)}${qs}`,
    });
    arr.push({ label: subMeta?.name || decodeURIComponent(subSlug) });
    return arr;
  }, [parentSlug, subSlug, parentMeta, subMeta, locale]);

  // Hook cũ vẫn dùng
  const { products: hookProducts, productsLoading, setSelectedSubcategorySlug } =
    useProducts({ initialSubSlug: subSlug || "" });

  useEffect(() => setSelectedSubcategorySlug(subSlug || ""), [subSlug, setSelectedSubcategorySlug]);

  const [activeParentSlug, setActiveParentSlug] = useState(parentSlug || null);
  const [activeSubSlug, setActiveSubSlug] = useState(subSlug || null);

  useEffect(() => {
    setActiveParentSlug(parentSlug || null);
    setActiveSubSlug(subSlug || null);
  }, [parentSlug, subSlug]);

  // ====== Local fetch để đảm bảo locale ======
  const [allProducts, setAllProducts] = useState([]);
  const [allLoading, setAllLoading] = useState(false);

  const [parentProducts, setParentProducts] = useState([]);
  const [parentLoading, setParentLoading] = useState(false);

  const [subProducts, setSubProducts] = useState([]);
  const [subLoading, setSubLoading] = useState(false);

  const parentControllerRef = useRef(null);
  const subControllerRef = useRef(null);

  // All products
  useEffect(() => {
    if (parentSlug || subSlug) {
      setAllProducts([]);
      setAllLoading(false);
      return;
    }
    let ac = new AbortController();
    (async () => {
      try {
        setAllLoading(true);
        const res = await fetch(`/api/products?locale=${encodeURIComponent(locale)}`, { signal: ac.signal });
        const data = await res.json();
        setAllProducts(Array.isArray(data?.products) ? data.products : []);
      } catch (e) {
        if (e?.name !== "AbortError") console.error(e);
        setAllProducts([]);
      } finally {
        setAllLoading(false);
      }
    })();
    return () => { try { ac.abort(); } catch { } };
  }, [parentSlug, subSlug, locale]);

  // Products theo parent
  useEffect(() => {
    const onlyParent = !!parentSlug && !subSlug;
    if (!onlyParent) {
      setParentProducts([]);
      setParentLoading(false);
      try { parentControllerRef.current?.abort?.(); } catch { }
      return;
    }
    try { parentControllerRef.current?.abort?.(); } catch { }
    const controller = new AbortController();
    parentControllerRef.current = controller;

    (async () => {
      try {
        setParentLoading(true);
        const url = `/api/parent_categories/${encodeURIComponent(parentSlug)}/products?locale=${encodeURIComponent(locale)}`;
        const res = await fetch(url, { signal: controller.signal });
        const data = await res.json();
        setParentProducts(Array.isArray(data?.products) ? data.products : []);
      } catch (e) {
        if (e?.name !== "AbortError") {
          console.error("fetch by parent error:", e);
          setParentProducts([]);
        }
      } finally {
        setParentLoading(false);
      }
    })();

    return () => { try { controller.abort(); } catch { } };
  }, [parentSlug, subSlug, locale]);

  // Products theo sub (map product_slug -> slug)
  useEffect(() => {
    if (!subSlug) {
      setSubProducts([]);
      setSubLoading(false);
      try { subControllerRef.current?.abort?.(); } catch { }
      return;
    }
    try { subControllerRef.current?.abort?.(); } catch { }
    const controller = new AbortController();
    subControllerRef.current = controller;

    (async () => {
      try {
        setSubLoading(true);
        const url = `/api/sub_categories/${encodeURIComponent(subSlug)}/products?locale=${encodeURIComponent(locale)}`;
        const res = await fetch(url, { signal: controller.signal });
        const data = await res.json();
        const list = Array.isArray(data?.products) ? data.products : [];
        setSubProducts(list.map(p => ({ ...p, slug: p.slug || p.product_slug })));
      } catch (e) {
        if (e?.name !== "AbortError") {
          console.error("fetch by sub error:", e);
          setSubProducts([]);
        }
      } finally {
        setSubLoading(false);
      }
    })();

    return () => { try { controller.abort(); } catch { } };
  }, [subSlug, locale]);

  const isFilteringBySub = !!subSlug;
  const isFilteringByParentOnly = !!parentSlug && !subSlug;

  const displayedLoading = isFilteringBySub
    ? (subLoading || productsLoading)
    : isFilteringByParentOnly
      ? (parentLoading || productsLoading)
      : (allLoading || productsLoading);

  const displayedProductsRaw = isFilteringBySub
    ? (subProducts || [])
    : isFilteringByParentOnly
      ? (parentProducts || [])
      : (allProducts.length ? allProducts : (hookProducts || []));

  // Bổ sung cover fallback cho mỗi product (để Card & SEO dùng ổn định)
  const displayedProducts = useMemo(() => {
    return (displayedProductsRaw || []).map(p => {
      const cover = coverFromProduct(p);
      // đảm bảo luôn có p._cover và đồng thời patch image_url nếu trống (card cũ dùng image_url)
      return { ...p, _cover: cover, image_url: p.image_url || cover };
    });
  }, [displayedProductsRaw]);

  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => setCurrentPage(1), [parentSlug, subSlug, locale]);

  const totalPages = useMemo(() => {
    const total = displayedProducts?.length || 0;
    return Math.max(1, Math.ceil(total / PAGE_SIZE));
  }, [displayedProducts]);

  const goToPage = (n) => {
    setCurrentPage((prev) => Math.max(1, Math.min(n, totalPages)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return (displayedProducts || []).slice(start, start + PAGE_SIZE);
  }, [displayedProducts, currentPage]);

  const openDetail = (p) =>
    navigate(`/product/product-detail/${encodeURIComponent(p.slug || p.id)}?locale=${locale}`);

  /* ====================== SEO for Products ====================== */
  const SITE_URL = getSiteOrigin();
  const BRAND = import.meta.env.VITE_BRAND_NAME || "ITXEASY";

  const canonicalPath = useMemo(() => {
    let p = "/product";
    if (parentSlug) p += `/${encodeURIComponent(parentSlug)}`;
    if (subSlug) p += `/${encodeURIComponent(subSlug)}`;
    return p; // hoặc `${p}?locale=${locale}`
  }, [parentSlug, subSlug /*, locale*/]);
  const canonical = `${SITE_URL}${canonicalPath}`;

  const pageTitle = useMemo(() => {
    if (subMeta?.name) return `${subMeta.name} | Sản phẩm | ${BRAND}`;
    if (parentMeta?.name) return `${parentMeta.name} | Sản phẩm | ${BRAND}`;
    return `Sản phẩm | ${BRAND}`;
  }, [parentMeta, subMeta]);

  const topTitles = (displayedProducts || [])
    .slice(0, 12)
    .map((p) => p.title || p.name)
    .filter(Boolean);

  const pageDesc = useMemo(() => {
    const prefix = subMeta?.description || parentMeta?.description || "";
    const tail = topTitles.join(", ");
    const base = [prefix, tail].filter(Boolean).join(" — ");
    return base || `Danh mục sản phẩm ${subMeta?.name || parentMeta?.name || BRAND}. Xuất khẩu nông sản Việt Nam chất lượng cao.`;
  }, [subMeta, parentMeta, topTitles, BRAND]);

  const keywords = useMemo(() => {
    const arr = [
      subMeta?.name,
      parentMeta?.name,
      "sản phẩm",
      "xuất khẩu",
      "nông sản",
      "trái cây",
      "export",
      "agriculture",
      "Vietnam"
    ].filter(Boolean);
    return Array.from(new Set(arr));
  }, [subMeta, parentMeta]);

  const breadcrumbLd = useMemo(() => {
    const base = [{ name: "Product", url: `${SITE_URL}/product` }];
    if (parentSlug) base.push({
      name: parentMeta?.name || decodeURIComponent(parentSlug),
      url: `${SITE_URL}/product/${encodeURIComponent(parentSlug)}`
    });
    if (subSlug) base.push({
      name: subMeta?.name || decodeURIComponent(subSlug),
      url: `${SITE_URL}/product/${encodeURIComponent(parentSlug)}/${encodeURIComponent(subSlug)}`
    });
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: base.map((b, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: b.name,
        item: b.url
      }))
    };
  }, [SITE_URL, parentSlug, subSlug, parentMeta, subMeta]);

  // Dùng cover chuẩn cho SEO
  const itemListLd = useMemo(() => {
    const items = (paginated || []).map((p, idx) => ({
      "@type": "ListItem",
      position: idx + 1 + (currentPage - 1) * PAGE_SIZE,
      item: {
        "@type": "Product",
        name: p.title || p.name,
        url: `${SITE_URL}/product/product-detail/${encodeURIComponent(p.slug || p.id)}`,
        image: coverFromProduct(p) || undefined,
        brand: BRAND
      }
    }));
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: items
    };
  }, [paginated, currentPage, BRAND, SITE_URL]);

  const noindex = !displayedLoading && (displayedProducts || []).length === 0;

  /* ============================================================= */

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title={pageTitle}
        description={pageDesc}
        url={canonical}
        siteName={BRAND}
        noindex={noindex}
        keywords={keywords}
        ogType="website"
        twitterCard="summary_large_image"
        jsonLd={[breadcrumbLd, itemListLd]}  // collectionPageLd là tuỳ chọn, mình giữ gọn 2 khối chính
      />

      <TopNavigation />
      <Breadcrumbs items={items} className="mt-16" />
      <ProductHeaderBanner />

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex flex-col md:flex-row gap-6">
          {/* thêm key để Sidebar re-mount khi đổi locale */}
          <SidebarCategoriesTwoLevel
            key={locale}
            activeParentSlug={activeParentSlug}
            activeSubSlug={activeSubSlug}
            showAll
          />

          <div className="flex-1">
            {displayedLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="h-10 w-10 border-2 border-blue-800 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (displayedProducts || []).length === 0 ? (
              <p className="text-gray-600">Không có sản phẩm.</p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {paginated.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => openDetail(p)}
                      className="cursor-pointer"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter') openDetail(p); }}
                    >
                      {/* Patch image_url với cover để ProductCard cũ hiển thị ảnh đúng */}
                      <ProductCard product={{ ...p, image_url: p.image_url || p._cover }} />
                    </div>
                  ))}
                </div>

                <Pagination
                  className="mt-8"
                  totalPages={totalPages}
                  currentPage={currentPage}
                  onPageChange={goToPage}
                />
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
