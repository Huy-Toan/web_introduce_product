// NewsCard.jsx
const SUPPORTED = ["vi", "en"];
const DEFAULT_LOCALE = "vi";

function getLocale() {
  const lsLc = (localStorage.getItem("locale") || "").toLowerCase();
  return SUPPORTED.includes(lsLc) ? lsLc : DEFAULT_LOCALE;
}

export const NewsCard = ({ news, onClick }) => {
  const locale = getLocale();

  const t = {
    publishedAt: locale === "vi" ? "Ngày đăng" : "Published on",
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="aspect-video overflow-hidden">
        <img
          src={news.image_url || "/banner.jpg"}
          alt={news.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
          {news.title}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-3">
          {t.publishedAt}:{" "}
          {new Date(news.created_at).toLocaleDateString(
            locale === "vi" ? "vi-VN" : "en-US",
            { year: "numeric", month: "long", day: "numeric" }
          )}
        </p>
      </div>
    </div>
  );
};
