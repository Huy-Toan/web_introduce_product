// src/pages/AboutPage.jsx
import TopNavigation from "../components/Navigation";
import Footer from "../components/Footer";
import { useEffect, useState, useMemo } from "react";
import AboutHeaderBanner from "../components/AboutBanner";
import MarkdownOnly from "../components/MarkdownOnly";
import Breadcrumbs from "../components/Breadcrumbs";
import { getSiteOrigin, getCanonicalBase, isNonCanonicalHost } from "../lib/siteUrl";
import SEO, { stripMd } from "../components/SEOhead";

function AboutPage() {
  const [aboutContent, setAboutContent] = useState([]);
  const [loading, setLoading] = useState(false);

  const items = useMemo(
    () => [{ label: "About Us", to: "/about" }],
    []
  );

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
    return raw ? raw.slice(0, 300) : `Giới thiệu ${BRAND}: đơn vị xuất khẩu nông sản Việt Nam, quy trình tiêu chuẩn, đối tác toàn cầu.`;
  }, [aboutContent, BRAND]);

  // Keywords cơ bản + theo title mục
  const keywords = useMemo(() => {
    const extra = (aboutContent || []).map(s => s?.title).filter(Boolean);
    const base = ["About Us", "Giới thiệu", "ALLXONE", "xuất khẩu", "nông sản", "Vietnam export"];
    return Array.from(new Set([...base, ...extra]));
  }, [aboutContent]);

  // Ảnh OG: ưu tiên ảnh mục đầu, fallback banner nếu bạn có
  const ogImage = aboutContent?.[0]?.image_url || undefined;

  // published/modified: lấy mốc sớm nhất & muộn nhất trong mảng
  const publishedTime = useMemo(() => {
    const dates = (aboutContent || []).map(s => s?.created_at).filter(Boolean);
    return dates.length ? dates.sort()[0] : undefined;
  }, [aboutContent]);

  const modifiedTime = useMemo(() => {
    const dates = (aboutContent || [])
      .map(s => s?.updated_at || s?.created_at)
      .filter(Boolean);
    return dates.length ? dates.sort().slice(-1)[0] : publishedTime;
  }, [aboutContent, publishedTime]);

  // noindex nếu rỗng (tránh thin content)
  const noindex = !loading && (!aboutContent || aboutContent.length === 0);

  // JSON-LD
  const breadcrumbLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "About Us", item: canonical }
    ]
  }), [SITE_URL, canonical]);

  const aboutPageLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: pageTitle,
    description: pageDesc,
    url: canonical,
    isPartOf: { "@type": "WebSite", name: BRAND, url: SITE_URL }
  }), [pageTitle, pageDesc, canonical, BRAND, SITE_URL]);

  const organizationLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND,
    url: SITE_URL,
    logo: `${SITE_URL}/logo-512.png`
    // sameAs: ["https://www.facebook.com/yourpage", "..."] // nếu có, thêm sau
  }), [BRAND, SITE_URL]);
  /* ===================================================== */

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ⬇️ Đưa SEO vào đầu trang */}
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
      <Breadcrumbs items={items} className="mt-16"/>
      <AboutHeaderBanner />

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="h-10 w-10 border-2 border-blue-800 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <main className="bg-white">
          {/* Header Section */}
          <div className="text-center py-12 bg-gray-50">
            <h1 className="text-4xl font-bold text-yellow-600 mb-4">
              ALLXONE
            </h1>
            <h2 className="text-2xl font-semibold text-gray-700">
              CHOOSE US - CHOOSE QUALITY
            </h2>
            <div className="w-24 h-1 bg-yellow-500 mx-auto"></div>
          </div>

          {aboutContent.length > 0 ? (
            aboutContent.map((item, index) => (
              <div key={item.id}>
                {/* First Section - About Us with Image on Left */}
                {index === 0 && (
                  <section className="py-16 px-4">
                    <div className="max-w-7xl mx-auto">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="order-2 lg:order-1">
                          {item.image_url && (
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="w-full h-[400px] object-cover rounded-lg shadow-lg"
                            />
                          )}
                        </div>
                        <div className="order-1 lg:order-2">
                          <div className="mb-6">
                            <h4 className="text-3xl font-bold text-yellow-600 mb-6">
                              {item.title}
                            </h4>
                          </div>
                          <div className="space-y-6 text-gray-600 leading-relaxed">
                            <p className="whitespace-pre-wrap text-justify">
                              <MarkdownOnly value={item.content} />
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {/* Second Section - Mission/Vision with Image on Right */}
                {index === 1 && (
                  <section className="py-16 px-4 bg-gray-50">
                    <div className="max-w-7xl mx-auto">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                          <h3 className="text-3xl font-bold text-yellow-600 mb-8">
                            {item.title}
                          </h3>
                          <div className="space-y-6 text-gray-600">
                            <div className="whitespace-pre-wrap text-justify">
                              <MarkdownOnly value={item.content} />
                            </div>
                          </div>
                        </div>
                        <div>
                          {item.image_url && (
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="w-full h-[500px] object-cover rounded-lg shadow-lg"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </section>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-20 text-gray-500">
              <p>Không có nội dung nào để hiển thị.</p>
            </div>
          )}
        </main>
      )}

      <Footer />
    </div>
  );
}

export default AboutPage;
