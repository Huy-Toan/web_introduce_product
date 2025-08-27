import {
    Menu,
    X,
    Globe2,
    ChevronDown,
    Phone,
    Mail,
    Search,
    ShoppingCart,
} from "lucide-react";
import { FaTwitter, FaFacebook, FaPinterestP, FaInstagram } from "react-icons/fa";
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

    const [locale, setLocale] = useState(i18n.language || getStoredLocale());
    const [openLang, setOpenLang] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const pathname = location.pathname;

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

    // ẩn thanh trên khi lướt xuống
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-300 ${
                scrolled ? "shadow-md" : "shadow-sm"
            }`}
        >
            {/* Upper bar */}
            <div
                className={`hidden md:block bg-[#F5F2E8] overflow-hidden transition-all duration-300 ${
                    scrolled ? "max-h-0 opacity-0" : "max-h-24 opacity-100"
                }`}
            >
                <div className="max-w-7xl mx-auto px-4 flex items-center justify-between py-3">
                    {/* CALL ANYTIME */}
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-700 rounded-full text-white">
                            <Phone className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                            <p className="m-0 text-xs leading-[1] text-gray-500">Call Anytime</p>
                            <a
                                href="tel:6668880000"
                                className="m-0 block font-medium text-gray-800 text-lg leading-[1.05]"
                            >
                                666 888 0000
                            </a>
                        </div>
                    </div>

                    {/* LOGO */}
                    <div
                        className="cursor-pointer"
                        onClick={() => handlePageNavigation("home")}
                        title="AllXone"
                    >
                        <img
                            src="https://allxone.vn/wp-content/uploads/2022/08/cropped-logo1-150x31.png"
                            alt="AllXone Logo"
                            className="h-8 w-auto"
                        />
                    </div>


                    {/* WRITE EMAIL */}
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-700 rounded-full text-white">
                            <Mail className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                            <p className="m-0 text-xs leading-[1] text-gray-500">Write Email</p>
                            <a
                                href="mailto:info@company.com"
                                className="m-0 block font-medium text-gray-800 text-lg leading-[1.05]"
                            >
                                info@company.com
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lower navigation */}
            <div className="bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Social icons */}
                        <div className="hidden md:flex space-x-4 text-green-700">
                            <a href="#" aria-label="Twitter"><FaTwitter /></a>
                            <a href="#" aria-label="Facebook"><FaFacebook /></a>
                            <a href="#" aria-label="Pinterest"><FaPinterestP /></a>
                            <a href="#" aria-label="Instagram"><FaInstagram /></a>
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
                                        className={`px-3 py-2 rounded-md text-lg font-medium transition-colors cursor-pointer ${
                                            active
                                                ? "text-green-700 bg-green-50"
                                                : "text-gray-600 hover:text-green-700 hover:bg-green-50"
                                        }`}
                                    >
                                        {labelFor(page)}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Right icons */}
                        <div className="hidden md:flex items-center space-x-4">
                            <button className="p-2 text-gray-600 hover:text-green-700">
                                <Search className="h-5 w-5" />
                            </button>
                            <button className="p-2 text-gray-600 hover:text-green-700">
                                <ShoppingCart className="h-5 w-5" />
                            </button>
                            <div className="relative">
                                <button
                                    onClick={() => setOpenLang(!openLang)}
                                    className="flex items-center space-x-1 p-2 text-gray-600 hover:text-green-700"
                                >
                                    <Globe2 className="h-5 w-5" />
                                    <ChevronDown className="h-4 w-4" />
                                </button>
                                {openLang && (
                                    <div className="absolute right-0 mt-2 w-24 bg-white border rounded-md shadow-lg">
                                        {SUPPORTED.map((lc) => (
                                            <button
                                                key={lc}
                                                onClick={() => {
                                                    setLocale(lc);
                                                    const url = new URL(window.location.href);
                                                    url.searchParams.set("locale", lc);
                                                    navigate(url.pathname + url.search, { replace: true });
                                                    setOpenLang(false);
                                                }}
                                                className={`block w-full text-left px-2 py-1 text-sm hover:bg-gray-100 ${
                                                    lc === locale ? "text-green-700" : ""
                                                }`}
                                            >
                                                {lc === "vi" ? "VI" : "EN"}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mobile bar */}
                        <div className="md:hidden flex items-center justify-between w-full">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 text-gray-600"
                            >
                                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                            <div
                                onClick={() => handlePageNavigation("home")}
                                className="cursor-pointer"
                                title="AllXone"
                            >
                                <img
                                    src="https://allxone.vn/wp-content/uploads/2022/08/cropped-logo1-150x31.png"
                                    alt="AllXone Logo"
                                    className="h-8 w-auto"
                                />
                            </div>
                            <button
                                onClick={() => {
                                    const next = locale === "vi" ? "en" : "vi";
                                    setLocale(next);
                                    const url = new URL(window.location.href);
                                    url.searchParams.set("locale", next);
                                    navigate(url.pathname + url.search, { replace: true });
                                }}
                                className="p-2 text-sm font-medium text-gray-700"
                                title={t("auto.dang_chuyen_doi_ngon_ngu")}
                            >
                                {locale.toUpperCase()}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-200">
                    <div className="px-4 py-2 space-y-1">
                        {pages.map((page) => (
                            <button
                                key={page}
                                onClick={() => handlePageNavigation(page)}
                                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                            >
                                {labelFor(page)}
                            </button>
                        ))}
                        <div className="mt-2 grid grid-cols-2 gap-2">
                            {SUPPORTED.map((lc) => (
                                <button
                                    key={lc}
                                    onClick={() => {
                                        setLocale(lc);
                                        const url = new URL(window.location.href);
                                        url.searchParams.set("locale", lc);
                                        navigate(url.pathname + url.search, { replace: true });
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className={`px-3 py-2 border rounded-md ${
                                        lc === locale
                                            ? "bg-green-600 text-white border-green-600"
                                            : "bg-white text-gray-700 hover:bg-gray-50"
                                    }`}
                                >
                                    {lc === "vi" ? t("auto.tieng_viet") : t("auto.tieng_anh")}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}

export default TopNavigation;
