import { useState, useEffect } from 'react';

const useNews = () => {
  const [news, setNews] = useState([]);
  const [newsloading, setLoading] = useState(false);
  const [totalNews, setTotalNews] = useState(0);

  const [isNewsModalOpen, setIsModalOpen] = useState(false);
  const [newsToEdit, setNewsToEdit] = useState(null);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/news`);
      const data = await res.json();

      setNews(data.news || []);
      setTotalNews(data.totalNews || 0);
    } catch (err) {
      console.error(err);
      setNews([]);
      setTotalNews(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  
  const handleOpenNewsModal = (item = null) => {
    setNewsToEdit(item);
    setIsModalOpen(true);
  };

  
  const handleCloseNewsModal = () => {
    setIsModalOpen(false);
    setNewsToEdit(null);
  };

  const handleAddNews = async (newItem) => {
    const res = await fetch('/api/news', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    });
    if (res.ok) {
      fetchNews();
      handleCloseNewsModal();
    }
  };

  const handleUpdateNews = async (updatedItem) => {
    const res = await fetch(`/api/news/${updatedItem.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedItem),
    });
    if (res.ok) {
      fetchNews();
      handleCloseNewsModal();
    }
  };

  const handleDeleteNews = async (id) => {
    if (confirm('Bạn có chắc chắn muốn xóa tin tức này?')) {
      const res = await fetch(`/api/news/${id}`, { method: 'DELETE' });
      if (res.ok) fetchNews();
    }
  };

  return {
    news,
    newsloading,
    totalNews,
    isNewsModalOpen,
    newsToEdit,
    handleOpenNewsModal,
    handleCloseNewsModal,
    handleAddNews,
    handleUpdateNews,
    handleDeleteNews,
  };
};

export default useNews;
