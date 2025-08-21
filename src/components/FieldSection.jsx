import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router"; // đổi sang "react-router-dom" nếu dự án bạn dùng lib đó

// bỏ markdown cơ bản cho hiển thị plain text
function stripMarkdown(md = "") {
  return md
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")          // ![alt](url)
    .replace(/\[[^\]]*\]\([^)]+\)/g, "$1")         // [text](url) -> text
    .replace(/[`*_~>#-]+/g, "")                    // ký tự markdown
    .replace(/\s{2,}/g, " ")                       // nhiều space -> 1 space
    .trim();
}

// cắt theo SỐ TỪ
function truncateWords(text = "", maxWords = 130) {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + " …";
}

// slug đơn giản để điều hướng theo tên (fallback id)
function slugify(s = "") {
  return s
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function FieldHighlightsSection() {
  const [fieldContent, setFieldContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  return (
    <section className="bg-gradient-to-br from-yellow-50/40 via-white to-white py-16 sm:py-20">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <p className="text-gray-600 text-base sm:text-lg mb-3 font-medium tracking-wide">
            SEARCH NEWEST CONTENT OF THE WEEK
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-yellow-600 mb-4 sm:mb-6 tracking-wider">
            FIELDS & INSIGHTS
          </h2>
          <p className="text-gray-700 text-lg sm:text-xl italic">From us to you.</p>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 rounded-2xl bg-white shadow-sm border border-gray-100"
              >
                <div className="h-56 bg-gray-100 animate-pulse rounded-xl" />
                <div className="space-y-3">
                  <div className="h-7 w-2/3 bg-gray-100 animate-pulse rounded" />
                  <div className="h-4 w-full bg-gray-100 animate-pulse rounded" />
                  <div className="h-4 w-5/6 bg-gray-100 animate-pulse rounded" />
                  <div className="h-4 w-4/6 bg-gray-100 animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : fieldContent.length === 0 ? (
          <div className="text-center py-20 text-gray-500">Không có nội dung nào để hiển thị.</div>
        ) : (
          <div className="space-y-8">
            {fieldContent.map((item, idx) => {
              const name = item?.name || "Untitled";
              const content = item?.content || "";
              const plain = stripMarkdown(content);
              const short = truncateWords(plain, 90);
              const img = item?.image_url;
              const detailPath = item?.slug
                ? `/what_we_do`
                : `/what_we_do`;

              return (
                <article
                  key={item?.id ?? idx}
                  className={[
                    "grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 p-5 sm:p-6 lg:p-8",
                    "rounded-2xl bg-white shadow-lg/40 shadow-sm border border-gray-100",
                    "opacity-0 translate-y-4",
                    "animate-[fadeIn_.6s_ease-out_forwards]",
                  ].join(" ")}
                  style={{ animationDelay: `${Math.min(idx, 6) * 100}ms` }}
                >
                  {/* LEFT = IMAGE */}
                  <div className="order-1">
                    <div className="rounded-xl overflow-hidden shadow-md">
                      <img
                        src={img || "/banner.jpg"}
                        alt={name}
                        className="w-full h-56 sm:h-64 lg:h-72 object-cover transition-transform duration-300 hover:scale-[1.02]"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/banner.jpg";
                        }}
                      />
                    </div>
                  </div>

                  {/* RIGHT = TEXT */}
                  <div className="order-2 flex flex-col justify-center text-justify">
                    <h3 className="text-2xl sm:text-3xl font-bold text-yellow-600 mb-4 leading-tight">
                     Thế mạnh của chúng tôi:  {name}
                    </h3>
                    <p className="text-gray-700 leading-relaxed mb-6">
                      {short}
                    </p>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        className="bg-gradient-to-r cursor-pointer from-yellow-500 to-yellow-600 text-white px-6 py-2.5 rounded-full font-semibold hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
                        onClick={() => navigate(detailPath)}
                        aria-label={`Xem chi tiết ${name}`}
                      >
                        Learn more →
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
