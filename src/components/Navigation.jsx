import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function TopNavigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  // theo dõi scroll
  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY <= 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (targetPath) => {
    if (targetPath === "/") return pathname === "/";
    return pathname.startsWith(targetPath);
  };

  const handlePageNavigation = (pageName) => {
    setIsMobileMenuOpen(false);
    if (pageName === "home") navigate("/");
    else navigate(`/${pageName}`);
  };

  // điều kiện nav trong suốt: chỉ khi ở home + đang ở top
  const transparentNav = pathname === "/" && atTop;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300
        ${transparentNav 
          ? "!bg-transparent border-transparent shadow-none" 
          : "bg-white border-b border-gray-200 shadow-sm"}`}
    >
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => handlePageNavigation("home")}>
            <img 
              src="https://allxone.vn/wp-content/uploads/2022/08/cropped-logo1-150x31.png" 
              alt="AllXone Logo" 
              className="h-8 w-auto"
            />
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-6">
            {["home", "about","product", "news", "contact"].map((page) => {
              const path = page === "home" ? "/" : `/${page}`;
              const active = isActive(path);
              return (
                <button
                  key={page}
                  onClick={() => handlePageNavigation(page)}
                  className={`px-3 py-2 rounded-md text-lg font-medium transition-colors cursor-pointer ${
                    transparentNav
                      ? (active ? "text-white font-semibold" : "text-white")
                      : (active
                        ? "text-blue-700 bg-blue-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-yellow-100")
                  }`}
                >
                  {page === "home" ? "Home" 
                   : page === "about" ? "About Us" 
                   : page === "contact" ? "Contact" 
                   : page === "news" ? "News" 
                   : "Products"}
                </button>
              );
            })}
          </div>

          {/* Mobile button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-md transition-colors ${
                transparentNav ? "text-white" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6"/> : <Menu className="h-6 w-6"/>}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 w-full">
          <div className="px-4 py-2">
            <div className="space-y-1">
              {["home", "about","product", "news", "contact"].map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageNavigation(page)}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  {page === "home" ? "Home" 
                   : page === "about" ? "About Us" 
                   : page === "contact" ? "Contact" 
                   : page === "news" ? "News" 
                   : "Products"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default TopNavigation;
