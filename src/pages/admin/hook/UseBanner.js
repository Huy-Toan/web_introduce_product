import { useState, useEffect, useCallback } from 'react';

const useBanner = () => {
  const [banners, setBanners] = useState([]);
  const [bannerLoading, setBannerLoading] = useState(false);
  const [totalBanner, setTotalBanner] = useState(0);

  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [bannerToEdit, setBannerToEdit] = useState(null);

  const fetchBanner = useCallback(async () => {
    try {
      setBannerLoading(true);
      const res = await fetch(`/api/banners`);
      const data = await res.json();
      if (!res.ok || data.ok === false) {
        console.error(data.error || "Failed to load banners");
        setBanners([]);
        setTotalBanner(0);
        return;
      }
      // hỗ trợ cả items (mới) hoặc banners (cũ)
      const list = data.items || data.banners || [];
      setBanners(list);
      setTotalBanner(typeof data.count === 'number' ? data.count : list.length);
    } catch (err) {
      console.error(err);
      setBanners([]);
      setTotalBanner(0);
    } finally {
      setBannerLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanner();
  }, [fetchBanner]);

  const handleOpenBannerModal = (item = null) => {
    setBannerToEdit(item);
    setIsBannerModalOpen(true);
  };

  const handleCloseBannerModal = () => {
    setIsBannerModalOpen(false);
    setBannerToEdit(null);
  };

  const handleAddBanner = async (newItem) => {
    const res = await fetch('/api/banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    });
    const data = await res.json();
    if (!res.ok || data.ok === false) {
      alert(data.error || 'Tạo banner thất bại');
      return;
    }
    await fetchBanner();
    handleCloseBannerModal();
  };

  const handleUpdateBanner = async (updatedItem) => {
    const res = await fetch(`/api/banners/${updatedItem.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedItem),
    });
    const data = await res.json();
    if (!res.ok || data.ok === false) {
      alert(data.error || 'Cập nhật banner thất bại');
      return;
    }
    await fetchBanner();
    handleCloseBannerModal();
  };

  const handleDeleteBanner = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mục này?')) return;
    const res = await fetch(`/api/banners/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok || data.ok === false) {
      alert(data.error || 'Xóa thất bại');
      return;
    }
    await fetchBanner();
  };

  return {
    banners,
    bannerLoading,
    totalBanner,
    isBannerModalOpen,
    bannerToEdit,
    handleOpenBannerModal,
    handleCloseBannerModal,
    handleAddBanner,
    handleUpdateBanner,
    handleDeleteBanner,
    fetchBanner,
  };
};

export default useBanner;
