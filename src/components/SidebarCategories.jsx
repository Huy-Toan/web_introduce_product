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
  const [subsByParent, setSubsByParent] = useState({}); // { [parentId]: Sub[] }
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
      // dùng query ?parent_id= rõ ràng hơn
      const res = await fetch(`/api/sub_categories?parent_id=${encodeURIComponent(parent.id)}`);
      const data = await res.json();
      const list = (data?.subcategories || []).map(s => ({
        ...s,
        // đảm bảo luôn có parent_slug để build URL
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

  // —— Điều hướng path-based —— //
  const goAll = () => navigate("/product");
  const goParent = (parent) => navigate(`/product/${parent.slug}`);
  const goSub = (sub) => navigate(`/product/${sub.parent_slug}/${sub.slug}`);

  return (
    <aside className="w-full md:w-72 bg-white p-4 border rounded-md shadow-sm self-start">
      <div className="flex items-center gap-2 mb-4">
        <Layers size={18} className="text-green-600" />
        <h2 className="text-lg font-bold">Danh mục</h2>
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
                className={`w-full text-left px-3 py-2 rounded-md hover:bg-green-100 ${
                  !activeParentSlug && !activeSubSlug ? "bg-green-200 font-medium" : ""
                }`}
              >
                Tất cả
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
              <li key={pid}>
                <div className="flex items-stretch">
                  <button
                    onClick={() => toggleParent(parent)}
                    className="shrink-0 w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 mr-1"
                    aria-label={isOpen ? "Thu gọn" : "Mở rộng"}
                    title={isOpen ? "Thu gọn" : "Mở rộng"}
                  >
                    {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </button>

                  <button
                    onClick={() => goParent(parent)}
                    className={`flex-1 text-left px-3 py-2 rounded-md hover:bg-green-100 ${
                      isActiveParent ? "bg-green-200 font-medium" : ""
                    }`}
                    title={parent.name}
                  >
                    <span className="block truncate">{parent.name}</span>
                  </button>
                </div>

                {isOpen && (
                  <div className="mt-1 ml-9">
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
                            <li key={sub.id ?? sub.slug}>
                              <button
                                onClick={() => goSub(sub)}
                                className={`w-full text-left px-3 py-1.5 rounded-md hover:bg-green-50 ${
                                  isActiveSub ? "bg-green-100 font-medium" : ""
                                }`}
                                title={sub.name}
                              >
                                <span className="block truncate text-sm">{sub.name}</span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <div className="text-xs text-gray-500 italic px-2 py-1.5">
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
