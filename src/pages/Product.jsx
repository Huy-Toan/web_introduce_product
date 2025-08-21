// src/pages/Products.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import TopNavigation from "../components/Navigation";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import ProductHeaderBanner from "../components/ProductBanner";
import SidebarCategoriesTwoLevel from "../components/SidebarCategories";
import useProducts from "./admin/hook/Useproduct"; // Giữ nguyên import của bạn
import Pagination from "../components/Pagination";

const PAGE_SIZE = 9;

export default function Products() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Đọc param TRƯỚC khi gọi hook để init đúng ngay lần mount đầu
  const initialUrlParent = searchParams.get("parent") || "";
  const initialUrlSub = searchParams.get("sub") || "";

  // Hook sản phẩm (lọc theo subcategory) — khởi tạo từ URL
  const {
    products,
    productsLoading,
    selectedSubcategorySlug,
    setSelectedSubcategorySlug,
  } = useProducts({ initialSubSlug: initialUrlSub });

  // State để render UI Sidebar (không dùng để fetch sản phẩm)
  const [activeParentSlug, setActiveParentSlug] = useState(initialUrlParent || null);
  const [activeSubSlug, setActiveSubSlug] = useState(initialUrlSub || null);

  // Khi URL đổi (paste link, back/forward…), đồng bộ vào state + hook
  useEffect(() => {
    const urlParent = searchParams.get("parent") || null;
    const urlSub = searchParams.get("sub") || null;
    setActiveParentSlug(urlParent);
    setActiveSubSlug(urlSub);
    setSelectedSubcategorySlug(urlSub || "");
  }, [searchParams, setSelectedSubcategorySlug]);

  // ---- Fetch theo PARENT khi không có sub ----
  const [parentProducts, setParentProducts] = useState([]);
  const [parentLoading, setParentLoading] = useState(false);
  const parentControllerRef = useRef(null);

  useEffect(() => {
    const onlyParent = !!activeParentSlug && !activeSubSlug;
    // Không lọc theo parent-only -> clear
    if (!onlyParent) {
      setParentProducts([]);
      setParentLoading(false);
      // Hủy req parent đang chạy nếu có
      try { parentControllerRef.current?.abort?.(); } catch {}
      return;
    }

    // Hủy req cũ (nếu có), tránh race
    try { parentControllerRef.current?.abort?.(); } catch {}
    const controller = new AbortController();
    parentControllerRef.current = controller;

    const fetchByParent = async () => {
      try {
        setParentLoading(true);
        const url = `/api/parent_categories/${encodeURIComponent(activeParentSlug)}/products`;
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
    };

    fetchByParent();

    // cleanup khi deps đổi/unmount
    return () => {
      try { controller.abort(); } catch {}
    };
  }, [activeParentSlug, activeSubSlug]);

  // ---- Handlers: cập nhật URL khi chọn ở Sidebar ----
  const handleSelectParentSlug = (slugOrNull) => {
    const next = new URLSearchParams(searchParams);
    if (slugOrNull) next.set("parent", slugOrNull);
    else next.delete("parent");
    // reset sub khi chọn parent
    next.delete("sub");
    setSearchParams(next, { replace: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectSubSlug = (slugOrNull) => {
    const next = new URLSearchParams(searchParams);
    if (slugOrNull) {
      next.set("sub", slugOrNull);
      // Khi chọn sub, bỏ parent (nếu muốn giữ parent thì đừng delete)
      next.delete("parent");
    } else {
      next.delete("sub");
    }
    setSearchParams(next, { replace: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ---- Chọn data hiển thị + trạng thái loading ----
  const isFilteringBySub = !!activeSubSlug;
  const displayedLoading = isFilteringBySub ? productsLoading : (parentLoading || productsLoading);
  const displayedProducts = isFilteringBySub
    ? (products || [])
    : (activeParentSlug ? (parentProducts || []) : (products || []));

  // ---- Phân trang ----
  const [currentPage, setCurrentPage] = useState(1);
  // Reset về page 1 mỗi khi filter đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [activeParentSlug, activeSubSlug]);

  const totalPages = useMemo(() => {
    const total = displayedProducts?.length || 0;
    return Math.max(1, Math.ceil(total / PAGE_SIZE));
  }, [displayedProducts]);

  const goToPage = (pageNum) => {
    setCurrentPage((prev) => {
      const next = Math.max(1, Math.min(pageNum, totalPages));
      return next;
    });
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
      <ProductHeaderBanner />

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar 2 cấp */}
          <SidebarCategoriesTwoLevel
            activeParentSlug={activeParentSlug}
            activeSubSlug={activeSubSlug}
            onSelectParentSlug={handleSelectParentSlug}
            onSelectSubSlug={handleSelectSubSlug}
            showAll
          />

          {/* Content */}
          <div className="flex-1">
            {displayedLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="h-10 w-10 border-2 border-blue-800 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (displayedProducts || []).length === 0 ? (
              <p className="text-gray-600">Không có sản phẩm.</p>
            ) : (
              <>
                {/* Grid sản phẩm */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {paginated.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onClick={() => openDetail(p)}
                    />
                  ))}
                </div>

                {/* Phân trang */}
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
