import { Menu, X, Globe2, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useT } from "../context/TContext";

const SUPPORTED = ["vi", "en"];
const DEFAULT_LOCALE = "vi";

function getStoredLocale() {
  const url = new URL(window.location.href);
  const urlLc = (url.searchParams.get("locale") || "").toLowerCase();
  const ls = (localStorage.getItem("locale") || "").toLowerCase();
  return SUPPORTED.includes(urlLc) ? urlLc : (SUPPORTED.includes(ls) ? ls : DEFAULT_LOCALE);
}

function setLocaleOnDom(lc) {
  try { document.documentElement.lang = lc; } catch { }
}

function TopNavigation() {
    const { t, i18n } = useT();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [atTop, setAtTop] = useState(true);
    const [locale, setLocale] = useState(i18n.language || getStoredLocale());
  const [openLang, setOpenLang] = useState(false);

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

  // cập nhật html lang & lưu localStorage khi locale đổi
  useEffect(() => {
      i18n.changeLanguage(locale);
    localStorage.setItem("locale", locale);
    setLocaleOnDom(locale);
  }, [locale, i18n]);

  // giữ query ?locale=... khi chuyển trang
  const buildUrl = (path) => {
    const url = new URL(window.location.origin + path);
    url.searchParams.set("locale", locale);
    return url.pathname + url.search;
  };

  const isActive = (targetPath) => {
    if (targetPath === "/") return pathname === "/";
    return pathname.startsWith(targetPath);
  };

  const handlePageNavigation = (pageName) => {
    setIsMobileMenuOpen(false);
    const path = pageName === "home" ? "/" : `/${pageName}`;
    navigate(buildUrl(path));
  };

  const transparentNav = pathname === "/" && atTop;

    const labelFor = (page) => t(`navigation.${page}`);

  const pages = ["home", "about", "what_we_do", "product", "news", "contact"];

  // khi user truy cập với ?locale=... khác localStorage → đồng bộ state
  useEffect(() => {
    const url = new URL(window.location.href);
    const urlLc = (url.searchParams.get("locale") || "").toLowerCase();
    if (SUPPORTED.includes(urlLc) && urlLc !== locale) {
      setLocale(urlLc);
    }
  }, [location.search]);

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
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => handlePageNavigation("home")}
            title="AllXone"
          >
            <img
              src="https://allxone.vn/wp-content/uploads/2022/08/cropped-logo1-150x31.png"
              alt="AllXone Logo"
              className="h-8 w-auto"
            />
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-6">
            {pages.map((page) => {
              const path = page === "home" ? "/" : `/${page}`;
              const active = isActive(path);
              return (
                <button
                  key={page}
                  onClick={() => handlePageNavigation(page)}
                  className={`px-3 py-2 rounded-md text-lg font-medium transition-colors cursor-pointer
                  hover:underline hover:underline-offset-4 hover:decoration-2 ${transparentNav
                      ? (active ? "text-white font-semibold" : "text-white")
                      : (active
                        ? "text-blue-700 bg-blue-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-yellow-100")
                    }`}
                >
                  {labelFor(page)}
                </button>
              );
            })}

            {/* Language Switcher (desktop) */}
            <div className="relative">
              <button
                onClick={() => setOpenLang((s) => !s)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border
                  ${transparentNav ? "text-white border-white/40 hover:bg-white/10" : "text-gray-700 border-gray-200 hover:bg-gray-50"}`}
                aria-haspopup="listbox"
                aria-expanded={openLang}
              >
                <Globe2 className="w-4 h-4" />
                <span className="uppercase">{locale}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {openLang && (
                <ul
                  className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden z-10"
                  role="listbox"
                >
                  {SUPPORTED.map((lc) => (
                    <li key={lc}>
                      <button
                        onClick={() => {
                          setOpenLang(false);
                          setLocale(lc);
                          // cập nhật URL hiện tại để mang ?locale mới
                          const url = new URL(window.location.href);
                          url.searchParams.set("locale", lc);
                          navigate(url.pathname + url.search, { replace: true });
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${lc === locale ? "font-medium text-blue-700" : "text-gray-700"}`}
                        role="option"
                        aria-selected={lc === locale}
                      >
                          {lc === "vi" ? t('auto.tieng_viet') : t('auto.tieng_anh')}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Mobile button */}
          <div className="md:hidden flex items-center gap-1">
            {/* Mobile language quick toggle */}
            <button
              onClick={() => {
                const next = locale === "vi" ? "en" : "vi";
                setLocale(next);
                const url = new URL(window.location.href);
                url.searchParams.set("locale", next);
                navigate(url.pathname + url.search, { replace: true });
              }}
              className={`p-2 rounded-md text-sm font-medium ${transparentNav ? "text-white" : "text-gray-700 hover:bg-gray-50"
                }`}
              title={t('auto.dang_chuyen_doi_ngon_ngu')}
            >
              {locale.toUpperCase()}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-md transition-colors ${transparentNav ? "text-white" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 w-full">
          <div className="px-4 py-2">
            <div className="space-y-1">
              {pages.map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageNavigation(page)}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  {labelFor(page)}
                </button>
              ))}
              {/* Mobile language choices */}
              <div className="mt-2 grid grid-cols-2 gap-2">
                {SUPPORTED.map((lc) => (
                  <button
                    key={lc}
                    onClick={() => {
                      setLocale(lc);
                      const url = new URL(window.location.href);
                      url.searchParams.set("locale", lc);
                      // giữ nguyên màn hiện tại, chỉ đổi locale
                      navigate(url.pathname + url.search, { replace: true });
                      setIsMobileMenuOpen(false);
                    }}
                    className={`px-3 py-2 border rounded-md ${lc === locale ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 hover:bg-gray-50"}`}
                  >
                      {lc === "vi" ? t('auto.tieng_viet') : t('auto.tieng_anh')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default TopNavigation;
