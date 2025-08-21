// src/pages/Products.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TopNavigation from "../components/Navigation";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import ProductHeaderBanner from "../components/ProductBanner";
import SidebarCategoriesTwoLevel from "../components/SidebarCategories";
import useProducts from "./admin/hook/Useproduct";
import Pagination from "../components/Pagination";
import Breadcrumbs from "../components/Breadcrumbs";

const PAGE_SIZE = 9;

export default function Products() {
  const navigate = useNavigate();
  const { parentSlug, subSlug } = useParams();

  const [parentMeta, setParentMeta] = useState(null);
  const [subMeta, setSubMeta] = useState(null);

  // fetch tên parent theo slug
  useEffect(() => {
    let ac = new AbortController();
    (async () => {
      setParentMeta(null);
      if (!parentSlug) return;
      try {
        const res = await fetch(`/api/parent_categories/${encodeURIComponent(parentSlug)}`, { signal: ac.signal });
        if (!res.ok) return; // fallback dùng slug
        const data = await res.json();
        // BE có thể trả { parent: {...} } hoặc thẳng object
        const parent = data.parent || data;
        setParentMeta(parent);
      } catch {}
    })();
    return () => ac.abort();
  }, [parentSlug]);

  // fetch tên sub theo slug
// fetch tên sub theo slug (FIXED)
useEffect(() => {
  const ac = new AbortController();

  (async () => {
    setSubMeta(null);
    if (!subSlug) return;
    try {
      // thử 2 endpoint, nhớ truyền { signal: ac.signal }
      let res = await fetch(`/api/sub_categories/${encodeURIComponent(subSlug)}`, { signal: ac.signal });
      if (!res.ok) {
        res = await fetch(`/api/subcategories/${encodeURIComponent(subSlug)}`, { signal: ac.signal });
      }
      if (!res.ok) return;

      const data = await res.json();
      const sub = data.subcategory || data;
      setSubMeta(sub);
    } catch (e) {
      if (e.name !== "AbortError") console.error(e);
    }
  })();

  return () => ac.abort();
}, [subSlug]);


  // --- Breadcrumbs dựa theo URL + meta ---
  const items = useMemo(() => {
    // Base
    const arr = [{ label: "Product", to: "/product" }];

    if (!parentSlug && !subSlug) {
      // /product
      arr.push({ label: "All" });
      return arr;
    }

    if (parentSlug && !subSlug) {
      // /product/:parent
      arr.push({
        label: parentMeta?.name || decodeURIComponent(parentSlug),
      });
      return arr;
    }

    // /product/:parent/:sub
    arr.push({
      label: parentMeta?.name || decodeURIComponent(parentSlug),
      to: `/product/${encodeURIComponent(parentSlug)}`,
    });
    arr.push({
      label: subMeta?.name || decodeURIComponent(subSlug),
    });
    return arr;
  }, [parentSlug, subSlug, parentMeta, subMeta]);

  const {
    products,
    productsLoading,
    setSelectedSubcategorySlug,
  } = useProducts({ initialSubSlug: subSlug || "" });

  const [activeParentSlug, setActiveParentSlug] = useState(parentSlug || null);
  const [activeSubSlug, setActiveSubSlug] = useState(subSlug || null);

  useEffect(() => {
    setActiveParentSlug(parentSlug || null);
    setActiveSubSlug(subSlug || null);
    setSelectedSubcategorySlug(subSlug || "");
  }, [parentSlug, subSlug, setSelectedSubcategorySlug]);

  const [parentProducts, setParentProducts] = useState([]);
  const [parentLoading, setParentLoading] = useState(false);
  const parentControllerRef = useRef(null);

  useEffect(() => {
    const onlyParent = !!parentSlug && !subSlug;

    if (!onlyParent) {
      setParentProducts([]);
      setParentLoading(false);
      try { parentControllerRef.current?.abort?.(); } catch {}
      return;
    }

    try { parentControllerRef.current?.abort?.(); } catch {}
    const controller = new AbortController();
    parentControllerRef.current = controller;

    (async () => {
      try {
        setParentLoading(true);
        const url = `/api/parent_categories/${encodeURIComponent(parentSlug)}/products`;
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

    return () => { try { controller.abort(); } catch {} };
  }, [parentSlug, subSlug]);

  const isFilteringBySub = !!subSlug;
  const displayedLoading = isFilteringBySub ? productsLoading : (parentLoading || productsLoading);
  const displayedProducts = isFilteringBySub
    ? (products || [])
    : (parentSlug ? (parentProducts || []) : (products || []));

  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => setCurrentPage(1), [parentSlug, subSlug]);

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

  const openDetail = (p) => navigate(`/product/product-detail/${p.slug || p.id}`);

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />
      <Breadcrumbs items={items} className="mt-16" />
      <ProductHeaderBanner />

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex flex-col md:flex-row gap-6">
          <SidebarCategoriesTwoLevel
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
                    <ProductCard key={p.id} product={p} onClick={() => openDetail(p)} />
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
