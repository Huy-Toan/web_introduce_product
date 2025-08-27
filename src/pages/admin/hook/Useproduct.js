// src/hooks/useProducts.js
import { useEffect, useRef, useState } from 'react';

/**
 * Hook quản lý sản phẩm + CRUD + subcategories.
 *
 * - Giữ nguyên API để Form Modal đang dùng vẫn hoạt động.
 * - Thêm khả năng khởi tạo filter từ URL qua props { initialSubSlug, initialSubId }.
 * - Dùng AbortController để tránh race condition (kết quả cũ đè kết quả mới).
 *
 * BE assumptions:
 *   GET /api/products?sub_slug=<slug>&subcategory_id=<id>
 *   GET /api/sub_categories -> { subcategories: [...] }
 */
const useProducts = ({ initialSubSlug = '', initialSubId = '' } = {}) => {
  // ---------- Data ----------
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [productsLoading, setProductsLoading] = useState(false);

  // ---------- Filters (theo subcategory) ----------
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(
    initialSubId ? String(initialSubId) : ''
  );
  const [selectedSubcategorySlug, setSelectedSubcategorySlug] = useState(
    initialSubSlug || ''
  );

  // ---------- Subcategories cho UI ----------
  const [productSubcategories, setProductSubcategories] = useState([]);
  const [productSubcategoriesLoading, setProductSubcategoriesLoading] = useState(false);

  // ---------- Modal state (giữ nguyên API cho Form Modal) ----------
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  // ---------- Internal refs ----------
  const productsControllerRef = useRef(null);

  // ===== Helpers =====
  const safeAbort = (controllerRef) => {
    try {
      controllerRef.current?.abort?.();
    } catch {}
  };

  // ----- Fetch subcategories -----
  const fetchProductSubcategories = async () => {
    try {
      setProductSubcategoriesLoading(true);
      const res = await fetch('/api/sub_categories');
      const data = await res.json();
      setProductSubcategories(Array.isArray(data?.subcategories) ? data.subcategories : []);
    } catch (e) {
      console.error('fetchProductSubcategories error:', e);
      setProductSubcategories([]);
    } finally {
      setProductSubcategoriesLoading(false);
    }
  };

  // ----- Fetch products -----
  const fetchProducts = async () => {
    // Hủy request trước (nếu đang còn)
    safeAbort(productsControllerRef);
    const controller = new AbortController();
    productsControllerRef.current = controller;

    try {
      setProductsLoading(true);

      // Chuẩn hóa params gửi lên BE
      const params = new URLSearchParams();

      // Ưu tiên ID > SLUG nếu bạn muốn; hiện tại gửi cả 2 nếu có.
      if (selectedSubcategoryId) params.set('subcategory_id', String(selectedSubcategoryId));
      if (selectedSubcategorySlug) params.set('sub_slug', String(selectedSubcategorySlug));

      const qs = params.toString();
      const url = `/api/products${qs ? `?${qs}` : ''}`;

      const res = await fetch(url, { signal: controller.signal });
      const data = await res.json();

      const list = Array.isArray(data?.products) ? data.products : [];
      setProducts(list);

      // Ưu tiên count nếu có, fallback độ dài
      const total =
        typeof data?.count === 'number'
          ? data.count
          : (typeof data?.totalProducts === 'number'
              ? data.totalProducts
              : list.length);

      setTotalProducts(total);
    } catch (err) {
      if (err?.name === 'AbortError') {
        // Request bị hủy → bỏ qua
        return;
      }
      console.error('fetchProducts error:', err);
      setProducts([]);
      setTotalProducts(0);
    } finally {
      setProductsLoading(false);
    }
  };

  // ===== Effects =====
  // Load subcategories 1 lần
  useEffect(() => {
    fetchProductSubcategories();
  }, []);

  // Mỗi khi filter đổi → fetch products
  useEffect(() => {
    fetchProducts();
    // cleanup: hủy request đang chạy khi deps đổi/unmount
    return () => safeAbort(productsControllerRef);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubcategoryId, selectedSubcategorySlug]);

  // ===== Modal handlers (giữ API cũ) =====
  const openProductModal = (product = null) => {
    setProductToEdit(product);
    setIsProductModalOpen(true);
  };

  const closeProductModal = () => {
    setIsProductModalOpen(false);
    setProductToEdit(null);
  };

  // ===== CRUD =====
  // newProduct: { title, description?, content, image_url?, subcategory_id?, slug? }
  const addProduct = async (newProduct) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to add product');
      }
      await fetchProducts();
      closeProductModal();
    } catch (e) {
      console.error('addProduct error:', e);
      alert(e.message || 'Không thể thêm sản phẩm');
    }
  };

  // updatedProduct: { id, title?, slug?, description?, content?, image_url?, subcategory_id? }
  const updateProduct = async (updatedProduct) => {
    if (!updatedProduct?.id) return;
    try {
      const res = await fetch(`/api/products/${updatedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to update product');
      }
      await fetchProducts();
      closeProductModal();
    } catch (e) {
      console.error('updateProduct error:', e);
      alert(e.message || 'Không thể cập nhật sản phẩm');
    }
  };

  const deleteProduct = async (id) => {
    if (!id) return;
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to delete product');
      }
      await fetchProducts();
    } catch (e) {
      console.error('deleteProduct error:', e);
      alert(e.message || 'Không thể xóa sản phẩm');
    }
  };

  return {
    // data
    products,
    totalProducts,
    productsLoading,

    // subcategories (for filter UI)
    productSubcategories,
    productSubcategoriesLoading,

    // filters
    selectedSubcategoryId,
    setSelectedSubcategoryId,
    selectedSubcategorySlug,
    setSelectedSubcategorySlug,

    // modal
    isProductModalOpen,
    productToEdit,
    openProductModal,
    closeProductModal,

    // CRUD
    addProduct,
    updateProduct,
    deleteProduct,

    // fetchers
    fetchProducts,
    fetchProductSubcategories,
  };
};

export default useProducts;
