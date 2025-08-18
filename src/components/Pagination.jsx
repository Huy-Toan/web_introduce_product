function Pagination({ totalPages, currentPage, onPageChange, className = "" }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      className={`flex items-center justify-center gap-2 ${className}`}
      aria-label="Pagination"
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-3 py-2 rounded-md border bg-white 
                   cursor-pointer 
                   disabled:opacity-50 disabled:cursor-not-allowed 
                   disabled:bg-gray-100 disabled:text-gray-400"
      >
        Previous
      </button>

      <div className="flex items-center gap-1 overflow-x-auto">
        {pages.map((p) => {
          const active = p === currentPage;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={active ? "page" : undefined}
              disabled={active}
              className={`px-3 py-2 rounded-md border min-w-10
                ${active
                  ? "bg-blue-600 text-white border-blue-600 cursor-default"
                  : "bg-white cursor-pointer hover:bg-gray-100"}`}
            >
              {p}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-3 py-2 rounded-md border bg-white 
                   cursor-pointer 
                   disabled:opacity-50 disabled:cursor-not-allowed 
                   disabled:bg-gray-100 disabled:text-gray-400"
      >
        Next
      </button>
    </nav>
  );
}

export default Pagination;
