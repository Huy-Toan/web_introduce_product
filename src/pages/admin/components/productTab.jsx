import React from "react";
import ProductCard from "./ProductCard";
import ProductFormModal from "./ProductFormModal";

function ProductsTab({
  products = [],
  productsLoading = false,
  openProductModal,
  closeProductModal,
  isProductModalOpen,
  productToEdit,
  addProduct,
  updateProduct,
  deleteProduct,
}) {
  const PAGE_SIZE = 9;
  const [page, setPage] = React.useState(1);
  const topRef = React.useRef(null);

  const total = products.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  React.useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const startIdx = (page - 1) * PAGE_SIZE;
  const currentItems = React.useMemo(
    () => products.slice(startIdx, startIdx + PAGE_SIZE),
    [products, startIdx]
  );

  const goToPage = (n) => {
    if (n < 1 || n > pageCount) return;
    setPage(n);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const pageNumbers = React.useMemo(() => {
    if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
    const s = new Set([1, 2, page - 1, page, page + 1, pageCount - 1, pageCount]);
    return [...s].filter(n => n >= 1 && n <= pageCount).sort((a, b) => a - b);
  }, [page, pageCount]);

  const handleDelete = (id) => {
    // sau khi xóa, nếu trang hiện tại rỗng thì lùi 1 trang
    const willRemain = currentItems.length - 1;
    deleteProduct(id);
    if (willRemain === 0 && page > 1) {
      setTimeout(() => goToPage(page - 1), 0);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4" ref={topRef}>
        <button
          onClick={() => openProductModal(null)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer"
        >
          Thêm sản phẩm
        </button>

        <div className="text-sm text-gray-600">
          {total > 0 && (
            <>
              Hiển thị <b>{startIdx + 1}</b>–<b>{Math.min(startIdx + PAGE_SIZE, total)}</b> / <b>{total}</b> sản phẩm
            </>
          )}
        </div>
      </div>

      {productsLoading ? (
        <p>Đang tải...</p>
      ) : total === 0 ? (
        <p className="text-gray-600">Không có sản phẩm.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentItems.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                onEdit={() => openProductModal(item)}
                onDelete={() => handleDelete(item.id)}
              />
            ))}
          </div>

          {pageCount > 1 && (
            <nav className="flex items-center justify-center gap-1 mt-6 select-none" aria-label="Pagination">
              <button
                className="px-3 py-1 rounded border bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
              >
                Trước
              </button>

              {pageNumbers.map((n, i) => {
                const prev = pageNumbers[i - 1];
                const needDots = prev && n - prev > 1;
                return (
                  <React.Fragment key={n}>
                    {needDots && <span className="px-2 text-gray-500">…</span>}
                    <button
                      className={[
                        "px-3 py-1 rounded border",
                        n === page
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 hover:bg-gray-100",
                      ].join(" ")}
                      onClick={() => goToPage(n)}
                      aria-current={n === page ? "page" : undefined}
                    >
                      {n}
                    </button>
                  </React.Fragment>
                );
              })}

              <button
                className="px-3 py-1 rounded border bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                onClick={() => goToPage(page + 1)}
                disabled={page === pageCount}
              >
                Sau
              </button>
            </nav>
          )}
        </>
      )}

      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={closeProductModal}
        onSubmit={productToEdit ? updateProduct : addProduct}
        initialData={productToEdit || {}}
      />
    </div>
  );
}

export default ProductsTab;
