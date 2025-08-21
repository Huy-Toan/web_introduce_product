// src/pages/ProductDetailPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopNavigation from "../components/Navigation";
import MarkdownOnly from "../components/MarkdownOnly";
import Footer from "../components/Footer";
import Breadcrumbs from "../components/Breadcrumbs";

export default function ProductDetailPage() {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [relLoading, setRelLoading] = useState(false);
  const [error, setError] = useState("");

  const items = [
    { label: "Sản phẩm", to: "/product" },
    ...(product?.parent_name && product?.parent_slug
      ? [{ label: product.parent_name, to: `/product?parent=${encodeURIComponent(product.parent_slug)}` }]
      : []),
    ...(product?.subcategory_name && product?.subcategory_slug
      ? [{ label: product.subcategory_name, to: `/product?sub=${encodeURIComponent(product.subcategory_slug)}` }]
      : []),
    { label: product?.title || "Chi tiết" },
  ];

  const imageSrc = useMemo(() => {
    if (!product?.image_url || product.image_url === "null") return "/placeholder.png";
    return product.image_url;
  }, [product]);

  useEffect(() => {
    if (!idOrSlug) return;

    const ac = new AbortController();
    const safeJson = async (res) => { try { return await res.json(); } catch { return {}; } };

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

        // 2) Related theo sub -> parent
        setRelLoading(true);
        let relatedList = [];

        const subSlug = p?.subcategory_slug ?? p?.subcategory?.slug ?? null;
        const parentSlug = p?.parent_slug ?? p?.parent?.slug ?? null;

        if (subSlug) {
          // ưu tiên endpoint theo sidebar: /api/sub_categories/:slug/products
          let relRes = await fetch(`/api/sub_categories/${encodeURIComponent(subSlug)}/products`, {
            cache: "no-store",
            signal: ac.signal,
          });

          // fallback sang /api/subcategories nếu BE dùng tên này
          if (!relRes.ok) {
            relRes = await fetch(`/api/subcategories/${encodeURIComponent(subSlug)}/products`, {
              cache: "no-store",
              signal: ac.signal,
            });
          }

          if (relRes.ok) {
            const relData = await safeJson(relRes);
            relatedList = Array.isArray(relData?.products) ? relData.products : [];
          }
        } else if (parentSlug) {
          const relRes = await fetch(`/api/parent_categories/${encodeURIComponent(parentSlug)}/products`, {
            cache: "no-store",
            signal: ac.signal,
          });
          if (relRes.ok) {
            const relData = await safeJson(relRes);
            relatedList = Array.isArray(relData?.products) ? relData.products : [];
          }
        }

        // loại chính nó + giới hạn
        relatedList = relatedList.filter(x => x.id !== p?.id).slice(0, 12);
        setRelated(relatedList);
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error("Load product error:", e);
          setError(e.message || "Không tải được sản phẩm");
          setProduct(null);
          setRelated([]);
        }
      } finally {
        setRelLoading(false);
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [idOrSlug]);

  const handleCategoryClick = () => {
    const subSlug = product?.subcategory_slug ?? product?.subcategory?.slug ?? null;
    const parentSlug = product?.parent_slug ?? product?.parent?.slug ?? null;

    if (subSlug) {
      navigate(`/product?sub=${encodeURIComponent(subSlug)}`);
      return;
    }
    if (parentSlug) {
      navigate(`/product?parent=${encodeURIComponent(parentSlug)}`);
    }
  };

  const handleRelatedClick = (item) => {
    navigate(`/product/product-detail/${item.slug || item.id}`);
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

      {/* sửa className: bỏ "mb-" dư, chỉ cần khoảng cách phía trên nếu cần */}
      <Breadcrumbs items={items} className="mt-20" />

      <main className="container mx-auto px-4 py-6 max-w-7xl mt-12">
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

              {/* Badge danh mục (ưu tiên parent/sub mới) */}
              {(product.parent_name || product.subcategory_name) && (
                <div className="mb-3">
                  <button
                    type="button"
                    onClick={handleCategoryClick}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800 
                               hover:bg-green-100 hover:text-green-800 transition-colors cursor-pointer"
                    title={`Xem sản phẩm trong ${
                      (product.parent_name ? product.parent_name + (product.subcategory_name ? " / " : "") : "") +
                      (product.subcategory_name || "")
                    }`}
                  >
                    {product.parent_name && <span className="mr-1">{product.parent_name}</span>}
                    {product.parent_name && product.subcategory_name && <span className="mx-1">/</span>}
                    {product.subcategory_name && <span>{product.subcategory_name}</span>}
                  </button>
                </div>
              )}

              {product.description && (
                <p className="text-gray-900 leading-relaxed">{product.description}</p>
              )}
            </div>
          </div>

          <section className="prose max-w-none">
            <h2 className="text-xl font-semibold mb-3">Nội dung</h2>
            <MarkdownOnly value={product.content || ""} />
          </section>
        </div>

        {/* Related */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {product.subcategory_name
                ? `Sản phẩm cùng loại: ${product.subcategory_name}`
                : product.parent_name
                ? `Sản phẩm thuộc: ${product.parent_name}`
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
