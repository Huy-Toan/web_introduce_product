// src/hooks/useSubCategories.js
import { useEffect, useState } from 'react';

const useSubCategories = () => {
  const [subcategories, setSubcategories] = useState([]);
  const [subcategoriesLoading, setSubcategoriesLoading] = useState(false);
  const [totalSubcategories, setTotalSubcategories] = useState(0);

  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [subToEdit, setSubToEdit] = useState(null);

  // Lưu bộ lọc hiện tại để reload sau khi CRUD
  const [currentParentFilter, setCurrentParentFilter] = useState({
    parent_id: undefined,
    parent_slug: undefined,
  });

  // GET /api/sub_categories?parent_id=&parent_slug=&limit=&offset=
  const fetchSubCategories = async (opts = {}) => {
    const { parent_id, parent_slug, limit, offset } = opts || {};
    const qs = new URLSearchParams();
    if (Number.isFinite(parent_id)) qs.set('parent_id', String(parent_id));
    if (typeof parent_slug === 'string' && parent_slug.trim())
      qs.set('parent_slug', parent_slug.trim());
    if (Number.isFinite(limit)) qs.set('limit', String(limit));
    if (Number.isFinite(offset)) qs.set('offset', String(offset));

    try {
      setSubcategoriesLoading(true);
      const res = await fetch(`/api/sub_categories${qs.toString() ? `?${qs.toString()}` : ''}`);
      const data = await res.json();

      setSubcategories(data.subcategories || []);
      setTotalSubcategories(
        typeof data.count === 'number'
          ? data.count
          : (data.totalSubcategories || (data.subcategories?.length ?? 0))
      );

      // Cập nhật filter hiện tại (để CRUD xong reload đúng)
      setCurrentParentFilter({
        parent_id: Number.isFinite(parent_id) ? parent_id : undefined,
        parent_slug: typeof parent_slug === 'string' && parent_slug.trim() ? parent_slug.trim() : undefined,
      });
    } catch (err) {
      console.error('fetchSubCategories error:', err);
      setSubcategories([]);
      setTotalSubcategories(0);
    } finally {
      setSubcategoriesLoading(false);
    }
  };

  // Mặc định load tất cả (không filter)
  useEffect(() => {
    fetchSubCategories();
  }, []);

  const handleOpenSubModal = (item = null) => {
    setSubToEdit(item);
    setIsSubModalOpen(true);
  };

  const handleCloseSubModal = () => {
    setIsSubModalOpen(false);
    setSubToEdit(null);
  };

  // POST /api/sub_categories
  // newItem: { parent_id (required), name, description?, image_url?, slug? }
  const handleAddSub = async (newItem) => {
    try {
      const res = await fetch('/api/sub_categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to create subcategory');
      }
      // reload với filter hiện tại
      await fetchSubCategories(currentParentFilter);
      handleCloseSubModal();
    } catch (e) {
      console.error('handleAddSub error:', e);
      alert(e.message || 'Không thể tạo danh mục con');
    }
  };

  // PUT /api/sub_categories/:id
  // updatedItem: { id, parent_id?, name?, slug?, description?, image_url? }
  const handleUpdateSub = async (updatedItem) => {
    if (!updatedItem?.id) return;
    try {
      const res = await fetch(`/api/sub_categories/${updatedItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to update subcategory');
      }
      await fetchSubCategories(currentParentFilter);
      handleCloseSubModal();
    } catch (e) {
      console.error('handleUpdateSub error:', e);
      alert(e.message || 'Không thể cập nhật danh mục con');
    }
  };

  // DELETE /api/sub_categories/:id
  const handleDeleteSub = async (id) => {
    if (!id) return;
    if (confirm('Bạn có chắc chắn muốn xóa danh mục con này?')) {
      try {
        const res = await fetch(`/api/sub_categories/${id}`, { method: 'DELETE' });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error || 'Failed to delete subcategory');
        }
        await fetchSubCategories(currentParentFilter);
      } catch (e) {
        console.error('handleDeleteSub error:', e);
        alert(e.message || 'Không thể xóa danh mục con');
      }
    }
  };

  // Helper nhanh: set filter & fetch
  const setParentAndFetch = async ({ parent_id, parent_slug, limit, offset } = {}) => {
    await fetchSubCategories({ parent_id, parent_slug, limit, offset });
  };

  return {
    // data
    subcategories,
    subcategoriesLoading,
    totalSubcategories,

    // current filter
    currentParentFilter,
    setParentAndFetch,

    // modal/edit
    isSubModalOpen,
    subToEdit,
    handleOpenSubModal,
    handleCloseSubModal,

    // actions
    fetchSubCategories,
    handleAddSub,
    handleUpdateSub,
    handleDeleteSub,
  };
};

export default useSubCategories;
