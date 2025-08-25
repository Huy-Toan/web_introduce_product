import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import { useT } from "../context/TContext";

const SUPPORTED = ["vi", "en"];
const DEFAULT_LOCALE = "vi";

function pickLocale(search) {
  const sp = new URLSearchParams(search);
  const urlLc = (sp.get("locale") || "").toLowerCase();
  const lsLc = (localStorage.getItem("locale") || "").toLowerCase();
  return SUPPORTED.includes(urlLc)
    ? urlLc
    : SUPPORTED.includes(lsLc)
      ? lsLc
      : DEFAULT_LOCALE;
}

// Chuẩn hoá payload danh mục từ API (tuỳ BE trả về)
function normalizeParentsPayload(data) {
  const list =
    data?.parents ??
    data?.parent_categories ??
    data?.items ??
    (Array.isArray(data) ? data : []);
  return Array.isArray(list) ? list : [];
}

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useT();

  const locale = useMemo(() => pickLocale(location.search), [location.search]);
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(false);

  // Lấy danh mục có kèm locale
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoadingCats(true);
        const res = await fetch(
          `/api/parent_categories?locale=${encodeURIComponent(locale)}`,
          { signal: ac.signal }
        );
        const data = await res.json();
        const list = normalizeParentsPayload(data);
        setCategories(
          list.map((c) => ({
            id: c.id,
            name: c.name ?? c.title ?? c.slug ?? "Category",
            slug: c.slug ?? (c.id != null ? String(c.id) : ""),
          }))
        );
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Failed to fetch categories:", err);
        }
        setCategories([]);
      } finally {
        setLoadingCats(false);
      }
    })();
    return () => ac.abort();
  }, [locale]);

  // Điều hướng và GIỮ locale trong query
  const handleNavigation = (path) => {
    const u = new URL(path, window.location.origin);
    u.searchParams.set("locale", locale);
    navigate(u.pathname + u.search);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-white border-t border-gray-200 mt-12 text-[15px] md:text-base text-gray-700 leading-relaxed">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Company Info */}
        <div>
          <button
            type="button"
            className="flex items-center space-x-2 cursor-pointer mb-4"
            onClick={() => handleNavigation("/")}
            aria-label="Go to homepage"
          >
            <img
              src="https://allxone.vn/wp-content/uploads/2022/08/cropped-logo1-150x31.png"
              alt="AllXone Logo"
              className="h-10 w-auto"
              loading="lazy"
            />
          </button>
          <p className="mb-2">{t("footer.address")}</p>
          <p className="mb-2">
            {t("footer.contact")}: +84 383 655 628
          </p>
          <p>
            Email:{" "}
            <a
              href="mailto:support@allxone.com"
              className="hover:text-blue-600 underline underline-offset-2"
            >
              support@allxone.com
            </a>
          </p>
        </div>

        {/* Services */}
        <div>
          <h4 className="font-semibold text-yellow-700 mb-3 text-[16px] md:text-lg">
            {t("footer.service")}
          </h4>
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => handleNavigation("/")}
                className="hover:text-blue-600 cursor-pointer"
              >
                {t("navigation.home")}
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation("/about")}
                className="hover:text-blue-600 cursor-pointer"
              >
                {t("navigation.about")}
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation("/product")}
                className="hover:text-blue-600 cursor-pointer"
              >
                {t("navigation.product")}
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation("/news")}
                className="hover:text-blue-600 cursor-pointer"
              >
                {t("navigation.news")}
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation("/contact")}
                className="hover:text-blue-600 cursor-pointer"
              >
                {t("navigation.contact")}
              </button>
            </li>
          </ul>
        </div>

        {/* Products */}
        <div>
          <h4 className="font-semibold text-yellow-700 mb-3 text-[16px] md:text-lg">
            {t("footer.products")}
          </h4>
          <ul className="space-y-2">
            {loadingCats ? (
              <li className="text-gray-500 italic">{t("footer.loading")}</li>
            ) : categories.length > 0 ? (
              categories.map((cat) => (
                <li key={cat.id || cat.slug}>
                  <button
                    onClick={() =>
                      handleNavigation(`/product/${encodeURIComponent(cat.slug)}`)
                    }
                    className="hover:text-blue-600 cursor-pointer"
                    title={cat.name}
                  >
                    {cat.name}
                  </button>
                </li>
              ))
            ) : (
              <li className="text-gray-500 italic">{t("footer.loading")}</li>
            )}
          </ul>
        </div>

        {/* Register */}
        <div>
          <h4 className="font-semibold text-yellow-700 mb-3 text-[16px] md:text-lg">
            {t("footer.register")}
          </h4>
          <p className="mb-3">{t("footer.subscribe")}</p>
          <div className="flex items-center border rounded overflow-hidden mb-4">
            <input
              type="email"
              placeholder={t("footer.email_placeholder")}
              className="px-3 py-3 w-full outline-none text-[15px]"
              aria-label="Email"
            />
            <button
              className="bg-yellow-600 cursor-pointer text-white px-4 py-3 hover:bg-yellow-700"
              aria-label="Subscribe"
              type="button"
            >
              ➤
            </button>
          </div>

          <div className="flex space-x-4 text-2xl text-gray-600">
            <a
              href="https://facebook.com"
              className="hover:text-blue-600"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <FaFacebook />
            </a>
            <a
              href="https://instagram.com"
              className="hover:text-pink-500"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>
            <a
              href="https://youtube.com"
              className="hover:text-red-600"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
            >
              <FaYoutube />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
