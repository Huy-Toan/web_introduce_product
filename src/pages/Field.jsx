import TopNavigation from "../components/Navigation";
import Footer from "../components/Footer";
import { useEffect, useMemo, useState } from "react";
import AboutHeaderBanner from "../components/AboutBanner";
import MarkdownOnly from "../components/MarkdownOnly";

// Thẻ logo/name cho Chứng nhận/Đối tác
function CerPartnerLogoCard({ item }) {
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
          <div className="text-xs text-gray-400">No image</div>
        )}
      </div>
      <div className="w-full text-sm sm:text-base font-medium text-gray-800 text-center line-clamp-2">
        {item.name}
      </div>
    </div>
  );
}



function FieldPage() {
  const [fieldContent, setFieldContent] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cer/Partner
  const [cpItems, setCpItems] = useState([]); // lấy tất cả rồi tách
  const [loadingCp, setLoadingCp] = useState(false);

  // fetch Fields
  useEffect(() => {
    const fetchFieldContent = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/fields");
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
  }, []);

  // fetch Cer/Partner once
  useEffect(() => {
    const fetchAllCp = async () => {
      setLoadingCp(true);
      try {
        const res = await fetch("/api/cer-partners");
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
  }, []);

  // tách thành 2 nhóm theo type
  const { certifications, partners } = useMemo(() => {
    const list = Array.isArray(cpItems) ? cpItems : [];
    const certs = list.filter((x) => (x.type || "").toLowerCase() === "certification");
    const prts = list.filter((x) => (x.type || "").toLowerCase() === "partner");
    return { certifications: certs, partners: prts };
  }, [cpItems]);

return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />
      <AboutHeaderBanner />

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
                  <h2 className="text-3xl font-bold text-yellow-600 mb-6">
                    {item.name}
                  </h2>

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

                  {/* ====== Phần bên dưới hình: Cer & Partner ====== */}
                  <div className="mt-10 space-y-10">
                    {/* Chứng nhận */}
                    {(loadingCp || certifications.length > 0) && (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-semibold text-gray-900">
                            Chứng nhận
                          </h3>
                          {!loadingCp && (
                            <span className="text-sm text-gray-500">
                              {certifications.length} mục
                            </span>
                          )}
                        </div>

                        {loadingCp ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                              <div
                                key={`cert-skeleton-${i}`}
                                className="h-40 rounded-lg bg-gray-100 animate-pulse"
                              />
                            ))}
                          </div>
                        ) : certifications.length > 0 ? (
                          <>
                            {/* MOBILE: 1 item/slide, scroll ngang */}
                            <div className="sm:hidden -mx-4 px-4 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar">
                              <div className="flex gap-4">
                                {certifications.map((cp) => (
                                  <div key={`cert-${cp.id}`} className="snap-center shrink-0 w-[92vw]">
                                    <CerPartnerLogoCard item={cp} />
                                  </div>
                                ))}
                              </div>
                            </div>
                            {/* DESKTOP: grid */}
                            <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                              {certifications.map((cp) => (
                                <CerPartnerLogoCard key={`cert-grid-${cp.id}`} item={cp} />
                              ))}
                            </div>
                          </>
                        ) : (
                          <p className="text-gray-500 text-sm">Chưa có chứng nhận.</p>
                        )}
                      </div>
                    )}

                    {/* Đối tác */}
                    {(loadingCp || partners.length > 0) && (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-semibold text-gray-900">
                            Đối tác
                          </h3>
                          {!loadingCp && (
                            <span className="text-sm text-gray-500">
                              {partners.length} mục
                            </span>
                          )}
                        </div>

                        {loadingCp ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                              <div
                                key={`partner-skeleton-${i}`}
                                className="h-40 rounded-lg bg-gray-100 animate-pulse"
                              />
                            ))}
                          </div>
                        ) : partners.length > 0 ? (
                          <>
                            {/* MOBILE */}
                            <div className="sm:hidden -mx-4 px-4 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar">
                              <div className="flex gap-4">
                                {partners.map((cp) => (
                                  <div key={`partner-${cp.id}`} className="snap-center shrink-0 w-[92vw]">
                                    <CerPartnerLogoCard item={cp} />
                                  </div>
                                ))}
                              </div>
                            </div>
                            {/* DESKTOP */}
                            <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                              {partners.map((cp) => (
                                <CerPartnerLogoCard key={`partner-grid-${cp.id}`} item={cp} />
                              ))}
                            </div>
                          </>
                        ) : (
                          <p className="text-gray-500 text-sm">Chưa có đối tác.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </section>
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

export default FieldPage;
