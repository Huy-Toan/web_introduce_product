// src/components/AboutSection.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import MarkdownOnly from "./MarkdownOnly"

const SUPPORTED = ["vi", "en"];
const DEFAULT_LOCALE = "vi";

function pickLocale(propLocale, search) {
  const urlLc =
    new URLSearchParams(search).get("locale")?.toLowerCase() || "";
  const lsLc = (localStorage.getItem("locale") || "").toLowerCase();
  const fromProp = (propLocale || "").toLowerCase();

  if (SUPPORTED.includes(fromProp)) return fromProp;
  if (SUPPORTED.includes(urlLc)) return urlLc;
  if (SUPPORTED.includes(lsLc)) return lsLc;
  return DEFAULT_LOCALE;
}

// Cắt text không đứt từ
function truncateText(text, maxLength = 120) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  const truncated = text.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(" ");
  if (lastSpaceIndex > maxLength * 0.8) {
    return truncated.substring(0, lastSpaceIndex) + "...";
  }
  return truncated + "...";
}

function TruncatedMarkdown({ text, maxLength = 120 }) {
  const truncated = truncateText(text, maxLength);
  return <MarkdownOnly value={truncated} />;
}

const AboutSection = ({ locale: localeProp }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const locale = useMemo(
    () => pickLocale(localeProp, location.search),
    [localeProp, location.search]
  );

  const [aboutData, setAboutData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Đồng bộ <html lang> và localStorage
  useEffect(() => {
    try {
      document.documentElement.lang = locale;
      localStorage.setItem("locale", locale);
    } catch { }
  }, [locale]);

  // Fetch theo locale
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/about?locale=${encodeURIComponent(locale)}`, {
          signal: ac.signal,
        });
        const data = await res.json();
        const aboutArray = Array.isArray(data.about) ? data.about : [];
        setAboutData(aboutArray);
      } catch (err) {
        console.error("Failed to load about data:", err);
        setAboutData([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [locale]);

  const t = useMemo(
    () =>
      locale === "vi"
        ? {
          tagline: "CHẤT LƯỢNG TƯƠI – GIAO HÀNG TOÀN CẦU",
          learnMore: "Tìm hiểu thêm →",
        }
        : {
          tagline: "FRESH QUALITY – GLOBAL DELIVERY",
          learnMore: "Learn more →",
        },
    [locale]
  );

  if (loading) {
    return (
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="h-10 w-10 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </section>
    );
  }

  const first = aboutData?.[0];
  const second = aboutData?.[1];

  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            {first ? (
              <>
                <h1
                  className="text-xl font-semibold mb-6 tracking-wide"
                  style={{ color: '#16a34a' }} 
                >
                  {t.tagline}
                </h1>


                <h2 className="text-4xl lg:text-5xl font-bold text-yellow-600 mb-4 tracking-wider">
                  {first.title}
                </h2>

                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <TruncatedMarkdown text={first.content} maxLength={150} />

                  {second && (
                    <div className="mt-6">
                      <p className="font-semibold italic text-green-800 mb-2">
                        {second.title}:
                      </p>
                      <TruncatedMarkdown text={second.content} maxLength={150} />
                    </div>
                  )}
                </div>

                <button
                  className="bg-gradient-to-r cursor-pointer from-yellow-500 to-yellow-600 text-white px-8 py-3 rounded-full font-semibold hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
                  onClick={() => navigate(`/about?locale=${locale}`)}
                >
                  {t.learnMore}
                </button>
              </>
            ) : (
              <>
                <h1
                  className="text-xl font-semibold mb-6 tracking-wide"
                  style={{ color: '#16a34a' }} // Tailwind green-600
                >
                  {t.tagline}
                </h1>


                <p className="text-gray-600">
                  {locale === "vi"
                    ? "Chưa có nội dung giới thiệu."
                    : "No about content yet."}
                </p>
                <button
                  className="bg-gradient-to-r cursor-pointer from-yellow-500 to-yellow-600 text-white px-8 py-3 rounded-full font-semibold hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
                  onClick={() => navigate(`/about?locale=${locale}`)}
                >
                  {t.learnMore}
                </button>
              </>
            )}
          </div>

          <div className="relative">
            <div className="rounded-xl overflow-hidden shadow-2xl transform hover:-translate-y-2 transition-transform duration-300">
              <img
                src={first?.image_url || "/banner.jpg"}
                alt={first?.title || "About Image"}
                className="w-full h-[500px] object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/banner.jpg";
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
