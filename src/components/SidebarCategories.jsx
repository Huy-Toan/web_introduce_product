function SidebarCategories({
  categories = [],
  activeSlug = null,
  onSelectSlug = () => {},
  loading = false,
  maxVisible = 5, // số mục tối đa hiển thị trước khi scroll
}) {
  return (
    <aside className="w-full md:w-64 bg-white p-4 border rounded-md shadow-sm self-start">
      <h2 className="text-lg font-bold mb-4">Danh mục</h2>

      {loading ? (
        <div className="text-gray-500">Đang tải danh mục...</div>
      ) : (
        <ul
          // mỗi item cao 2.75rem (h-11) -> maxHeight = maxVisible * 2.75rem
          style={{ '--max-items': maxVisible }}
          className="space-y-2 overflow-y-auto max-h-[calc(var(--max-items)*2.75rem)] pr-1"
        >
          <li
            onClick={() => onSelectSlug(null)}
            className={`cursor-pointer px-3 h-11 flex items-center rounded-md hover:bg-green-100 ${
              !activeSlug ? 'bg-green-200 font-semibold' : ''
            }`}
          >
            <span className="block truncate">Tất cả</span>
          </li>

          {categories.map((cat) => {
            const key = cat.id ?? cat.slug ?? cat.name;
            const slug = cat.slug ?? String(cat.id ?? '');
            const name = cat.name ?? slug;
            const isActive = activeSlug === slug;

            return (
              <li
                key={key}
                onClick={() => onSelectSlug(slug)}
                title={name}
                className={`cursor-pointer px-3 h-11 flex items-center rounded-md hover:bg-green-100 ${
                  isActive ? 'bg-green-200 font-semibold' : ''
                }`}
              >
                <span className="block truncate">{name}</span>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}

export default SidebarCategories;
