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
import ParentCategoriesCard from './components/ParentCategoriesCard';
import ParentCategoriesFormModal from './components/ParentCategoriesFormModal';
import useParentCategories from './hook/UseParentCategories';
import ProductsTab from './components/productTab.jsx';
import AnalyticsPanel from './components/AnalyticsPanel';

import useSubCategories from './hook/UseSubCategories';
import SubCategoriesCard from './components/SubCategoriesCard';
import SubCategoriesFormModal from './components/SubCategoriesFormModal';

import ProductCard from './components/ProductCard';
import ProductFormModal from './components/ProductFormModal';
import useProducts from './hook/Useproduct';
import BannerCard from './components/BannerCard';
import BannerFormModal from './components/BannerFormModal';
import useBanner from './hook/UseBanner';
import FieldCard from './components/FieldCard';
import FieldFormModal from './components/FieldFormModal';
import useField from './hook/UseField';
import Cer_PartnerCard from './components/Cer_PartnerCard';
import CertPartnerFormModal from './components/Cer_PartnerFormModal';
import useCerPartner from './hook/UseCer_Partner';
import AdminChat from './AdminChat.jsx';

import { clearAuth } from '../../../api/admin/auth';
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
    parents,
    parentsLoading,
    totalParents,
    isParentModalOpen,
    parentToEdit,
    handleOpenParentModal,
    handleCloseParentModal,
    fetchParents,
    handleAddParent,
    handleUpdateParent,
    handleDeleteParent,
  } = useParentCategories();


  const {
    products,
    productsLoading,
    isProductModalOpen,
    productToEdit,
    openProductModal,
    closeProductModal,
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

  const {
    fields,
    fieldsLoading,
    isFieldModalOpen,
    fieldToEdit,
    handleOpenFieldModal,
    handleCloseFieldModal,
    handleAddField,
    handleUpdateField,
    handleDeleteField,
  } = useField();

  const {
    // data
    itemsCerPartner,
    loadingCerPartner,
    isModalOpenCerPartner,
    editingItemCerPartner,
    openCerPartnerModal,
    closeCerPartnerModal,
    createCerPartner,
    updateCerPartner,
    deleteCerPartner,
  } = useCerPartner();

  const {
    subcategories,
    subcategoriesLoading,
    totalSubcategories,
    currentParentFilter,
    setParentAndFetch,
    isSubModalOpen,
    subToEdit,
    handleOpenSubModal,
    handleCloseSubModal,
    fetchSubCategories,
    handleAddSub,
    handleUpdateSub,
    handleDeleteSub,
  } = useSubCategories();

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
      navigate('/admin/login', { replace: true });
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
            parents={parents.length}
            news={news.length}
          />
        )}
        {activeTab === 'analytics' && <AnalyticsPanel />}


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


        {/* parent category */}
        {activeTab === 'parent_categories' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => handleOpenParentModal(null)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer"
              >
                Thêm danh mục lớn
              </button>
            </div>

            {parentsLoading ? (
              <p>Đang tải...</p>
            ) : parents.length === 0 ? (
              <p className="text-gray-600">Không có tin tức.</p>
            ) : (
              <div className="flex flex-col gap-4 w-full">
                {parents.map(item => (
                  <ParentCategoriesCard
                    key={item.id}
                    parentcategories={item}
                    onEdit={() => handleOpenParentModal(item)}
                    onDelete={handleDeleteParent}
                  />
                ))}
              </div>
            )}

            <ParentCategoriesFormModal
              isOpen={isParentModalOpen}
              onClose={handleCloseParentModal}
              onSubmit={parentToEdit ? handleUpdateParent : handleAddParent}
              initialData={parentToEdit || {}}
            />
          </div>
        )}

        {/* sub category */}
        {activeTab === 'sub_categories' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => handleOpenSubModal(null)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer"
              >
                Thêm danh mục con
              </button>
            </div>

            {subcategoriesLoading ? (
              <p>Đang tải...</p>
            ) : subcategories.length === 0 ? (
              <p className="text-gray-600">Không có tin tức.</p>
            ) : (
              <div className="flex flex-col gap-4 w-full">
                {subcategories.map(item => (
                  <SubCategoriesCard
                    key={item.id}
                    subcategories={item}
                    onEdit={() => handleOpenSubModal(item)}
                    onDelete={handleDeleteSub}
                  />
                ))}
              </div>
            )}

            <SubCategoriesFormModal
              isOpen={isSubModalOpen}
              onClose={handleCloseSubModal}
              onSubmit={subToEdit ? handleUpdateSub : handleAddSub}
              initialData={subToEdit || {}}
            />
          </div>
        )}

        {/* products */}
        {activeTab === 'products' && (
          <ProductsTab
            products={products}
            productsLoading={productsLoading}
            openProductModal={openProductModal}
            closeProductModal={closeProductModal}
            isProductModalOpen={isProductModalOpen}
            productToEdit={productToEdit}
            addProduct={addProduct}
            updateProduct={updateProduct}
            deleteProduct={deleteProduct}
          />
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

        {/* Cer_Partner */}
        {activeTab === 'cer_partner' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => openCerPartnerModal(null)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer"
              >
                Thêm nội dung chứng nhận & đối tác
              </button>
            </div>

            {loadingCerPartner ? (
              <p>Đang tải...</p>
            ) : itemsCerPartner.length === 0 ? (
              <p className="text-gray-600">Không có chứng nhận và đối tác nào nào.</p>
            ) : (
              <div className="flex flex-col gap-4 w-full">
                {itemsCerPartner.map(item => (
                  <Cer_PartnerCard
                    key={item.id}
                    cer_partner={item}
                    onEdit={() => openCerPartnerModal(item)}
                    onDelete={deleteCerPartner}
                  />
                ))}
              </div>
            )}

            <CertPartnerFormModal
              isOpen={isModalOpenCerPartner}
              onClose={closeCerPartnerModal}
              onSubmit={editingItemCerPartner ? updateCerPartner : createCerPartner}
              initialData={editingItemCerPartner || {}}
            />
          </div>
        )}

        {/* Field */}
        {activeTab === 'fields' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => handleOpenFieldModal(null)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer"
              >
                Thêm nội dung lĩnh vực
              </button>
            </div>

            {fieldsLoading ? (
              <p>Đang tải...</p>
            ) : fields.length === 0 ? (
              <p className="text-gray-600">Không có nội dung nào.</p>
            ) : (
              <div className="flex flex-col gap-4 w-full">
                {fields.map(item => (
                  <FieldCard
                    key={item.id}
                    field={item}
                    onEdit={() => handleOpenFieldModal(item)}
                    onDelete={handleDeleteField}
                  />
                ))}
              </div>
            )}

            <FieldFormModal
              isOpen={isFieldModalOpen}
              onClose={handleCloseFieldModal}
              onSubmit={fieldToEdit ? handleUpdateField : handleAddField}
              initialData={fieldToEdit || {}}
            />
          </div>
        )}

        {activeTab === 'users' && <UsersPanel />}
        {activeTab === 'contacts' && <ContactsPanel />}
        {activeTab === 'chat' && <AdminChat />}
      </main>
    </div>
  );
};

export default AdminDashboard;
