import React, { useState } from 'react';
import SidebarNav from './components/SideBar';
import BookCard from './components/BookCard';
import FilterSortBar from './components/FilterSort';
import DashboardOverview from './components/DashBoard';
import SettingsPanel from './components/SettingPanel';
import UsersPanel from './components/UserPanel';
import useBooks from './hook/Usebook';
import BookFormModal from './components/BookFormModal';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

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

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarNav activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-bold mb-6">Trang Quản Trị</h1>

        {activeTab === 'overview' && <DashboardOverview />}        

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
            total={totalBooks}
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

        {activeTab === 'users' && <UsersPanel />}
        {activeTab === 'settings' && <SettingsPanel />}
      </main>
    </div>
  );
};

export default AdminDashboard;
