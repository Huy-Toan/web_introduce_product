import { useEffect, useRef } from "react";

function SidebarNews({ 
  newsItems = [], 
  onSelectNews,
  currentNewsId,
  maxVisible = 5,
}) {
  // Lưu ref từng item để auto-scroll item đang active
  const itemRefs = useRef({});

  useEffect(() => {
    if (!currentNewsId) return;
    const el = itemRefs.current[currentNewsId];
    if (el) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [currentNewsId]);

  return (
    <aside className="w-full md:w-80 bg-white p-0 border rounded-md shadow-sm self-start mt-12 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-center py-4 px-6 font-bold text-lg">
        NEW POSTS
      </div>

      <div
        role="listbox"
        aria-label="Bài viết mới"
        style={{ "--max-items": maxVisible }}
        className="p-0 overflow-y-auto overscroll-contain max-h-[calc(var(--max-items)*5.25rem)]"
      >
        {newsItems.map((newsItem, index) => {
          const active = currentNewsId === newsItem.id;

          return (
            <div
              key={newsItem.id}
              ref={(el) => (itemRefs.current[newsItem.id] = el)}
              role="option"
              aria-selected={active}
              aria-current={active ? "true" : undefined}
              onClick={() => onSelectNews(newsItem)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectNews(newsItem);
                }
              }}
              tabIndex={0}
              className={[
                "relative flex items-start gap-4 p-4 border-b border-gray-100 cursor-pointer transition-all duration-300 outline-none",
                "hover:bg-yellow-100 hover:pl-6 focus:bg-yellow-100",
                index === newsItems.length - 1 ? "border-b-0" : "",
                "min-h-[5.25rem]",
                active ? "bg-yellow-100" : ""
              ].join(" ")}
            >

              <span
                aria-hidden="true"
                className={[
                  "absolute inset-y-0 left-0 w-1",
                  active ? "bg-yellow-100" : "bg-transparent"
                ].join(" ")}
              />

              <div className={[
                "flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 w-[60px] h-[60px]",
                active ? "ring-2 ring-yellow-400 ring-offset-2 ring-offset-blue-50" : ""
              ].join(" ")}>
                <img
                  src={newsItem.image_url}
                  alt={newsItem.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2">
                  <h3
                    className={[
                      "text-sm leading-tight line-clamp-2",
                      active ? "font-semibold text-blue-800" : "font-medium text-gray-700"
                    ].join(" ")}
                    title={newsItem.title}
                  >
                    {newsItem.title}
                  </h3>

                  {active && (
                    <span className="ml-auto shrink-0 rounded-full bg-yellow-100 text-yellow-800 text-[10px] font-semibold px-2 py-0.5">
                      Đang xem
                    </span>
                  )}
                </div>

                {newsItem.created_at && (
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(newsItem.created_at).toLocaleDateString("vi-VN")}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {newsItems.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            Chưa có bài viết nào
          </div>
        )}
      </div>
    </aside>
  );
}

export default SidebarNews;
