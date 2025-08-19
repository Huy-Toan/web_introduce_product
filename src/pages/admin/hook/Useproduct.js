// src/hooks/useProducts.js
import { useState, useEffect } from 'react';

const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [productsLoading, setProductsLoading] = useState(false);

  // Filters (theo subcategory)
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState('');
  const [selectedSubcategorySlug, setSelectedSubcategorySlug] = useState('');

  // Subcategories for filter UI
  const [productSubcategories, setProductSubcategories] = useState([]);
  const [productSubcategoriesLoading, setProductSubcategoriesLoading] = useState(false);

  // Modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  // -------- Fetch helpers --------
  // Lấy danh mục con (có thể mở rộng thêm filter parent_id/parent_slug nếu cần)
  const fetchProductSubcategories = async () => {
    try {
      setProductSubcategoriesLoading(true);
      const res = await fetch('/api/sub_categories');
      const data = await res.json();
      // API trả về { subcategories: [...] }
      setProductSubcategories(data?.subcategories || []);
    } catch (e) {
      console.error('fetchProductSubcategories error:', e);
      setProductSubcategories([]);
    } finally {
      setProductSubcategoriesLoading(false);
    }
  };

  // Lấy sản phẩm, filter theo subcategory
  const fetchProducts = async () => {
    try {
      setProductsLoading(true);

      const params = new URLSearchParams();
      if (selectedSubcategoryId) params.append('subcategory_id', String(selectedSubcategoryId));
      if (selectedSubcategorySlug) params.append('sub_slug', String(selectedSubcategorySlug));
      const query = params.toString();

      const res = await fetch(`/api/products${query ? `?${query}` : ''}`);
      const data = await res.json();

      // API trả về { products: [...] }
      setProducts(data?.products || []);
      setTotalProducts(
        typeof data?.count === 'number'
          ? data.count
          : (data?.totalProducts ?? (data?.products?.length || 0))
      );
    } catch (err) {
      console.error('fetchProducts error:', err);
      setProducts([]);
      setTotalProducts(0);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductSubcategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedSubcategoryId, selectedSubcategorySlug]);

  // -------- Modal handlers --------
  const openProductModal = (product = null) => {
    setProductToEdit(product);
    setIsProductModalOpen(true);
  };

  const closeProductModal = () => {
    setIsProductModalOpen(false);
    setProductToEdit(null);
  };

  // newProduct nên dùng { title, description?, content, image_url?, subcategory_id?, slug? }
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
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
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
