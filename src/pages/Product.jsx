// src/pages/Products.jsx
import { useSearchParams, useNavigate } from "react-router-dom";
import TopNavigation from "../components/Navigation";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import ProductHeaderBanner from "../components/ProductBanner";
import SidebarCategories from "../components/SidebarCategories";
import useProducts from "./admin/hook/Useproduct";

export default function Products() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    // data
    products,
    productsLoading,

    // categories
    productCategories,
    productCategoriesLoading,

    // filters (hook của bạn fetch theo slug)
    selectedProductCategorySlug,
    setSelectedProductCategorySlug,
    setSelectedProductCategoryId, // nếu có
  } = useProducts();

  const urlSlug = searchParams.get("category") || "";
  if (urlSlug !== (selectedProductCategorySlug || "")) {
    setSelectedProductCategorySlug(urlSlug);
    setSelectedProductCategoryId?.("");
  }

  // 2) Khi chọn ở sidebar -> chỉ cập nhật URL
  // (state sẽ tự đồng bộ qua đoạn trên)
  const handleSelectSlug = (slug) => {
    const next = new URLSearchParams(searchParams);
    if (slug) next.set("category", slug);
    else next.delete("category");
    setSearchParams(next, { replace: false }); 
  };

  const openDetail = (p) => navigate(`/product/product-detail/${p.slug || p.id}`);

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
            ) : products.length === 0 ? (
              <p className="text-gray-600">Không có sản phẩm.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onClick={() => openDetail(p)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
