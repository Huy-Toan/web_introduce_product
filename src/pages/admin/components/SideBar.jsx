import { Home, Package, Users, Newspaper, Info, Tags, Mail, Image, Briefcase, Award, MessageCircle } from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Tổng quan', icon: Home },
  { id: 'products', label: 'Sản phẩm', icon: Package },
  { id: 'parent_categories', label: 'Danh mục lớn', icon: Tags },
  { id: 'sub_categories', label: 'Danh mục con', icon: Tags },
  { id: 'news', label: 'Tin tức', icon: Newspaper },
  { id: 'about_us', label: 'Giới thiệu', icon: Info },
  { id: 'banners', label: 'Banner', icon: Image },
  { id: 'fields', label: 'Lĩnh vực', icon: Briefcase },
  { id: 'cer_partner', label: 'Chứng nhận & Đối tác', icon: Award },
  { id: 'users', label: 'Người dùng', icon: Users },
    { id: 'contacts', label: 'Liên hệ', icon: Mail },
    { id: 'chat', label: 'Chat', icon: MessageCircle }
];

const SidebarNav = ({ activeTab, setActiveTab }) => (
  <div className="w-64 bg-white shadow-lg">
  <div className="p-6 border-b flex items-center space-x-3">
    <img
      src="https://allxone.vn/wp-content/uploads/2022/08/cropped-logo1-150x31.png"
      alt="AllXone Logo"
      className="w-auto h-auto object-contain"
    />
  </div>

    <nav className="mt-6">
      {navItems.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`cursor-pointer w-full flex items-center px-6 py-3 text-left transition-colors duration-200
              ${
                isActive
                  ? "bg-blue-200 text-blue-800 font-semibold border-l-4 border-blue-700"
                  : "text-gray-700 hover:bg-blue-200 hover:text-blue-800 hover:font-semibold"
              }
            `}
          >
            <Icon
              size={20}
              className={`mr-3 ${
                isActive
                  ? "text-blue-800"
                  : "text-gray-500 group-hover:text-blue-800"
              }`}
            />
            {label}
          </button>
        );
      })}
    </nav>
  </div>
);


export default SidebarNav;