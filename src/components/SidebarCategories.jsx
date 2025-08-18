function SidebarCategories({
  categories = [],       
  activeSlug = null,   
  onSelectSlug = () => {}, 
  loading = false,
}) {
  return (
    <aside className="w-full md:w-64 bg-white p-4 border rounded-md shadow-sm self-start">
      <h2 className="text-lg font-bold mb-4">Danh mục</h2>

      {loading ? (
        <div className="text-gray-500">Đang tải danh mục...</div>
      ) : (
        <ul className="space-y-2 max-h-[70vh] overflow-y-auto">
          <li
            onClick={() => onSelectSlug(null)}
            className={`cursor-pointer px-3 py-2 rounded-md hover:bg-green-100 ${
              !activeSlug ? "bg-green-200 font-semibold" : ""
            }`}
          >
            Tất cả
          </li>

          {categories.map((cat) => {
            const key = cat.id ?? cat.slug ?? cat.name;
            const slug = cat.slug ?? String(cat.id ?? "");
            const name = cat.name ?? slug;
            const isActive = activeSlug === slug;

            return (
              <li
                key={key}
                onClick={() => onSelectSlug(slug)}
                className={`cursor-pointer px-3 py-2 rounded-md hover:bg-green-100 ${
                  isActive ? "bg-green-200 font-semibold" : ""
                }`}
                title={name}
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

