// src/pages/FieldPage.jsx
import TopNavigation from "../components/Navigation";
import Footer from "../components/Footer";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import FieldHeaderBanner from "../components/FieldBannerHead";
import { getSiteOrigin, getCanonicalBase } from "../lib/siteUrl";
import MarkdownOnly from "../components/MarkdownOnly";
import Breadcrumbs from "../components/Breadcrumbs";
import SEO, { stripMd } from "../components/SEOhead";

const SUPPORTED = ["vi", "en"];
const DEFAULT_LOCALE = "vi";
const getLocaleFromSearch = (search) =>
  new URLSearchParams(search).get("locale")?.toLowerCase() || "";

function CerPartnerLogoCard({ item, t }) {
  return (
    <div className="flex flex-col items-center gap-3 p-3 rounded-lg bg-white hover:shadow-sm transition h-full">
      <div className="w-full h-40 sm:h-48 rounded-md bg-white flex items-center justify-center overflow-hidden">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="max-h-full max-w-full object-contain"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/banner.jpg";
            }}
          />
        ) : (
          <div className="text-xs text-gray-400">{t.noImage}</div>
        )}
      </div>
      <div className="w-full text-sm sm:text-base font-medium text-gray-800 text-center line-clamp-2">
        {item.name}
      </div>
    </div>
  );
}

