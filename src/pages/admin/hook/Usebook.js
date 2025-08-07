import { useState, useEffect, useMemo } from 'react';

const useBooks = () => {
  const [books, setBooks] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [loading, setLoading] = useState(false);
  const [totalBooks, setTotalBooks] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState(null);
  
  const sortOptions = [
    { value: '', label: 'Mặc định' },
    { value: 'title_asc', label: 'Tên A-Z' },
    { value: 'title_desc', label: 'Tên Z-A' },
    { value: 'author_asc', label: 'Tác giả A-Z' },
    { value: 'author_desc', label: 'Tác giả Z-A' },
  ];

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedGenre) params.append('genre', selectedGenre);
      if (sortBy) params.append('sort', sortBy);
      const query = params.toString();

      const res = await fetch(`/api/books${query ? '?' + query : ''}`);
      const data = await res.json();

      setBooks(data.books || []);
      setTotalBooks(data.totalBooks || 0);
    } catch (err) {
      console.error(err);
      setBooks([]);
      setTotalBooks(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [selectedGenre, sortBy]);

  const handleOpenModal = (book = null) => {
    setBookToEdit(book);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setBookToEdit(null);
  };

  const handleAddBook = async (newBook) => {
    const res = await fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBook),
    });
    if (res.ok) {
      fetchBooks();
      handleCloseModal();
    }
  };

  const handleUpdateBook = async (updatedBook) => {
    const res = await fetch(`/api/books/${updatedBook.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedBook),
    });
    if (res.ok) {
      fetchBooks();
      handleCloseModal();
    }
  };

  const handleDeleteBook = async (id) => {
    if (confirm('Bạn có chắc chắn muốn xóa sách này?')) {
      const res = await fetch(`/api/books/${id}`, { method: 'DELETE' });
      if (res.ok) fetchBooks();
    }
  };

  const genres = useMemo(() => {
    const uniqueGenres = new Set();
    books.forEach((book) => {
      if (book.genre) uniqueGenres.add(book.genre);
    });
    return Array.from(uniqueGenres);
  }, [books]);

  return {
    books,
    loading,
    sortOptions,
    sortBy,
    setSortBy,
    sortOptions,
    genres,
    selectedGenre,
    setSelectedGenre,
    sortBy,
    setSortBy,
    totalBooks,
    isModalOpen,
    bookToEdit,
    handleOpenModal,
    handleCloseModal,
    handleAddBook,
    handleUpdateBook,
    handleDeleteBook,
  };
};

export default useBooks;
