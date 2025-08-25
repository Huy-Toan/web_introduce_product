// src/pages/AboutPage.jsx
import TopNavigation from "../components/Navigation";
import Footer from "../components/Footer";
import { useEffect, useState, useMemo } from "react";
import AboutHeaderBanner from "../components/AboutBanner";
import MarkdownOnly from "../components/MarkdownOnly";
import Breadcrumbs from "../components/Breadcrumbs";
import { useLocation } from "react-router-dom";
import {
  getSiteOrigin,
  getCanonicalBase,
} from "../lib/siteUrl";
import SEO, { stripMd } from "../components/SEOhead";

const SUPPORTED = ["vi", "en"];
const DEFAULT_LOCALE = "vi";
const getLocaleFromSearch = (search) =>
  new URLSearchParams(search).get("locale")?.toLowerCase() || "";

function AboutPage() {
  const location = useLocation();

  // ===== locale: URL -> localStorage -> default
  const [locale, setLocale] = useState(() => {
    const urlLc = getLocaleFromSearch(window.location.search);
    const lsLc = (localStorage.getItem("locale") || "").toLowerCase();
    return SUPPORTED.includes(urlLc)
      ? urlLc
      : SUPPORTED.includes(lsLc)
        ? lsLc
        : DEFAULT_LOCALE;
  });

  useEffect(() => {
    const urlLc = getLocaleFromSearch(location.search);
    if (SUPPORTED.includes(urlLc) && urlLc !== locale) {
      setLocale(urlLc);
      localStorage.setItem("locale", urlLc);
      try { document.documentElement.lang = urlLc; } catch { }
    }
  }, [location.search, locale]);

  const qs = `?locale=${encodeURIComponent(locale)}`;

  const [aboutContent, setAboutContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const DEFAULT_IMAGE = "/banner.jpg";

  // i18n labels
  const t = {
    breadcrumb: locale === "vi" ? "Giới thiệu" : "About Us",
    headline1: "ITXEASY",
    headline2: locale === "vi" ? "CHỌN CHÚNG TÔI - CHỌN CHẤT LƯỢNG" : "CHOOSE US - CHOOSE QUALITY",
    section1: locale === "vi" ? "Giới thiệu" : "About Us",
    section2: locale === "vi" ? "Câu chuyện" : "Our Story",
    quote: locale === "vi"
      ? "“Sản phẩm chất lượng cao bắt đầu từ quy trình chuẩn mực.”"
      : "“High-quality products start with standardized processes.”",
    step: (i, title) =>
      locale === "vi" ? `Bước ${i}: ${title || ""}` : `Step ${i}: ${title || ""}`,
    empty: locale === "vi" ? "Không có nội dung nào để hiển thị." : "No content to display.",
  };

  const items = useMemo(
    () => [{ label: t.breadcrumb, to: `/about${qs}` }],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, qs] // t.breadcrumb phụ thuộc locale, nhưng để tránh re-create nhiều lần ta dùng deps này
  );

  useEffect(() => {
    const fetchAboutContent = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/about${qs}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setAboutContent(Array.isArray(data.about) ? data.about : []);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu About Us:", err);
        setAboutContent([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAboutContent();
  }, [qs]);

  /* =================== SEO cho About =================== */
  const SITE_URL = getSiteOrigin();
  const BRAND = import.meta.env.VITE_BRAND_NAME || "ITXEASY";
  const canonical = `${getCanonicalBase()}/about`; // có thể dùng `${...}/about?locale=${locale}` nếu muốn tách canonical theo ngôn ngữ

  const pageTitle = useMemo(() => {
    const t0 = aboutContent?.[0]?.title?.trim();
    return t0 ? `${t0} | ${BRAND}` : `${t.breadcrumb} | ${BRAND}`;
  }, [aboutContent, BRAND, t.breadcrumb]);

  const pageDesc = useMemo(() => {
    const a = aboutContent?.[0]?.content || "";
    const b = aboutContent?.[1]?.content || "";
    const raw = [a, b].filter(Boolean).map(stripMd).join(" ");
    return raw
      ? raw.slice(0, 300)
      : (locale === "vi"
        ? `Giới thiệu ${BRAND}: đơn vị xuất khẩu nông sản Việt Nam, quy trình tiêu chuẩn, đối tác toàn cầu.`
        : `About ${BRAND}: Vietnamese agricultural exports, standardized processes, global partners.`);
  }, [aboutContent, BRAND, locale]);

  const keywords = useMemo(() => {
    const extra = (aboutContent || []).map((s) => s?.title).filter(Boolean);
    const base =
      locale === "vi"
        ? ["Giới thiệu", "xuất khẩu", "nông sản", "ITXEASY", "Vietnam export"]
        : ["About Us", "export", "agriculture", "ITXEASY", "Vietnam export"];
    return Array.from(new Set([...base, ...extra]));
  }, [aboutContent, locale]);

  const ogImage = aboutContent?.[0]?.image_url || undefined;

  const publishedTime = useMemo(() => {
    const dates = (aboutContent || []).map((s) => s?.created_at).filter(Boolean);
    return dates.length ? dates.sort()[0] : undefined;
  }, [aboutContent]);

  const modifiedTime = useMemo(() => {
    const dates = (aboutContent || []).map((s) => s?.updated_at || s?.created_at).filter(Boolean);
    return dates.length ? dates.sort().slice(-1)[0] : publishedTime;
  }, [aboutContent, publishedTime]);

  const noindex = !loading && (!aboutContent || aboutContent.length === 0);

  const breadcrumbLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: t.breadcrumb, item: canonical },
      ],
    }),
    [SITE_URL, canonical, t.breadcrumb]
  );

  const aboutPageLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: pageTitle,
      description: pageDesc,
      url: canonical,
      isPartOf: { "@type": "WebSite", name: BRAND, url: SITE_URL },
    }),
    [pageTitle, pageDesc, canonical, BRAND, SITE_URL]
  );

  const organizationLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: BRAND,
      url: SITE_URL,
      logo: `${SITE_URL}/logo-512.png`,
    }),
    [BRAND, SITE_URL]
  );
  /* ===================================================== */

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title={pageTitle}
        description={pageDesc}
        url={canonical}
        image={ogImage}
        siteName={BRAND}
        noindex={noindex}
        publishedTime={publishedTime}
        modifiedTime={modifiedTime}
        keywords={keywords}
        ogType="website"
        twitterCard="summary_large_image"
        jsonLd={[breadcrumbLd, aboutPageLd, organizationLd]}
      />

      <TopNavigation />
      <Breadcrumbs items={items} className="mt-16" />
      <AboutHeaderBanner />

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="h-10 w-10 border-2 border-blue-800 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <main className="bg-white">
          {/* Header Section */}
          <div className="text-center py-12 bg-gray-50">
            <h1 className="text-4xl font-bold text-yellow-600 mb-4">{t.headline1}</h1>
            <h2 className="text-2xl font-semibold text-gray-700">{t.headline2}</h2>
            <div className="w-24 h-1 bg-yellow-500 mx-auto"></div>
          </div>

          {aboutContent.length > 0 ? (
            <>
              {/* First Section - Image Left */}
              <section className="py-16 px-4">
                <div className="max-w-7xl mx-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Image */}
                    <div className="order-2 lg:order-1">
                      <img
                        src={aboutContent[0]?.image_url || DEFAULT_IMAGE}
                        alt={aboutContent[0]?.title || "About Image"}
                        className="w-full h-[400px] object-cover rounded-lg shadow-lg"
                        loading="lazy"
                      />
                    </div>
                    {/* Content */}
                    <div className="order-1 lg:order-2">
                      <div className="mb-6">
                        <h4 className="text-3xl font-bold text-yellow-600 mb-6">
                          {aboutContent[0]?.title || t.section1}
                        </h4>
                      </div>
                      <div className="space-y-6 text-gray-600 leading-relaxed">
                        <div className="whitespace-pre-wrap text-justify">
                          <MarkdownOnly value={aboutContent[0]?.content || ""} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Second Section - Image Right */}
              {aboutContent[1] && (
                <section className="py-16 px-4 bg-gray-50">
                  <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                      {/* Content */}
                      <div>
                        <div className="mb-6">
                          <h4 className="text-3xl font-bold text-yellow-600 mb-6">
                            {aboutContent[1]?.title || t.section2}
                          </h4>
                        </div>
                        <div className="space-y-6 text-gray-600 leading-relaxed">
                          <div className="whitespace-pre-wrap text-justify">
                            <MarkdownOnly value={aboutContent[1]?.content || ""} />
                          </div>
                        </div>
                      </div>
                      {/* Image */}
                      <div>
                        <img
                          src={aboutContent[1]?.image_url || DEFAULT_IMAGE}
                          alt={aboutContent[1]?.title || "About Image"}
                          className="w-full h-[400px] object-cover rounded-lg shadow-lg"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Quote + process summary */}
              <section className="py-16 bg-gray-100 text-center">
                <div className="max-w-4xl mx-auto">
                  <blockquote className="text-2xl italic text-gray-700 font-semibold mb-6">
                    {t.quote}
                  </blockquote>
                  <div className="flex flex-wrap justify-center items-center gap-4 text-xl font-bold text-yellow-700">
                    {locale === "vi" ? (
                      <>
                        <span>Thu hoạch</span><span>→</span>
                        <span>Sơ chế</span><span>→</span>
                        <span>Cắt</span><span>→</span>
                        <span>Cấp đông</span><span>→</span>
                        <span>Đóng gói</span><span>→</span>
                        <span>Bảo quản</span>
                      </>
                    ) : (
                      <>
                        <span>Harvest</span><span>→</span>
                        <span>Pre-processing</span><span>→</span>
                        <span>Cutting</span><span>→</span>
                        <span>Freezing</span><span>→</span>
                        <span>Packing</span><span>→</span>
                        <span>Storage</span>
                      </>
                    )}
                  </div>
                </div>
              </section>

              {/* Steps from index 2+ */}
              {aboutContent.slice(2).map((step, index) => {
                const reverse = index % 2 === 1;
                const stepLabel = t.step(index + 1, step?.title);
                return (
                  <section
                    key={step.id ?? `about-step-${index}`}
                    className={`py-16 px-4 ${reverse ? "" : "bg-gray-50"}`}
                  >
                    <div className="max-w-4xl mx-auto">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {reverse ? (
                          <>
                            {/* Image Left */}
                            <div className="order-2 lg:order-1">
                              <img
                                src={step?.image_url || DEFAULT_IMAGE}
                                alt={step?.title || stepLabel}
                                className="w-full h-[500px] object-cover rounded-lg shadow-lg"
                                loading="lazy"
                              />
                            </div>
                            {/* Content Right */}
                            <div className="order-1 lg:order-2">
                              <h3 className="text-3xl font-bold text-yellow-600 mb-8">
                                {stepLabel}
                              </h3>
                              <div className="space-y-6 text-gray-600">
                                <div className="whitespace-pre-wrap text-justify">
                                  <MarkdownOnly value={step?.content || ""} />
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Content Left */}
                            <div>
                              <h3 className="text-3xl font-bold text-yellow-600 mb-8">
                                {stepLabel}
                              </h3>
                              <div className="space-y-6 text-gray-600">
                                <div className="whitespace-pre-wrap text-justify">
                                  <MarkdownOnly value={step?.content || ""} />
                                </div>
                              </div>
                            </div>
                            {/* Image Right */}
                            <div>
                              <img
                                src={step?.image_url || DEFAULT_IMAGE}
                                alt={step?.title || stepLabel}
                                className="w-full h-[500px] object-cover rounded-lg shadow-lg"
                                loading="lazy"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </section>
                );
              })}
            </>
          ) : (
            <div className="text-center py-20 text-gray-500">
              <p>{t.empty}</p>
              <div className="max-w-4xl mx-auto mt-8 px-4">
                <img
                  src={DEFAULT_IMAGE}
                  alt="Default About"
                  className="w-full h-[400px] object-cover rounded-lg shadow-lg"
                  loading="lazy"
                />
              </div>
            </div>
          )}
        </main>
      )}

      <Footer />
    </div>
  );
}

export default AboutPage;
