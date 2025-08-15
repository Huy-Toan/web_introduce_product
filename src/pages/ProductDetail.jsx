
// src/pages/ProductDetailPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopNavigation from "../components/Navigation";
import MarkdownOnly from "../components/MarkdownOnly";
import Footer from "../components/Footer";

export default function ProductDetailPage() {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [relLoading, setRelLoading] = useState(false);
  const [error, setError] = useState("");

  // Ảnh fallback nếu null/"null"
  const imageSrc = useMemo(() => {
    if (!product?.image_url || product.image_url === "null") {
      return "/placeholder.png"; // đổi theo ảnh mặc định của bạn
    }
    return product.image_url;
  }, [product]);

  useEffect(() => {
    if (!idOrSlug) return;

    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError("");

        // 1) Fetch chi tiết
        const res = await fetch(`/api/products/${encodeURIComponent(idOrSlug)}`, {
          cache: "no-store",
          signal: ac.signal,
        });
        if (!res.ok) {
          let msg = `HTTP ${res.status}`;
          try { msg = (await res.json())?.error || msg; } catch {}
          throw new Error(msg);
        }
        const data = await res.json();
        const p = data?.product || null;
        setProduct(p);

        // 2) Fetch related theo category (nếu có)
        if (p?.category_id) {
          setRelLoading(true);
          const relRes = await fetch(`/api/products?category_id=${p.category_id}`, {
            cache: "no-store",
            signal: ac.signal,
          });
          if (relRes.ok) {
            const relData = await relRes.json();
            const list = Array.isArray(relData?.products) ? relData.products : [];
            // loại chính nó
            setRelated(list.filter((x) => x.id !== p.id));
          } else {
            setRelated([]);
          }
          setRelLoading(false);
        } else {
          setRelated([]);
        }
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error("Load product error:", e);
          setError(e.message || "Không tải được sản phẩm");
          setProduct(null);
          setRelated([]);
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [idOrSlug]);

  const handleRelatedClick = (item) => {
    navigate(`/product/product-detail/${item.slug || item.id}`);
  };

  const handleCategoryClick = () => {
  // Cố gắng lấy slug trước, nếu không có thì fallback sang id
  const catSlug =
    product.category_slug ??
    product.category?.slug ??
    (product.category_id ? String(product.category_id) : null);

  if (!catSlug) return;

  navigate(`/product?category=${encodeURIComponent(catSlug)}`);
};

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNavigation />
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
        <div className="container mx-auto px-4 py-20">
          <div className="text-center text-gray-600">
            <h2 className="text-2xl font-semibold mb-4">Không tìm thấy sản phẩm</h2>
            <p>{error ? `Lỗi: ${error}` : `Sản phẩm "${idOrSlug}" không tồn tại hoặc đã bị xóa.`}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />

      <main className="container mx-auto px-4 py-6 max-w-7xl mt-12">
        {/* Khối thông tin cơ bản */}
        <div className="card p-4 space-y-6">
          <div className="md:flex gap-10">
            <div className="md:w-1/3 lg:w-1/4 flex-shrink-0 mb-6 md:mb-0">
              <img
                src={imageSrc}
                alt={product.title}
                className="w-full h-full object-contain rounded-md border border-gray-200"
              />
            </div>

            <div className="md:w-2/3 lg:w-3/4">
              <h1 className="text-2xl font-semibold mb-3">{product.title}</h1>

              {/* Category badge nếu có */}
            {product.category_name && ( 
              <div className="mb-3"> 
                <button 
                  type="button" 
                  onClick={handleCategoryClick} 
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800 
                              hover:bg-green-100 hover:text-green-800 transition-colors cursor-pointer" 
                  title={`Xem sản phẩm trong ${product.category_name}`} 
                > 
                  {product.category_name} 
                </button> 
              </div> 
            )}

              {/* Description ngắn */}
              {product.description && (
                <p className="text-gray-900 leading-relaxed">{product.description}</p>
              )}
            </div>
          </div>

          {/* Content đầy đủ */}
             <section className="prose max-w-none">
               <h2 className="text-xl font-semibold mb-3">Nội dung</h2>
               <MarkdownOnly value={product.content || ""} />
             </section>
        </div>

        {/* Related */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {product.category_name
                ? `Sản phẩm cùng loại: ${product.category_name}`
                : "Có thể bạn cũng thích"}
            </h3>
          </div>

          {relLoading ? (
            <p>Đang tải...</p>
          ) : related.length === 0 ? (
            <p className="text-gray-600">Chưa có sản phẩm liên quan.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
              {related.map((rel) => (
                <div
                  key={rel.id}
                  className="card p-4 text-center cursor-pointer hover:shadow"
                  onClick={() => handleRelatedClick(rel)}
                >
                  <div className="w-full aspect-[3/4] mx-auto mb-3">
                    <img
                      src={!rel.image_url || rel.image_url === "null" ? "/placeholder.png" : rel.image_url}
                      alt={rel.title}
                      className="w-full h-full object-contain rounded-sm border border-gray-200"
                    />
                  </div>
                  <div className="font-medium text-gray-900 line-clamp-2">{rel.title}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
