// src/pages/AboutPage.jsx
import TopNavigation from "../components/Navigation";
import Footer from "../components/Footer";
import { useEffect, useState, useMemo } from "react";
import AboutHeaderBanner from "../components/AboutBanner";
import MarkdownOnly from "../components/MarkdownOnly";
import Breadcrumbs from "../components/Breadcrumbs";
import {
  getSiteOrigin,
  getCanonicalBase,
  isNonCanonicalHost,
} from "../lib/siteUrl";
import SEO, { stripMd } from "../components/SEOhead";

function AboutPage() {
  const [aboutContent, setAboutContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const DEFAULT_IMAGE = "/banner.jpg";

  const items = useMemo(() => [{ label: "About Us", to: "/about" }], []);

  useEffect(() => {
    const fetchAboutContent = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/about");
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
  }, []);

  /* =================== SEO cho About =================== */
  const SITE_URL = getSiteOrigin();
  const BRAND = import.meta.env.VITE_BRAND_NAME || "ITXEASY";
  const canonical = `${getCanonicalBase()}/about`;

  // Tiêu đề: ưu tiên title mục đầu tiên, fallback “About Us | BRAND”
  const pageTitle = useMemo(() => {
    const t = aboutContent?.[0]?.title?.trim();
    return t ? `${t} | ${BRAND}` : `About Us | ${BRAND}`;
  }, [aboutContent, BRAND]);

  // Mô tả: gộp 1–2 đoạn đầu (đã strip markdown) + cắt gọn
  const pageDesc = useMemo(() => {
    const a = aboutContent?.[0]?.content || "";
    const b = aboutContent?.[1]?.content || "";
    const raw = [a, b].filter(Boolean).map(stripMd).join(" ");
    return raw
      ? raw.slice(0, 300)
      : `Giới thiệu ${BRAND}: đơn vị xuất khẩu nông sản Việt Nam, quy trình tiêu chuẩn, đối tác toàn cầu.`;
  }, [aboutContent, BRAND]);

  // Keywords cơ bản + theo title mục
  const keywords = useMemo(() => {
    const extra = (aboutContent || []).map((s) => s?.title).filter(Boolean);
    const base = [
      "About Us",
      "Giới thiệu",
      "ITXEASY",
      "xuất khẩu",
      "nông sản",
      "Vietnam export",
    ];
    return Array.from(new Set([...base, ...extra]));
  }, [aboutContent]);

  // Ảnh OG: ưu tiên ảnh mục đầu, fallback banner nếu bạn có
  const ogImage = aboutContent?.[0]?.image_url || undefined;

  // published/modified: lấy mốc sớm nhất & muộn nhất trong mảng
  const publishedTime = useMemo(() => {
    const dates = (aboutContent || [])
      .map((s) => s?.created_at)
      .filter(Boolean);
    return dates.length ? dates.sort()[0] : undefined;
  }, [aboutContent]);

  const modifiedTime = useMemo(() => {
    const dates = (aboutContent || [])
      .map((s) => s?.updated_at || s?.created_at)
      .filter(Boolean);
    return dates.length ? dates.sort().slice(-1)[0] : publishedTime;
  }, [aboutContent, publishedTime]);

  // noindex nếu rỗng (tránh thin content)
  const noindex = !loading && (!aboutContent || aboutContent.length === 0);

  // JSON-LD
  const breadcrumbLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: `${SITE_URL}/`,
        },
        { "@type": "ListItem", position: 2, name: "About Us", item: canonical },
      ],
    }),
    [SITE_URL, canonical]
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
      // sameAs: ["https://www.facebook.com/yourpage", "..."] // nếu có, thêm sau
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
            <h1 className="text-4xl font-bold text-yellow-600 mb-4">ITXEASY</h1>
            <h2 className="text-2xl font-semibold text-gray-700">
              CHOOSE US - CHOOSE QUALITY
            </h2>
            <div className="w-24 h-1 bg-yellow-500 mx-auto"></div>
          </div>

          {aboutContent.length > 0 ? (
            <>
              {/* First Section - About Us with Image on Left */}
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
                          {aboutContent[0]?.title || "About Us"}
                        </h4>
                      </div>

                      <div className="space-y-6 text-gray-600 leading-relaxed">
                        <div className="whitespace-pre-wrap text-justify">
                          <MarkdownOnly
                            value={aboutContent[0]?.content || ""}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Second Section - About Us with Image on Right */}
              {aboutContent[1] && (
                <section className="py-16 px-4 bg-gray-50">
                  <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                      {/* Content */}
                      <div>
                        <div className="mb-6">
                          <h4 className="text-3xl font-bold text-yellow-600 mb-6">
                            {aboutContent[1]?.title || "Our Story"}
                          </h4>
                        </div>

                        <div className="space-y-6 text-gray-600 leading-relaxed">
                          <div className="whitespace-pre-wrap text-justify">
                            <MarkdownOnly
                              value={aboutContent[1]?.content || ""}
                            />
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

               <section className="py-16 bg-gray-100 text-center">
            <div className="max-w-4xl mx-auto">
                <blockquote className="text-2xl italic text-gray-700 font-semibold mb-6">
                “Sản phẩm chất lượng cao bắt đầu từ quy trình chuẩn mực.”
                </blockquote>

                <div className="flex flex-wrap justify-center items-center gap-4 text-xl font-bold text-yellow-700">
                <span>Thu hoạch</span>
                <span>→</span>
                <span>Sơ chế</span>
                <span>→</span>
                <span>Cắt</span>
                <span>→</span>
                <span>Cấp đông</span>
                <span>→</span>
                <span>Đóng gói</span>
                <span>→</span>
                <span>Bảo quản</span>
                </div>
            </div>
            </section>


              {/* Production Steps */}
              {aboutContent.slice(2).map((step, index) => {
                const reverse = index % 2 === 1;
                return (
                  <section
                    key={step.id ?? `about-step-${index}`}
                    className={`py-16 px-4 ${reverse ? "" : "bg-gray-50"}`}
                  >
                    <div className="max-w-4xl mx-auto">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {reverse ? (
                          <>
                            {/* Image on Left */}
                            <div className="order-2 lg:order-1">
                              <img
                                src={step?.image_url || DEFAULT_IMAGE}
                                alt={step?.title || `Bước ${index + 1}`}
                                className="w-full h-[500px] object-cover rounded-lg shadow-lg"
                                loading="lazy"
                              />
                            </div>

                            {/* Content on Right */}
                            <div className="order-1 lg:order-2">
                              <h3 className="text-3xl font-bold text-yellow-600 mb-8">
                                {`Bước ${index + 1}: ${step?.title || ""}`}
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
                            {/* Content on Left */}
                            <div>
                              <h3 className="text-3xl font-bold text-yellow-600 mb-8">
                                {`Bước ${index + 1}: ${step?.title || ""}`}
                              </h3>

                              <div className="space-y-6 text-gray-600">
                                <div className="whitespace-pre-wrap text-justify">
                                  <MarkdownOnly value={step?.content || ""} />
                                </div>
                              </div>
                            </div>

                            {/* Image on Right */}
                            <div>
                              <img
                                src={step?.image_url || DEFAULT_IMAGE}
                                alt={step?.title || `Bước ${index + 1}`}
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
              <p>Không có nội dung nào để hiển thị.</p>
              {/* Khối ảnh mặc định để bạn test layout ngay cả khi không có dữ liệu */}
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