function FieldPage() {
  // ===== locale: URL -> localStorage -> default
  const location = useLocation();
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

  // i18n labels
  const t = {
    breadcrumb: locale === "vi" ? "Lĩnh vực hoạt động" : "What we do",
    pageFallbackDesc:
      locale === "vi"
        ? "What we do tại ITXEASY: dịch vụ/giải pháp xuất khẩu nông sản Việt Nam – quy trình chuẩn, đối tác chứng nhận quốc tế."
        : "What we do at ITXEASY: Vietnamese agri export services & solutions – standardized processes, global certification partners.",
    certifications: locale === "vi" ? "Chứng nhận" : "Certifications",
    partners: locale === "vi" ? "Đối tác" : "Partners",
    items: locale === "vi" ? "mục" : "items",
    noCerts: locale === "vi" ? "Chưa có chứng nhận." : "No certifications yet.",
    noPartners: locale === "vi" ? "Chưa có đối tác." : "No partners yet.",
    empty: locale === "vi" ? "Không có nội dung nào để hiển thị." : "No content to display.",
    noImage: locale === "vi" ? "Không có ảnh" : "No image",
  };

  const [fieldContent, setFieldContent] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cer/Partner
  const [cpItems, setCpItems] = useState([]);
  const [loadingCp, setLoadingCp] = useState(false);

  const items = useMemo(() => [{ label: t.breadcrumb, to: `/what_we_do${qs}` }], [t.breadcrumb, qs]);

  // fetch Fields (kèm locale)
  useEffect(() => {
    const fetchFieldContent = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/fields${qs}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        const fieldArray = data.items || [];
        setFieldContent(fieldArray);
      } catch (err) {
        console.error("Lỗi khi tải fields:", err);
        setFieldContent([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFieldContent();
  }, [qs]);

  // fetch Cer/Partner once (kèm locale nếu BE hỗ trợ, không ảnh hưởng nếu BE bỏ qua)
  useEffect(() => {
    const fetchAllCp = async () => {
      setLoadingCp(true);
      try {
        const res = await fetch(`/api/cer-partners${qs}`);
        const data = await res.json();
        if (!res.ok || data.ok === false) throw new Error(data.error || "Failed to load cp");
        setCpItems(data.items || []);
      } catch (e) {
        console.error("Lỗi khi tải certifications_partners:", e);
        setCpItems([]);
      } finally {
        setLoadingCp(false);
      }
    };
    fetchAllCp();
  }, [qs]);

  // tách thành 2 nhóm theo type
  const { certifications, partners } = useMemo(() => {
    const list = Array.isArray(cpItems) ? cpItems : [];
    const certs = list.filter((x) => (x.type || "").toLowerCase() === "certification");
    const prts = list.filter((x) => (x.type || "").toLowerCase() === "partner");
    return { certifications: certs, partners: prts };
  }, [cpItems]);

  /* =================== SEO cho What we do =================== */
  const SITE_URL = getSiteOrigin();
  const BRAND = import.meta.env.VITE_BRAND_NAME || "ITXEASY";
  const canonical = `${getCanonicalBase()}/what_we_do`; // hoặc `${...}/what_we_do?locale=${locale}` nếu muốn canonical theo ngôn ngữ

  // Title: ưu tiên field đầu tiên
  const pageTitle = useMemo(() => {
    const first = fieldContent?.[0]?.name?.trim();
    return first ? `${first} | ${t.breadcrumb} | ${BRAND}` : `${t.breadcrumb} | ${BRAND}`;
  }, [fieldContent, t.breadcrumb, BRAND]);

  // Description: gộp 1–2 field đầu (strip markdown)
  const pageDesc = useMemo(() => {
    const a = fieldContent?.[0]?.content || "";
    const b = fieldContent?.[1]?.content || "";
    const raw = [a, b].filter(Boolean).map(stripMd).join(" ");
    return raw ? raw.slice(0, 300) : t.pageFallbackDesc.replace("ITXEASY", BRAND);
  }, [fieldContent, t.pageFallbackDesc, BRAND]);

  // Ảnh OG: ưu tiên ảnh field đầu
  const ogImage = fieldContent?.[0]?.image_url || undefined;

  // Keywords: field + certifications + partners
  const keywords = useMemo(() => {
    const fieldNames = (fieldContent || []).map((x) => x?.name);
    const certNames = (certifications || []).map((x) => x?.name);
    const partnerNames = (partners || []).map((x) => x?.name);
    const base =
      locale === "vi"
        ? ["Lĩnh vực hoạt động", "dịch vụ", "giải pháp", "xuất khẩu", "nông sản", "Vietnam export", BRAND]
        : ["What we do", "services", "solutions", "export", "agriculture", "Vietnam export", BRAND];
    return Array.from(new Set([...base, ...fieldNames, ...certNames, ...partnerNames].filter(Boolean)));
  }, [fieldContent, certifications, partners, locale, BRAND]);

  // Thời gian xuất bản/chỉnh sửa từ field + cpItems
  const publishedTime = useMemo(() => {
    const dates = [...(fieldContent || []), ...(cpItems || [])]
      .map((x) => x?.created_at)
      .filter(Boolean)
      .sort();
    return dates[0];
  }, [fieldContent, cpItems]);

  const modifiedTime = useMemo(() => {
    const dates = [...(fieldContent || []), ...(cpItems || [])]
      .map((x) => x?.updated_at || x?.created_at)
      .filter(Boolean)
      .sort();
    return dates[dates.length - 1] || publishedTime;
  }, [fieldContent, cpItems, publishedTime]);

  // noindex nếu không có nội dung gì
  const noindex = !loading && fieldContent.length === 0 && certifications.length === 0 && partners.length === 0;

  // JSON-LD
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

  const collectionPageLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: pageTitle,
      description: pageDesc,
      url: canonical,
      isPartOf: { "@type": "WebSite", name: BRAND, url: SITE_URL },
    }),
    [pageTitle, pageDesc, canonical, BRAND, SITE_URL]
  );

  const servicesLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: (fieldContent || []).map((f, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Service",
          name: f?.name,
          description: stripMd(f?.content || "").slice(0, 200) || undefined,
          image: f?.image_url || undefined,
          provider: { "@type": "Organization", name: BRAND, url: SITE_URL },
        },
      })),
    }),
    [fieldContent, BRAND, SITE_URL]
  );

  const certificationsLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Certifications",
      itemListElement: (certifications || []).map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: { "@type": "Thing", name: c?.name, image: c?.image_url || undefined },
      })),
    }),
    [certifications]
  );

  const partnersLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Partners",
      itemListElement: (partners || []).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: { "@type": "Organization", name: p?.name, logo: p?.image_url || undefined },
      })),
    }),
    [partners]
  );
  /* ============================================================ */

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ⬇️ SEO cho trang What we do */}
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
        jsonLd={[breadcrumbLd, collectionPageLd, servicesLd, certificationsLd, partnersLd]}
      />

      <TopNavigation />
      <Breadcrumbs items={items} className="mt-16" />
      <FieldHeaderBanner />

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="h-10 w-10 border-2 border-blue-800 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <main className="bg-white">
          {fieldContent.length > 0 ? (
            fieldContent.map((item) => (
              <section key={item.id} className="py-12 px-4">
                <div className="max-w-4xl mx-auto">
                  {/* Tên */}
                  <h2 className="text-3xl font-bold text-yellow-600 mb-6">{item.name}</h2>

                  {/* Nội dung (Markdown) */}
                  <div className="prose max-w-none prose-p:leading-relaxed text-gray-700">
                    <MarkdownOnly value={item.content} />
                  </div>

                  {/* Ảnh */}
                  {item.image_url && (
                    <div className="mt-8">
                      <img
                        src={item.image_url || "/banner.jpg"}
                        alt={item.name || "Field image"}
                        className="w-full max-h-[520px] object-cover rounded-lg shadow"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/banner.jpg";
                        }}
                      />
                    </div>
                  )}

                  {/* ====== Cer & Partner ====== */}
                  <div className="mt-10 space-y-10">
                    {/* Chứng nhận */}
                    {(loadingCp || certifications.length > 0) && (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-semibold text-gray-900">{t.certifications}</h3>
                          {!loadingCp && (
                            <span className="text-sm text-gray-500">
                              {certifications.length} {t.items}
                            </span>
                          )}
                        </div>

                        {loadingCp ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                              <div key={`cert-skeleton-${i}`} className="h-40 rounded-lg bg-gray-100 animate-pulse" />
                            ))}
                          </div>
                        ) : certifications.length > 0 ? (
                          <>
                            {/* MOBILE */}
                            <div className="sm:hidden -mx-4 px-4 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar">
                              <div className="flex gap-4">
                                {certifications.map((cp) => (
                                  <div key={`cert-${cp.id}`} className="snap-center shrink-0 w-[92vw]">
                                    <CerPartnerLogoCard item={cp} t={t} />
                                  </div>
                                ))}
                              </div>
                            </div>
                            {/* DESKTOP */}
                            <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                              {certifications.map((cp) => (
                                <CerPartnerLogoCard key={`cert-grid-${cp.id}`} item={cp} t={t} />
                              ))}
                            </div>
                          </>
                        ) : (
                          <p className="text-gray-500 text-sm">{t.noCerts}</p>
                        )}
                      </div>
                    )}

                    {/* Đối tác */}
                    {(loadingCp || partners.length > 0) && (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-semibold text-gray-900">{t.partners}</h3>
                          {!loadingCp && (
                            <span className="text-sm text-gray-500">
                              {partners.length} {t.items}
                            </span>
                          )}
                        </div>

                        {loadingCp ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                              <div key={`partner-skeleton-${i}`} className="h-40 rounded-lg bg-gray-100 animate-pulse" />
                            ))}
                          </div>
                        ) : partners.length > 0 ? (
                          <>
                            {/* MOBILE */}
                            <div className="sm:hidden -mx-4 px-4 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar">
                              <div className="flex gap-4">
                                {partners.map((cp) => (
                                  <div key={`partner-${cp.id}`} className="snap-center shrink-0 w-[92vw]">
                                    <CerPartnerLogoCard item={cp} t={t} />
                                  </div>
                                ))}
                              </div>
                            </div>
                            {/* DESKTOP */}
                            <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                              {partners.map((cp) => (
                                <CerPartnerLogoCard key={`partner-grid-${cp.id}`} item={cp} t={t} />
                              ))}
                            </div>
                          </>
                        ) : (
                          <p className="text-gray-500 text-sm">{t.noPartners}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            ))
          ) : (
            <div className="text-center py-20 text-gray-500">
              <p>{t.empty}</p>
            </div>
          )}
        </main>
      )}

      <Footer />
    </div>
  );
}

export default FieldPage;
