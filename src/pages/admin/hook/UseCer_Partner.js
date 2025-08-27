// src/hooks/useCerPartner.js
import { useState, useEffect, useCallback } from "react";
import { getToken } from '../../../../api/admin/auth';
const API_BASE = "/api/cer-partners";
const normalizeType = (t) => (t || "").toString().trim().toLowerCase();

/**
 * Hook quản lý Certifications/Partners
 */
const useCerPartner = () => {
  // State với prefix rõ ràng
  const [itemsCerPartner, setItemsCerPartner] = useState([]);
  const [loadingCerPartner, setLoadingCerPartner] = useState(false);
  const [totalCerPartner, setTotalCerPartner] = useState(0);

  const [currentTypeCerPartner, setCurrentTypeCerPartner] = useState("");
  const [isModalOpenCerPartner, setIsModalOpenCerPartner] = useState(false);
  const [editingItemCerPartner, setEditingItemCerPartner] = useState(null);
    const authHeaders = () => {
        const token = getToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
    };
  /** Lấy tất cả CerPartner */
  const getAllCerPartners = useCallback(async () => {
    try {
      setLoadingCerPartner(true);
        const res = await fetch(API_BASE);
      const data = await res.json();
      if (!res.ok || data.ok === false) {
        console.error(data.error || "Failed to load cer_partner");
        setItemsCerPartner([]);
        setTotalCerPartner(0);
        return { ok: false, error: data.error };
      }
      const list = data.items || [];
      setItemsCerPartner(list);
      setTotalCerPartner(
        typeof data.count === "number" ? data.count : list.length
      );
      return { ok: true, items: list };
    } catch (err) {
      console.error(err);
      setItemsCerPartner([]);
      setTotalCerPartner(0);
      return { ok: false, error: err.message };
    } finally {
      setLoadingCerPartner(false);
    }
  }, []);

  /** Lấy CerPartner theo type */
  const getCerPartnersByType = useCallback(
    async (type) => {
      const t = normalizeType(type);
      if (!t) {
        const r = await getAllCerPartners();
        setCurrentTypeCerPartner("");
        return r;
      }
      try {
        setLoadingCerPartner(true);
          const res = await fetch(`${API_BASE}/type/${encodeURIComponent(t)}`, {
              headers: authHeaders(),
          });
        const data = await res.json();
        if (!res.ok || data.ok === false) {
          console.error(data.error || "Failed to load cer_partner by type");
          setItemsCerPartner([]);
          setTotalCerPartner(0);
          return { ok: false, error: data.error };
        }
        const list = data.items || [];
        setItemsCerPartner(list);
        setTotalCerPartner(
          typeof data.count === "number" ? data.count : list.length
        );
        setCurrentTypeCerPartner(t);
        return { ok: true, items: list, type: t };
      } catch (err) {
        console.error(err);
        setItemsCerPartner([]);
        setTotalCerPartner(0);
        return { ok: false, error: err.message };
      } finally {
        setLoadingCerPartner(false);
      }
    },
    [getAllCerPartners]
  );

  // mặc định load tất cả
  useEffect(() => {
    getAllCerPartners();
  }, [getAllCerPartners]);

  /** UI helpers */
  const openCerPartnerModal = (item = null) => {
    setEditingItemCerPartner(item);
    setIsModalOpenCerPartner(true);
  };
  const closeCerPartnerModal = () => {
    setIsModalOpenCerPartner(false);
    setEditingItemCerPartner(null);
  };

  /** Tạo mới */
  const createCerPartner = async (payload) => {
    const res = await fetch(API_BASE, {
      method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || data.ok === false) {
      alert(data.error || "Tạo mục thất bại");
      return { ok: false, error: data.error };
    }
    if (currentTypeCerPartner) await getCerPartnersByType(currentTypeCerPartner);
    else await getAllCerPartners();
    closeCerPartnerModal();
    return { ok: true, item: data.item };
  };

  /** Cập nhật */
  const updateCerPartner = async (payload) => {
    const res = await fetch(`${API_BASE}/${payload.id}`, {
      method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || data.ok === false) {
      alert(data.error || "Cập nhật thất bại");
      return { ok: false, error: data.error };
    }
    if (currentTypeCerPartner) await getCerPartnersByType(currentTypeCerPartner);
    else await getAllCerPartners();
    closeCerPartnerModal();
    return { ok: true, item: data.item };
  };

  /** Xoá */
  const deleteCerPartner = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xoá mục này?"))
      return { ok: false, canceled: true };
      const res = await fetch(`${API_BASE}/${id}`, {
          method: "DELETE",
          headers: authHeaders(),
      });
    const data = await res.json();
    if (!res.ok || data.ok === false) {
      alert(data.error || "Xoá thất bại");
      return { ok: false, error: data.error };
    }
    if (currentTypeCerPartner) await getCerPartnersByType(currentTypeCerPartner);
    else await getAllCerPartners();
    return { ok: true };
  };

  const setTypeAndFetchCerPartners = (t) => getCerPartnersByType(t);

  return {
    // data
    itemsCerPartner,
    loadingCerPartner,
    totalCerPartner,
    currentTypeCerPartner,

    // modal/edit
    isModalOpenCerPartner,
    editingItemCerPartner,
    openCerPartnerModal,
    closeCerPartnerModal,

    // actions
    getAllCerPartners,
    getCerPartnersByType,
    createCerPartner,
    updateCerPartner,
    deleteCerPartner,
    setTypeAndFetchCerPartners,
  };
};

export default useCerPartner;
