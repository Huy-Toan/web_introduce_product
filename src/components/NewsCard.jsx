// NewsCard.jsx
export const NewsCard = ({ news, onClick, formatDate }) => {
  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="aspect-video overflow-hidden">
        <img
          src={news.image_url}
          alt={news.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          {news.category && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
              {news.category}
            </span>
          )}
          <span className="text-gray-500 text-sm">
            {formatDate(news.created_at)}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
          {news.title}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-3">
          {news.summary}
        </p>
        <div className="mt-4">
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Đọc thêm →
          </button>
        </div>
      </div>
    </div>
  );
};

