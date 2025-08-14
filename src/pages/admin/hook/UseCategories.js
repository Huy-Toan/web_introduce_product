import { useState, useEffect } from 'react';

const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [totalCategories, setTotalCategories] = useState(0);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const res = await fetch('/api/categories');
      const data = await res.json();

      setCategories(data.categories || []);
      // Nếu API chưa trả total, tạm lấy theo length
      setTotalCategories(
        typeof data.count === 'number' ? data.count : (data.totalCategories || (data.categories?.length ?? 0))
      );
    } catch (err) {
      console.error('fetchCategories error:', err);
      setCategories([]);
      setTotalCategories(0);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCategoryModal = (item = null) => {
    setCategoryToEdit(item);
    setIsCategoryModalOpen(true);
  };

  const handleCloseCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setCategoryToEdit(null);
  };

  const handleAddCategory = async (newItem) => {
    // newItem: { name, description, image_url } (slug để backend tự sinh khi thêm mới)
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to create category');
      }
      await fetchCategories();
      handleCloseCategoryModal();
    } catch (e) {
      console.error('handleAddCategory error:', e);
      alert(e.message || 'Không thể tạo danh mục');
    }
  };

  const handleUpdateCategory = async (updatedItem) => {
    // updatedItem: { id, name?, slug?, description?, image_url? }
    if (!updatedItem?.id) return;
    try {
      const res = await fetch(`/api/categories/${updatedItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to update category');
      }
      await fetchCategories();
      handleCloseCategoryModal();
    } catch (e) {
      console.error('handleUpdateCategory error:', e);
      alert(e.message || 'Không thể cập nhật danh mục');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!id) return;
    if (confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      try {
        const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error || 'Failed to delete category');
        }
        await fetchCategories();
      } catch (e) {
        console.error('handleDeleteCategory error:', e);
        alert(e.message || 'Không thể xóa danh mục');
      }
    }
  };

  return {
    categories,
    categoriesLoading,
    totalCategories,
    isCategoryModalOpen,
    categoryToEdit,
    fetchCategories,            
    handleOpenCategoryModal,
    handleCloseCategoryModal,
    handleAddCategory,
    handleUpdateCategory,
    handleDeleteCategory,
  };
};

export default useCategories;
