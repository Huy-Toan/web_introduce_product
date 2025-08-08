import { useState, useEffect } from 'react';

const useAbout = () => {
  const [about, setAbout] = useState([]);
  const [aboutLoading, setAboutLoading] = useState(false);
  const [totalAbout, setTotalAbout] = useState(0);

  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [aboutToEdit, setAboutToEdit] = useState(null);

  const fetchAbout = async () => {
    try {
      setAboutLoading(true);
      const res = await fetch(`/api/about`);
      const data = await res.json();

      setAbout(data.about || []);
      setTotalAbout(data.totalAbout || 0);
    } catch (err) {
      console.error(err);
      setAbout([]);
      setTotalAbout(0);
    } finally {
      setAboutLoading(false);
    }
  };

  useEffect(() => {
    fetchAbout();
  }, []);

  const handleOpenAboutModal = (item = null) => {
    setAboutToEdit(item);
    setIsAboutModalOpen(true);
  };

  const handleCloseAboutModal = () => {
    setIsAboutModalOpen(false);
    setAboutToEdit(null);
  };

  const handleAddAbout = async (newItem) => {
    const res = await fetch('/api/about', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    });
    if (res.ok) {
      fetchAbout();
      handleCloseAboutModal();
    }
  };

  const handleUpdateAbout = async (updatedItem) => {
    const res = await fetch(`/api/about/${updatedItem.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedItem),
    });
    if (res.ok) {
      fetchAbout();
      handleCloseAboutModal();
    }
  };

  const handleDeleteAbout = async (id) => {
    if (confirm('Bạn có chắc chắn muốn xóa mục này?')) {
      const res = await fetch(`/api/about/${id}`, { method: 'DELETE' });
      if (res.ok) fetchAbout();
    }
  };

  return {
    about,
    aboutLoading,
    totalAbout,
    isAboutModalOpen,
    aboutToEdit,
    handleOpenAboutModal,
    handleCloseAboutModal,
    handleAddAbout,
    handleUpdateAbout,
    handleDeleteAbout,
  };
};

export default useAbout;
