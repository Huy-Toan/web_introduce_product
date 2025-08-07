import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save,
  X,
  BookOpen,
  Users,
  Home,
  Settings,
  Loader,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('books');
  const [loading, setLoading] = useState(false);
  
  // Sử dụng relative URLs vì API đã được deploy trên cùng domain
  
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sortBy, setSortBy] = useState('');

  const [showBookModal, setShowBookModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    genre: '',
    description: '',
    image_url: '',
  });

  const navItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: Home },
    { id: 'books', label: 'Sách', icon: BookOpen },
    { id: 'users', label: 'Người dùng', icon: Users },
    { id: 'settings', label: 'Cài đặt', icon: Settings }
  ];

  const genres = ['Fiction', 'Dystopian', 'Romance', 'Mystery', 'Sci-Fi', 'Biography', 'History'];
  const sortOptions = [
    { value: '', label: 'Mặc định' },
    { value: 'title_asc', label: 'Tên A-Z' },
    { value: 'title_desc', label: 'Tên Z-A' },
    { value: 'author_asc', label: 'Tác giả A-Z' },
    { value: 'author_desc', label: 'Tác giả Z-A' },
  ];

  // API Functions
  const fetchBooks = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (selectedGenre) params.append('genre', selectedGenre);
      if (sortBy) params.append('sort', sortBy);
      
      const queryString = params.toString();
      const url = `/api/books${queryString ? '?' + queryString : ''}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch books');
      
      const data = await response.json();
      const booksData = data.books || [];
      
      setBooks(booksData);
      setFilteredBooks(booksData);
      
      console.log('Fetched books:', data); 
      
    } catch (error) {
      console.error('Error fetching books:', error);
      // Fallback data nếu API lỗi
      const fallbackBooks = [
        {
          id: 1,
          title: "To Kill a Mockingbird",
          author: "Harper Lee",
          genre: "Fiction",
          description: "A classic American novel about racial injustice and moral growth.",
          image_url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
          published_year: 1960
        }
      ];
      
      setBooks(fallbackBooks);
      setFilteredBooks(fallbackBooks);
      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [selectedGenre, sortBy]);

  // Book Functions
  const handleAddBook = () => {
    setEditingBook(null);
    setBookForm({
      title: '',
      author: '',
      genre: '',
      description: '',
      image_url: ''
    });
    setShowBookModal(true);
  };

  const handleEditBook = (book) => {
    setEditingBook(book);
    setBookForm({
      title: book.title,
      author: book.author,
      genre: book.genre,
      description: book.description || '',
      image_url: book.image_url || ''
    });
    setShowBookModal(true);
  };

const handleDeleteBook = async (bookId) => {
  if (confirm('Bạn có chắc chắn muốn xóa sách này?')) {
    try {
      setLoading(true);
      const response = await fetch(`/api/books/${bookId}`, {
        method: 'DELETE',
      });


      const data = await response.json();

      if (!response.ok) {
        console.error("Lỗi server:", data);
        throw new Error(data?.error || 'Failed to delete book');
      }

      const updatedBooks = books.filter(b => b.id !== bookId);
      setBooks(updatedBooks);
      setFilteredBooks(updatedBooks);

      alert('Xóa sách thành công!');

    } catch (error) {
      console.error('Lỗi khi xoá:', error);
      alert('Lỗi khi xóa sách: ' + error.message);
    } finally {
      setLoading(false);
    }
  }
};


  const handleSaveBook = async () => {
    if (!bookForm.title || !bookForm.author || !bookForm.genre) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc (Tên sách, Tác giả, Thể loại)');
      return;
    }

    try {
      setLoading(true);
      const method = editingBook ? 'PUT' : 'POST';
      const url = editingBook 
        ? `/api/books/${editingBook.id}` 
        : `/api/books`;

      // Chỉ gửi các field có trong database
      const payload = {
        title: bookForm.title,
        author: bookForm.author,
        genre: bookForm.genre,
        description: bookForm.description,
        image_url: bookForm.image_url
      };

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to save book');
      
      const result = await response.json();
      const savedBook = result.book;

      // Cập nhật state local
      if (editingBook) {
        const updatedBooks = books.map(b => 
          b.id === editingBook.id ? savedBook : b
        );
        setBooks(updatedBooks);
        setFilteredBooks(updatedBooks);
      } else {
        const newBooks = [...books, savedBook];
        setBooks(newBooks);
        setFilteredBooks(newBooks);
      }

      setShowBookModal(false);
      alert(editingBook ? 'Cập nhật sách thành công!' : 'Thêm sách thành công!');
      
    } catch (error) {
      console.error('Error saving book:', error);
      alert('Lỗi khi lưu sách!');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (genre) => {
    setSelectedGenre(genre);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-800">Books Admin</h1>
        </div>
        
        <nav className="mt-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                  activeTab === item.id 
                    ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={20} className="mr-3" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Tổng quan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-lg mr-4">
                    <BookOpen className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Tổng số sách</h3>
                    <p className="text-2xl font-bold text-blue-600">{books.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-lg mr-4">
                    <Users className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Thể loại</h3>
                    <p className="text-2xl font-bold text-green-600">
                      {new Set(books.map(b => b.genre)).size}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-3 rounded-lg mr-4">
                    <Settings className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Trạng thái</h3>
                    <p className="text-2xl font-bold text-purple-600">Hoạt động</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Books Tab */}
        {activeTab === 'books' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Quản lý sách</h2>
              <button
                onClick={handleAddBook}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus size={20} />
                Thêm sách
              </button>
            </div>

            {/* Filter and Sort Controls */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Filter size={20} className="text-gray-500" />
                  <select
                    value={selectedGenre}
                    onChange={(e) => handleFilterChange(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tất cả thể loại</option>
                    {genres.map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <SortAsc size={20} className="text-gray-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-sm text-gray-600">
                  Hiển thị {filteredBooks.length} / {books.length} sách
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full flex items-center justify-center py-12">
                  <Loader className="animate-spin text-blue-600" size={32} />
                  <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
                </div>
              ) : filteredBooks.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <BookOpen size={48} className="text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {selectedGenre ? `Không có sách nào thuộc thể loại "${selectedGenre}"` : 'Chưa có sách nào'}
                  </p>
                </div>
              ) : (
                filteredBooks.map(book => (
                <div key={book.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <img
                    src={book.image_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop'}
                    alt={book.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop';
                    }}
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{book.title}</h3>
                    <p className="text-sm text-green-600 mb-1">Tác giả: {book.author}</p>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        {book.genre}
                      </span>
                      {book.published_year && (
                        <span className="text-sm text-gray-500">{book.published_year}</span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {book.description || 'Chưa có mô tả'}
                    </p>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditBook(book)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded flex items-center justify-center gap-1"
                      >
                        <Edit2 size={16} />
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteBook(book.id)}
                        className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 px-3 rounded flex items-center justify-center gap-1"
                      >
                        <Trash2 size={16} />
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))
              )}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quản lý người dùng</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600">Tính năng quản lý người dùng sẽ được phát triển sau...</p>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Cài đặt</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">API Configuration</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Endpoints
                  </label>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-600 mb-1">GET /api/books - Lấy danh sách sách</p>
                    <p className="text-sm text-gray-600 mb-1">GET /api/books/:id - Chi tiết sách</p>
                    <p className="text-sm text-gray-600 mb-1">POST /api/books - Thêm sách mới</p>
                    <p className="text-sm text-gray-600 mb-1">PUT /api/books/:id - Cập nhật sách</p>
                    <p className="text-sm text-gray-600">DELETE /api/books/:id - Xóa sách</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Book Modal */}
      {showBookModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                {editingBook ? 'Chỉnh sửa sách' : 'Thêm sách mới'}
              </h3>
              <button
                onClick={() => setShowBookModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên sách *
                </label>
                <input
                  type="text"
                  value={bookForm.title}
                  onChange={(e) => setBookForm({...bookForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tên sách"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tác giả *
                </label>
                <input
                  type="text"
                  value={bookForm.author}
                  onChange={(e) => setBookForm({...bookForm, author: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tên tác giả"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thể loại *
                </label>
                <select
                  value={bookForm.genre}
                  onChange={(e) => setBookForm({...bookForm, genre: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn thể loại</option>
                  {genres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={bookForm.description}
                  onChange={(e) => setBookForm({...bookForm, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mô tả về nội dung sách"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL hình ảnh bìa
                </label>
                <input
                  type="url"
                  value={bookForm.image_url}
                  onChange={(e) => setBookForm({...bookForm, image_url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/book-cover.jpg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 p-4 border-t">
              <button
                onClick={() => setShowBookModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveBook}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
                {editingBook ? 'Cập nhật' : 'Thêm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;