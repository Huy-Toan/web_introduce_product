// helper: cắt theo ký tự, tránh cắt giữa từ
const truncateText = (s = "", max = 70) => {
  const str = (s || "").trim();
  if (str.length <= max) return str;
  const cut = str.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut) + "…";
};

function SidebarNews({ newsItems = [], onSelectNews, currentNewsId }) {
  return (
    <aside className="w-full md:w-80 bg-white p-0 border rounded-md shadow-sm self-start overflow-hidden">
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-center py-4 px-6 font-bold text-lg">
        NEW POSTS
      </div>

      <div className="p-0">
        {newsItems.map((newsItem, index) => (
          <div
            key={newsItem.id}
            onClick={() => onSelectNews(newsItem)}
            className={`flex items-center p-4 border-b border-gray-100 cursor-pointer 
                        hover:bg-yellow-200 hover:pl-6 transition-all duration-300
                        ${currentNewsId === newsItem.id ? "bg-blue-50 border-l-4 border-l-yellow-400" : ""}
                        ${index === newsItems.length - 1 ? "border-b-0" : ""}`}
          >
            <div className="w-15 h-15 flex-shrink-0 mr-4 rounded-lg overflow-hidden bg-gray-100">
              <img src={newsItem.image_url || "/banner.jpg"} alt={newsItem.title}
                   className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 min-w-0">
              <h3
                className={`text-sm leading-tight line-clamp-2
                            ${currentNewsId === newsItem.id ? "font-semibold text-blue-800" : "font-medium text-gray-700"}`}
                title={newsItem.title} // hover thấy full
              >
                {truncateText(newsItem.title, 70)}
              </h3>

              {newsItem.created_at && (
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(newsItem.created_at).toLocaleDateString("vi-VN")}
                </p>
              )}
            </div>
          </div>
        ))}

        {newsItems.length === 0 && (
          <div className="p-6 text-center text-gray-500">Chưa có bài viết nào</div>
        )}
      </div>
    </aside>
  );
}
export default SidebarNews;
