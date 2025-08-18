import { useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import TopNavigation from "../components/Navigation";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import ProductHeaderBanner from "../components/ProductBanner";
import SidebarCategories from "../components/SidebarCategories";
import useProducts from "./admin/hook/Useproduct";
import Pagination from "../components/Pagination";

const PAGE_SIZE = 9;

export default function Products() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    products,
    productsLoading,
    productCategories,
    productCategoriesLoading,
    selectedProductCategorySlug,
    setSelectedProductCategorySlug,
    setSelectedProductCategoryId,
  } = useProducts();

  // --- URL state: chỉ giữ category ---
  const urlSlug = searchParams.get("category") || "";

  if (urlSlug !== (selectedProductCategorySlug || "")) {
    setSelectedProductCategorySlug(urlSlug);
    setSelectedProductCategoryId?.("");
  }

  // page state nội bộ (không gắn URL)
  const [currentPage, setCurrentPage] = useState(1);

  // Khi chọn category -> reset page về 1
  const handleSelectSlug = (slug) => {
    const next = new URLSearchParams(searchParams);
    if (slug) next.set("category", slug);
    else next.delete("category");
    setSearchParams(next, { replace: false });
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalPages = useMemo(() => {
    const total = products?.length || 0;
    return Math.max(1, Math.ceil(total / PAGE_SIZE));
  }, [products]);

  const goToPage = (pageNum) => {
    setCurrentPage((prev) => {
      const next = Math.max(1, Math.min(pageNum, totalPages));
      return next;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openDetail = (p) => navigate(`/product/product-detail/${p.slug || p.id}`);

  // Cắt products theo trang
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return (products || []).slice(start, start + PAGE_SIZE);
  }, [products, currentPage]);

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />
      <ProductHeaderBanner />

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex flex-col md:flex-row gap-6">
          <SidebarCategories
            categories={productCategories}
            loading={productCategoriesLoading}
            activeSlug={selectedProductCategorySlug || null}
            onSelectSlug={handleSelectSlug}
          />

          <div className="flex-1">
            {productsLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="h-10 w-10 border-2 border-blue-800 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (products || []).length === 0 ? (
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
