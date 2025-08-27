// src/hooks/useParentCategories.js
import { useState, useEffect } from 'react';

const useParentCategories = () => {
  const [parents, setParents] = useState([]);
  const [parentsLoading, setParentsLoading] = useState(false);
  const [totalParents, setTotalParents] = useState(0);

  const [isParentModalOpen, setIsParentModalOpen] = useState(false);
  const [parentToEdit, setParentToEdit] = useState(null);

  // GET /api/parent_categories?limit=&offset=
  const fetchParents = async (opts = {}) => {
    const { limit, offset } = opts || {};
    const qs = new URLSearchParams();
    if (Number.isFinite(limit)) qs.set('limit', String(limit));
    if (Number.isFinite(offset)) qs.set('offset', String(offset));

    try {
      setParentsLoading(true);
      const res = await fetch(`/api/parent_categories${qs.toString() ? `?${qs.toString()}` : ''}`);
      const data = await res.json();

      setParents(data.parents || []);
      setTotalParents(
        typeof data.count === 'number'
          ? data.count
          : (data.totalParents || (data.parents?.length ?? 0))
      );
    } catch (err) {
      console.error('fetchParents error:', err);
      setParents([]);
      setTotalParents(0);
    } finally {
      setParentsLoading(false);
    }
  };

  useEffect(() => {
    fetchParents();
  }, []);

  const handleOpenParentModal = (item = null) => {
    setParentToEdit(item);
    setIsParentModalOpen(true);
  };

  const handleCloseParentModal = () => {
    setIsParentModalOpen(false);
    setParentToEdit(null);
  };

  // POST /api/parent_categories
  // newItem: { name, description?, image_url?, slug? (optional; backend sẽ tự sinh nếu không truyền) }
  const handleAddParent = async (newItem) => {
    try {
      const res = await fetch('/api/parent_categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to create parent category');
      }
      await fetchParents();
      handleCloseParentModal();
    } catch (e) {
      console.error('handleAddParent error:', e);
      alert(e.message || 'Không thể tạo danh mục cha');
    }
  };

  // PUT /api/parent_categories/:id
  // updatedItem: { id, name?, slug?, description?, image_url? }
  const handleUpdateParent = async (updatedItem) => {
    if (!updatedItem?.id) return;
    try {
      const res = await fetch(`/api/parent_categories/${updatedItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to update parent category');
      }
      await fetchParents();
      handleCloseParentModal();
    } catch (e) {
      console.error('handleUpdateParent error:', e);
      alert(e.message || 'Không thể cập nhật danh mục cha');
    }
  };

  // DELETE /api/parent_categories/:id
  const handleDeleteParent = async (id) => {
    if (!id) return;
    if (confirm('Bạn có chắc chắn muốn xóa danh mục cha này? (Sẽ xóa cả danh mục con do ràng buộc CASCADE)')) {
      try {
        const res = await fetch(`/api/parent_categories/${id}`, { method: 'DELETE' });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error || 'Failed to delete parent category');
        }
        await fetchParents();
      } catch (e) {
        console.error('handleDeleteParent error:', e);
        alert(e.message || 'Không thể xóa danh mục cha');
      }
    }
  };

  return {
    // data
    parents,
    parentsLoading,
    totalParents,

    // modal/edit
    isParentModalOpen,
    parentToEdit,
    handleOpenParentModal,
    handleCloseParentModal,

    // actions
    fetchParents,
    handleAddParent,
    handleUpdateParent,
    handleDeleteParent,
  };
};

export default useParentCategories;
