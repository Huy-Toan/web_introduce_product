// src/components/Breadcrumbs.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

/**
 * items: [{ label: string, to?: string, state?: any }]
 * - Phần tử cuối là trang hiện tại => không cần to
 * - Nếu không truyền items, bạn có thể tự build từ URL ở nơi dùng (khuyến nghị build thủ công để có tên đẹp)
 */
export default function Breadcrumbs({ items = [], className = "" }) {
  if (!Array.isArray(items) || items.length === 0) return null;

  // JSON-LD cho SEO (BreadcrumbList)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: it.label,
      item: it.to ? `${window.location.origin}${it.to}` : undefined,
    })),
  };

  return (
    <nav
      className={`w-full bg-gray-100 text-gray-700 border-y ${className}`}
      aria-label="Breadcrumb"
    >
      {/* cuộn ngang khi dài (mobile) */}
      <ol className="container mx-auto max-w-7xl px-3 md:px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {/* Home */}
        <li className="shrink-0 flex items-center">
          {items[0]?.to ? (
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900"
              title="Trang chủ"
            >
              <Home size={16} />
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1 text-gray-600">
              <Home size={16} />
            </span>
          )}
        </li>

        {/* Dấu > sau Home nếu có items */}
        {items.length > 0 && (
          <li className="shrink-0 select-none text-gray-400">›</li>
        )}

        {/* Các mục */}
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <React.Fragment key={`${item.label}-${idx}`}>
              <li className="shrink-0">
                {item.to && !isLast ? (
                  <Link
                    to={item.to}
                    state={item.state}
                    className="text-sm md:text-[15px] text-gray-700 hover:text-gray-900 whitespace-nowrap"
                    title={item.label}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className="text-sm md:text-[15px] text-gray-500 font-medium whitespace-nowrap"
                    aria-current="page"
                    title={item.label}
                  >
                    {item.label}
                  </span>
                )}
              </li>

              {!isLast && (
                <li className="shrink-0 select-none text-gray-400">›</li>
              )}
            </React.Fragment>
          );
        })}
      </ol>

      {/* SEO JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </nav>
  );
}
