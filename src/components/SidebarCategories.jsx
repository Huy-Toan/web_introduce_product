// src/components/SidebarCategoriesTwoLevel.jsx
import React, { useEffect, useState } from "react";
import { ChevronRight, ChevronDown, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";

function SidebarCategoriesTwoLevel({
  activeParentSlug = null,
  activeSubSlug = null,
  showAll = true,
}) {
  const navigate = useNavigate();

  const [parents, setParents] = useState([]);
  const [parentsLoading, setParentsLoading] = useState(false);
  const [subsByParent, setSubsByParent] = useState({});
  const [subsLoadingFor, setSubsLoadingFor] = useState(null);
  const [openParentIds, setOpenParentIds] = useState(new Set());

  const fetchParents = async () => {
    try {
      setParentsLoading(true);
      const res = await fetch("/api/parent_categories");
      const data = await res.json();
      setParents(data?.parents || []);
    } finally {
      setParentsLoading(false);
    }
  };

  const fetchSubsForParent = async (parent) => {
    const key = String(parent.id);
    if (subsByParent[key]) return;
    try {
      setSubsLoadingFor(key);
      const res = await fetch(`/api/sub_categories?parent_id=${encodeURIComponent(parent.id)}`);
      const data = await res.json();
      const list = (data?.subcategories || []).map((s) => ({
        ...s,
        parent_slug: s.parent_slug || parent.slug,
      }));
      setSubsByParent((prev) => ({ ...prev, [key]: list }));
    } finally {
      setSubsLoadingFor(null);
    }
  };

  useEffect(() => { fetchParents(); }, []);

  const toggleParent = async (parent) => {
    const id = String(parent.id);
    const next = new Set(openParentIds);
    if (next.has(id)) next.delete(id);
    else {
      next.add(id);
      fetchSubsForParent(parent);
    }
    setOpenParentIds(next);
  };

  const goAll = () => navigate("/product");
  const goParent = (parent) => navigate(`/product/${parent.slug}`);
  const goSub = (sub) => navigate(`/product/${sub.parent_slug}/${sub.slug}`);

  return (
    <aside className="w-full md:w-72 bg-white p-4 border rounded-md shadow-sm self-start">
      <div className="flex items-center gap-2 mb-4">
        <Layers size={18} className="text-green-600" />
        <h2 className="text-lg font-bold uppercase tracking-wide">Danh mục</h2>
      </div>

      {parentsLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-9 rounded-md bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <ul className="space-y-1 max-h-[70vh] overflow-y-auto pr-1">
          {showAll && (
            <li>
              <button
                onClick={goAll}
                className={`w-full text-left px-3 py-2 cursor-pointer rounded-md hover:bg-green-100 uppercase tracking-wide ${
                  !activeParentSlug && !activeSubSlug ? "bg-green-200 font-extrabold" : "font-bold"
                }`}
              >
                TẤT CẢ
              </button>
            </li>
          )}

          {parents.map((parent) => {
            const pid = String(parent.id);
            const isOpen = openParentIds.has(pid);
            const isActiveParent = activeParentSlug === parent.slug && !activeSubSlug;
            const subs = subsByParent[pid] || [];
            const isLoadingSubs = subsLoadingFor === pid;

            return (
              <li key={pid} className="rounded-md">
                {/* Hàng cấp 1 */}
                <div className="flex items-stretch gap-1 min-w-0">
                  <button
                    onClick={() => goParent(parent)}
                    className={`flex-1 min-w-0 text-left px-3 py-2 cursor-pointer rounded-md hover:bg-green-100 uppercase tracking-wide
                      ${isActiveParent ? "bg-green-200 font-extrabold text-[15px]" : "font-extrabold text-[15px]"}
                    `}
                    title={parent.name}
                  >
                    {/* TÊN CẤP 1: CHIỀU NGANG CỐ ĐỊNH + XUỐNG DÒNG */}
                    <span className="block w-[180px] md:w-[220px] whitespace-normal break-words leading-tight">
                      {parent.name}
                    </span>
                  </button>

                  <button
                    onClick={() => toggleParent(parent)}
                    className="shrink-0 w-8 h-8 flex items-center cursor-pointer justify-center rounded-md hover:bg-gray-100"
                    aria-label={isOpen ? "Thu gọn" : "Mở rộng"}
                    title={isOpen ? "Thu gọn" : "Mở rộng"}
                  >
                    {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </button>
                </div>

                {/* Danh sách cấp 2 */}
                {isOpen && (
                  <div className="mt-1 pl-3">
                    {isLoadingSubs ? (
                      <div className="space-y-1">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="h-7 rounded-md bg-gray-100 animate-pulse" />
                        ))}
                      </div>
                    ) : subs.length > 0 ? (
                      <ul className="space-y-1">
                        {subs.map((sub) => {
                          const isActiveSub = activeSubSlug === sub.slug;
                          return (
                            <li key={sub.id ?? sub.slug} className="min-w-0">
                              <button
                                onClick={() => goSub(sub)}
                                className={`w-full text-left px-3 py-1.5 cursor-pointer rounded-md hover:bg-green-50 uppercase tracking-wide
                                  ${isActiveSub ? "bg-green-100 font-bold text-[13px]" : "font-bold text-[13px]"}
                                `}
                                title={sub.name}
                              >
                                {/* TÊN CẤP 2: CHIỀU NGANG CỐ ĐỊNH + XUỐNG DÒNG */}
                                <span className="block w-[180px] md:w-[220px] whitespace-normal break-words leading-tight">
                                  {sub.name}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <div className="text-[11px] text-gray-500 italic px-2 py-1.5 uppercase tracking-wide">
                        Chưa có danh mục con
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}

export default SidebarCategoriesTwoLevel;
