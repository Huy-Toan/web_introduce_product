import { useState, useEffect } from 'react';

const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [productsLoading, setProductsLoading] = useState(false);

  // Filters
  const [selectedProductCategoryId, setSelectedProductCategoryId] = useState('');
  const [selectedProductCategorySlug, setSelectedProductCategorySlug] = useState('');

  // Categories for filter UI
  const [productCategories, setProductCategories] = useState([]);
  const [productCategoriesLoading, setProductCategoriesLoading] = useState(false);

  // Modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  // -------- Fetch helpers --------
  const fetchProductCategories = async () => {
    try {
      setProductCategoriesLoading(true);
      const res = await fetch('/api/categories');
      const data = await res.json();
      setProductCategories(data?.categories || []);
    } catch (e) {
      console.error('fetchProductCategories error:', e);
      setProductCategories([]);
    } finally {
      setProductCategoriesLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);

      const params = new URLSearchParams();
      if (selectedProductCategoryId) params.append('category_id', String(selectedProductCategoryId));
      if (selectedProductCategorySlug) params.append('category_slug', String(selectedProductCategorySlug));
      const query = params.toString();

      const res = await fetch(`/api/products${query ? `?${query}` : ''}`);
      const data = await res.json();
      console.log("Fetched products:", data);

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
    fetchProductCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedProductCategoryId, selectedProductCategorySlug]);

  // -------- Modal handlers --------
  const openProductModal = (product = null) => {
    setProductToEdit(product);
    setIsProductModalOpen(true);
  };

  const closeProductModal = () => {
    setIsProductModalOpen(false);
    setProductToEdit(null);
  };

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

  // updatedProduct: { id, title?, slug?, description?, content?, image_url?, category_id? }
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

    // categories
    productCategories,
    productCategoriesLoading,

    // filters
    selectedProductCategoryId,
    setSelectedProductCategoryId,
    selectedProductCategorySlug,
    setSelectedProductCategorySlug,

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
    fetchProductCategories,
  };
};

export default useProducts;
