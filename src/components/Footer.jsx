// src/components/Footer.jsx
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
        if (err.name !== "AbortError") console.error(err);
        setCategories([]);
      } finally {
        setLoadingCats(false);
      }
    })();
    return () => ac.abort();
  }, [locale]);

  const handleNavigation = (path) => {
    const u = new URL(path, window.location.origin);
    u.searchParams.set("locale", locale);
    navigate(u.pathname + u.search);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative mt-16 text-[15px] leading-relaxed">
      {/* NỀN: xanh nhạt → trắng → vàng nhạt */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-50 via-white to-yellow-50" />

      {/* CONTENT */}
      <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-16 text-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
          {/* COMPANY (span 2 trên mobile) */}
          <div className="col-span-2 md:col-span-1">
            <button
              type="button"
              className="flex items-center space-x-2 cursor-pointer mb-4"
              onClick={() => handleNavigation("/")}
              aria-label="AllXone"
            >
              <img
                src="/itxeasy-logo.png"
                alt="ITX Logo"
                className="h-9 w-auto"
                loading="lazy"
              />
            </button>

            <p className="text-gray-600 mb-4">
              ALLXONE – {t("footer.company_desc", {
                defaultValue:
                  "Công ty chuyên cung cấp các sản phẩm nông nghiệp chất lượng cao.",
              })}
            </p>

            {/* CONTACT BOXES */}
            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-xl bg-white shadow-sm border border-gray-100 p-3 hover:shadow-md transition-shadow">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-green-700" />
                <p className="text-gray-700">
                  140 Nguyen Xi Street, Binh Thanh District, Ho Chi Minh City
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-white shadow-sm border border-gray-100 p-3 hover:shadow-md transition-shadow">
                <span className="h-2.5 w-2.5 rounded-full bg-green-700" />
                <a
                  href="tel:+84383655628"
                  className="hover:underline underline-offset-4"
                >
                  Tel: +84 7755 68646
                </a>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-white shadow-sm border border-gray-100 p-3 hover:shadow-md transition-shadow">
                <span className="h-2.5 w-2.5 rounded-full bg-green-700" />
                <a
                  href="mailto:support@allxone.com"
                  className="hover:underline underline-offset-4"
                >
                  Email: info@itxeasy.com
                </a>
              </div>
            </div>
          </div>

          {/* SERVICES */}
          <div>
            {/* HEADING: xanh đậm + gạch chân gradient */}
            <h4 className="text-sm font-semibold tracking-wide text-green-700 uppercase mb-3">
              {t("footer.service")}
              <span className="block h-1 mt-2 w-16 rounded-full bg-gradient-to-r from-green-400 to-yellow-400" />
            </h4>

            <ul className="space-y-2">
              {[
                { label: t("navigation.home"), to: "/" },
                { label: t("navigation.about"), to: "/about" },
                { label: t("navigation.product"), to: "/product" },
                { label: t("navigation.news"), to: "/news" },
                { label: t("navigation.contact"), to: "/contact" },
              ].map((item) => (
                <li key={item.to}>
                  <button
                    onClick={() => handleNavigation(item.to)}
                    className="group w-full text-left cursor-pointer rounded-md px-2 py-1 transition-colors hover:bg-green-50"
                  >
                    <span className="inline-flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-600 transform transition-transform group-hover:scale-125" />
                      <span className="text-gray-700 group-hover:text-green-700">
                        {item.label}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* PRODUCTS */}
          <div>
            <h4 className="text-sm font-semibold tracking-wide text-green-700 uppercase mb-3">
              {t("footer.products")}
              <span className="block h-1 mt-2 w-16 rounded-full bg-gradient-to-r from-green-400 to-yellow-400" />
            </h4>

            <ul className="space-y-2">
              {loadingCats ? (
                <li className="italic text-gray-500">{t("footer.loading")}</li>
              ) : categories.length ? (
                categories.map((cat) => (
                  <li key={cat.id || cat.slug}>
                    <button
                      onClick={() =>
                        handleNavigation(`/product/${encodeURIComponent(cat.slug)}`)
                      }
                      className="group w-full text-left cursor-pointer rounded-md px-2 py-1 transition-colors hover:bg-green-50"
                      title={cat.name}
                    >
                      <span className="inline-flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-600 transform transition-transform group-hover:scale-125" />
                        <span className="line-clamp-1 text-gray-700 group-hover:text-green-700">
                          {cat.name}
                        </span>
                      </span>
                    </button>
                  </li>
                ))
              ) : (
                <li className="italic text-gray-500">{t("footer.loading")}</li>
              )}
            </ul>
          </div>

          {/* REGISTER */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-sm font-semibold tracking-wide text-green-700 uppercase mb-3">
              {t("footer.register")}
              <span className="block h-1 mt-2 w-16 rounded-full bg-gradient-to-r from-green-400 to-yellow-400" />
            </h4>

            <p className="mb-3 text-gray-600">{t("footer.subscribe")}</p>

            {/* FORM: nền trắng, shadow, border + focus xanh */}
            <form
              className="mb-5"
              onSubmit={(e) => {
                e.preventDefault();
                // TODO: handle submit
              }}
            >
              <div className="flex items-stretch rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100 transition">
                <input
                  type="email"
                  placeholder={t("footer.email_placeholder")}
                  className="px-4 py-3 w-full outline-none text-[15px] placeholder:text-gray-400"
                  aria-label="Email"
                  required
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-3 font-semibold cursor-pointer hover:from-green-600 hover:to-green-700 transition"
                  aria-label="Subscribe"
                >
                  Gửi ▲
                </button>
              </div>
            </form>

            {/* SOCIAL: gradient + shadow + transform */}
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="grid place-items-center h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition"
              >
                <FaFacebook />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="grid place-items-center h-10 w-10 rounded-full bg-gradient-to-br from-pink-500 to-fuchsia-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition"
              >
                <FaInstagram />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="grid place-items-center h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition"
              >
                <FaYoutube />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM BAR: trắng trong suốt + blur */}
      <div className="relative border-t border-white/60 backdrop-blur bg-white/60">
        <div className="max-w-7xl mx-auto px-4 py-5 text-xs text-gray-600 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} ALLXONE. {t("footer.rights_reserved", { defaultValue: "Tất cả quyền được bảo lưu." })}</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleNavigation("/privacy")}
              className="hover:text-green-700"
            >
              {t("footer.privacy", { defaultValue: "Chính sách bảo mật" })}
            </button>
            <button
              onClick={() => handleNavigation("/terms")}
              className="hover:text-green-700"
            >
              {t("footer.terms", { defaultValue: "Điều khoản sử dụng" })}
            </button>
            <button
              onClick={() => handleNavigation("/sitemap")}
              className="hover:text-green-700"
            >
              Sitemap
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
