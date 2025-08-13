import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarNav from './components/SideBar';
import BookCard from './components/BookCard';
import FilterSortBar from './components/FilterSort';
import DashboardOverview from './components/DashBoard';
import SettingsPanel from './components/SettingPanel';
import UsersPanel from './components/UserPanel';
import useBooks from './hook/Usebook';
import useNews from './hook/Usenews';
import BookFormModal from './components/BookFormModal';
import Newscard from './components/NewsCard';
import NewsFormModal from './components/NewsFormModal';
import useAbout from './hook/Useabout';
import AboutFormModal from './components/AboutFormModal';
import AboutCard from './components/AboutCard';
import { clearAuth } from '../../../api/admin/auth';
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  const {
    books,
    loading,
    sortOptions,
    sortBy,
    setSortBy,
    genres,
    selectedGenre,
    setSelectedGenre,
    totalBooks,
    isModalOpen,
    bookToEdit,
    handleOpenModal,
    handleCloseModal,
    handleAddBook,
    handleUpdateBook,
    handleDeleteBook,
    } = useBooks();
    
    const {
      news,
      newsLoading,
      totalNews,
      isNewsModalOpen,
      newsToEdit,
      handleOpenNewsModal,
      handleCloseNewsModal,
      handleAddNews,
      handleUpdateNews,
      handleDeleteNews,
    } = useNews();

    const {
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
    } = useAbout();


    async function doLogout() {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (e) {
      console.warn('Logout API failed (continue clearing locally):', e);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      navigate('/api/admin/login', { replace: true });
    }
  }


  return (

    <div className="flex min-h-screen bg-gray-100">
      <SidebarNav activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 p-6 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Trang Quản Trị</h1>
          <button
            onClick={doLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Đăng xuất
          </button>
        </div>
      

        {activeTab === 'dashboard' && (
          <DashboardOverview 
            bookCount={books.length} 
            genreCount={genres.length} 
            aboutCount={about.length} 
          />
        )}
       

        {activeTab === 'books' && (
          <div>
            <div className="flex items-center justify-between mb-4">
            <FilterSortBar
            genres={genres}
            selectedGenre={selectedGenre}
            setSelectedGenre={setSelectedGenre}
            sortOptions={sortOptions}
            sortBy={sortBy}
            setSortBy={setSortBy}
            filtered={books.length}
            />

              <button
                onClick={() => handleOpenModal(null)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Thêm sách
              </button>
            </div>

            {loading ? (
              <p>Đang tải...</p>
            ) : books.length === 0 ? (
              <p className="text-gray-600">Không có sách phù hợp.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {books.map((book) => (
                <BookCard
                    key={book.id}
                    book={book}
                    onEdit={() => handleOpenModal(book)}
                    onDelete={handleDeleteBook}
                />
                ))}
              </div>
            )}

            <BookFormModal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              onSubmit={bookToEdit ? handleUpdateBook : handleAddBook}
              initialData={bookToEdit || {}}
            />
          </div>
        )}

{/* news */}
        {activeTab === 'news' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-700">
                Tổng số tin tức: {news.length}
              </p>
              <button
                onClick={() => handleOpenNewsModal(null)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Thêm tin tức
              </button>
            </div>

            {newsLoading ? (
              <p>Đang tải...</p>
            ) : news.length === 0 ? (
              <p className="text-gray-600">Không có tin tức.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {news.map(item => (
                  <Newscard
                    key={item.id}
                    news={item}
                    onEdit={() => handleOpenNewsModal(item)}
                    onDelete={handleDeleteNews}
                  />
                ))}
              </div>
            )}

            <NewsFormModal
              isOpen={isNewsModalOpen}
              onClose={handleCloseNewsModal}
              onSubmit={newsToEdit ? handleUpdateNews : handleAddNews}
              initialData={newsToEdit || {}}
            />
          </div>
        )}

{/* about */}
        {activeTab === 'about_us' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => handleOpenAboutModal(null)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Thêm tin tức
              </button>
            </div>

            {aboutLoading ? (
              <p>Đang tải...</p>
            ) : about.length === 0 ? (
              <p className="text-gray-600">Không có tin tức.</p>
            ) : (
              <div className="flex flex-col gap-4 w-full">
                {about.map(item => (
                  <AboutCard
                    key={item.id}
                    about={item}
                    onEdit={() => handleOpenAboutModal(item)}
                    onDelete={handleDeleteAbout}
                  />
                ))}
              </div>
            )}
            

            <AboutFormModal
              isOpen={isAboutModalOpen}
              onClose={handleCloseAboutModal}
              onSubmit={aboutToEdit ? handleUpdateAbout : handleAddAbout}
              initialData={aboutToEdit || {}}
            />
          </div>
        )}


        {activeTab === 'users' && <UsersPanel />}
        {activeTab === 'settings' && <SettingsPanel />}
      </main>
    </div>
  );
};

export default AdminDashboard;
