import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarNav from './components/SideBar';
import DashboardOverview from './components/DashBoard';
import ContactsPanel from './components/ContactsPanel';
import UsersPanel from './components/UserPanel';
import useNews from './hook/Usenews';
import Newscard from './components/NewsCard';
import NewsFormModal from './components/NewsFormModal';
import useAbout from './hook/Useabout';
import AboutFormModal from './components/AboutFormModal';
import AboutCard from './components/AboutCard';
import CategoriesCard from './components/CategoriesCard';
import CategoriesFormModal from './components/CategoriesFormModal';
import useCategories from './hook/UseCategories';
import ProductCard from './components/ProductCard';
import ProductFormModal from './components/ProductFormModal';
import useProducts from './hook/Useproduct';
import BannerCard from './components/BannerCard';
import BannerFormModal from './components/BannerFormModal';
import useBanner from './hook/UseBanner';

import { clearAuth } from '../../../api/admin/auth';
import { Ban, Cat } from 'lucide-react';
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  const {
      news,
      newsLoading,
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
      isAboutModalOpen,
      aboutToEdit,
      handleOpenAboutModal,
      handleCloseAboutModal,
      handleAddAbout,
      handleUpdateAbout,
      handleDeleteAbout,
    } = useAbout();

    const {
      categories,
      categoriesLoading,
      isCategoryModalOpen,
      categoryToEdit,          
      handleOpenCategoryModal,
      handleCloseCategoryModal,
      handleAddCategory,
      handleUpdateCategory,
      handleDeleteCategory,
    } = useCategories();

    const {
      products,
      productsLoading,

      // modal
      isProductModalOpen,
      productToEdit,
      openProductModal,
      closeProductModal,

      // CRUD
      addProduct,
      updateProduct,
      deleteProduct,

    } = useProducts();

    const {
      banners,
      bannerLoading,
      isBannerModalOpen,
      bannerToEdit,
      handleOpenBannerModal,
      handleCloseBannerModal,
      handleAddBanner,
      handleUpdateBanner,
      handleDeleteBanner,
    } = useBanner();


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
            className="bg-red-500 hover:bg-red-600 text-white cursor-pointer px-4 py-2 rounded"
          >
            Đăng xuất
          </button>
        </div>
      
        {activeTab === 'dashboard' && (
          <DashboardOverview 
            products={products.length} 
            categories={categories.length} 
            news={news.length} 
          />
        )}

{/* news */}
        {activeTab === 'news' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => handleOpenNewsModal(null)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer"
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
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer"
              >
                Thêm nội dung giới thiệu
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


{/* category */}
        {activeTab === 'categories' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => handleOpenCategoryModal(null)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer"
              >
                Thêm danh mục
              </button>
            </div>

            {categoriesLoading ? (
              <p>Đang tải...</p>
            ) : categories.length === 0 ? (
              <p className="text-gray-600">Không có tin tức.</p>
            ) : (
              <div className="flex flex-col gap-4 w-full">
                {categories.map(item => (
                  <CategoriesCard
                    key={item.id}
                    categories={item}
                    onEdit={() => handleOpenCategoryModal(item)}
                    onDelete={handleDeleteCategory}
                  />
                ))}
              </div>
            )}
            
            <CategoriesFormModal
              isOpen={isCategoryModalOpen}
              onClose={handleCloseCategoryModal}
              onSubmit={categoryToEdit ? handleUpdateCategory : handleAddCategory}
              initialData={categoryToEdit || {}}
            />
          </div>
        )}

{/* products */}
        {activeTab === 'products' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => openProductModal(null)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer"
              >
                Thêm sản phẩm
              </button>
            </div>

            {productsLoading ? (
              <p>Đang tải...</p>
            ) : products.length === 0 ? (
              <p className="text-gray-600">Không có tin tức.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map(item => (
                  <ProductCard
                    key={item.id}
                    product={item}
                    onEdit={() => openProductModal(item)}
                    onDelete={deleteProduct}
                  />
                ))}
              </div>
            )}
            
            <ProductFormModal
              isOpen={isProductModalOpen}
              onClose={closeProductModal}
              onSubmit={productToEdit ? updateProduct : addProduct}
              initialData={productToEdit || {}}
            />
          </div>
        )}
{/* Banner */}
        {activeTab === 'banners' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => handleOpenBannerModal(null)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer"
              >
                Thêm nội dung banner
              </button>
            </div>

            {bannerLoading ? (
              <p>Đang tải...</p>
            ) : banners.length === 0 ? (
              <p className="text-gray-600">Không có banner nào.</p>
            ) : (
              <div className="flex flex-col gap-4 w-full">
                {banners.map(item => (
                  <BannerCard
                    key={item.id}
                    banner={item}
                    onEdit={() => handleOpenBannerModal(item)}
                    onDelete={handleDeleteBanner}
                  />
                ))}
              </div>
            )}
            
            <BannerFormModal
              isOpen={isBannerModalOpen}
              onClose={handleCloseBannerModal}
              onSubmit={bannerToEdit ? handleUpdateBanner : handleAddBanner}
              initialData={bannerToEdit || {}}
            />
          </div>
        )}

        {activeTab === 'users' && <UsersPanel />}
        {activeTab === 'contacts' && <ContactsPanel />}
      </main>
    </div>
  );
};

export default AdminDashboard;
