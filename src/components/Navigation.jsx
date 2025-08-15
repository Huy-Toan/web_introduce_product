import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import LanguageSwitcher from "./LanguageSwitcher";
import {useTWithNamespace } from "../context/TContext";


function TopNavigation() {
  const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTWithNamespace('nav');

  const location = useLocation();
    const pathname = location.pathname;

    const isActive = (targetPath) => {
    if (targetPath === "/") return pathname === "/";
    return pathname.startsWith(targetPath);
    };


  const handlePageNavigation = (pageName) => {
    setIsMobileMenuOpen(false);
    if (pageName === "home") navigate("/");
    else navigate(`/${pageName}`);
  };

  const pages = [
    { key: 'auto.trang_chu', path: '/' },
    { key: 'auto.ve_chung_toi', path: '/about' },
    { key: 'auto.san_pham', path: '/product' },
    { key: 'auto.tin_tuc', path: '/news' },
    { key: 'auto.lien_he', path: '/contact' }
  ];


  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="container max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-semibold text-gray-900">AllXone</span>
            {t('brand')}
          </div>

          {/* Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            {["home", "about","product", "news", "contact"].map((page) => {
            const path = page === "home" ? "/" : `/${page}`;
            return (
                <button
                key={page}
                onClick={() => handlePageNavigation(page)}
                className={`px-3 py-2 rounded-md text-lg font-medium transition- cursor-pointer ${
                    isActive(path)
                    ? "text-blue-700 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
                >
                {page === "home" ? "Home" : page === "about" ? "About Us" : page ==="contact" ? "Contact" : page === "news" ? "News" : "Products"}
                {t('brand')}
                </button>
            );
            })}
            <LanguageSwitcher variant="flags" />
          </div>

          {/* Mobile Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              {t(key)}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-2">
            <div className="space-y-1">
              {["home", "about","product", "news", "contact"].map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageNavigation(page)}
                  className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:bg-gray-50"
                >
                  {page === "home" ? "Home" : page === "about" ? "About Us" : page ==="contact" ? "Contact" : page === "news" ? "News" : "Products"}
                </button>
              ))}
            </div>

            <div className="px-4 pt-3 pb-2 border-t border-gray-100">
              <div className="text-xs text-gray-500 mb-2">{t('auto.language_ngon_ngu')}</div>
                <LanguageSwitcher variant="select" />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default TopNavigation;
