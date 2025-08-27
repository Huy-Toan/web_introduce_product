import { useState, useEffect, useCallback } from 'react';
import { getToken } from '../../../../api/admin/auth';

const useField = () => {
  const [fields, setFields] = useState([]);
  const [fieldLoading, setFieldLoading] = useState(false);
  const [totalFields, setTotalFields] = useState(0);

  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [fieldToEdit, setFieldToEdit] = useState(null);

    const authHeaders = () => {
        const token = getToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

  const fetchFields = useCallback(async () => {
    try {
      setFieldLoading(true);
        const res = await fetch('/api/fields');
      const data = await res.json();

      if (!res.ok || data.ok === false) {
        console.error(data.error || 'Failed to load fields');
        setFields([]);
        setTotalFields(0);
        return;
      }

      const list = data.items || data.fields || [];
      setFields(list);
      setTotalFields(typeof data.count === 'number' ? data.count : list.length);
    } catch (err) {
      console.error(err);
      setFields([]);
      setTotalFields(0);
    } finally {
      setFieldLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFields();
  }, [fetchFields]);

  const handleOpenFieldModal = (item = null) => {
    setFieldToEdit(item);
    setIsFieldModalOpen(true);
  };

  const handleCloseFieldModal = () => {
    setIsFieldModalOpen(false);
    setFieldToEdit(null);
  };

  const handleAddField = async (newItem) => {
    // newItem: { name, content?, image_url? }
    const res = await fetch('/api/fields', {
      method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(newItem),
    });
    const data = await res.json();
    if (!res.ok || data.ok === false) {
      alert(data.error || 'Tạo lĩnh vực thất bại');
      return;
    }
    await fetchFields();
    handleCloseFieldModal();
  };

  const handleUpdateField = async (updatedItem) => {
    // updatedItem: { id, name?, content?, image_url? }
    const res = await fetch(`/api/fields/${updatedItem.id}`, {
      method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(updatedItem),
    });
    const data = await res.json();
    if (!res.ok || data.ok === false) {
      alert(data.error || 'Cập nhật lĩnh vực thất bại');
      return;
    }
    await fetchFields();
    handleCloseFieldModal();
  };

  const handleDeleteField = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mục này?')) return;
      const res = await fetch(`/api/fields/${id}`, { method: 'DELETE', headers: authHeaders() });
    const data = await res.json();
    if (!res.ok || data.ok === false) {
      alert(data.error || 'Xóa thất bại');
      return;
    }
    await fetchFields();
  };

  return {
    fields,
    fieldLoading,
    totalFields,

    isFieldModalOpen,
    fieldToEdit,

    handleOpenFieldModal,
    handleCloseFieldModal,
    handleAddField,
    handleUpdateField,
    handleDeleteField,

    fetchFields,
  };
};

export default useField;
