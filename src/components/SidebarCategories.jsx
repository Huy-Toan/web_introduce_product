// src/components/SidebarCategoriesTwoLevel.jsx
import React, { useEffect, useMemo, useState } from "react";
import { ChevronRight, ChevronDown, Layers } from "lucide-react";

const indexByParent = (subs = []) => {
  const map = {};
  for (const s of subs) {
    const pid = String(s.parent_id ?? "");
    if (!map[pid]) map[pid] = [];
    map[pid].push(s);
  }
  return map;
};

function SidebarCategoriesTwoLevel({
  activeParentSlug = null,
  activeSubSlug = null,

  // callbacks cho trang danh sách sản phẩm
  onSelectParentSlug = () => {},
  onSelectSubSlug = () => {},

  // optional: hiển thị "Tất cả"
  showAll = true,
}) {
  const [parents, setParents] = useState([]);
  const [parentsLoading, setParentsLoading] = useState(false);

  // Cache sub theo parent_id
  const [subsByParent, setSubsByParent] = useState({}); 
  const [subsLoadingFor, setSubsLoadingFor] = useState(null); 

  // Theo dõi parent nào đang mở
  const [openParentIds, setOpenParentIds] = useState(new Set());

  // --- Fetch parents ---
  const fetchParents = async () => {
    try {
      setParentsLoading(true);
      const res = await fetch("/api/parent_categories");
      const data = await res.json();
      const list = data?.parents || [];
      setParents(list);
    } catch (e) {
      console.error("fetchParents error:", e);
      setParents([]);
    } finally {
      setParentsLoading(false);
    }
  };

  // --- Fetch subs for a parent (with cache) ---
  const fetchSubsForParent = async (parentId) => {
    const key = String(parentId);
    if (subsByParent[key]) return;// đã có cache
    try {
      setSubsLoadingFor(key);
      const res = await fetch(`/api/sub_categories?parent_id=${encodeURIComponent(parentId)}`);
      const data = await res.json();
      const list = data?.subcategories || [];
      setSubsByParent((prev) => ({ ...prev, [key]: list }));
    } catch (e) {
      console.error("fetchSubsForParent error:", e);
      setSubsByParent((prev) => ({ ...prev, [key]: [] }));
    } finally {
      setSubsLoadingFor(null);
    }
  };

  useEffect(() => {
    fetchParents();
  }, []);

  // Toggle mở/đóng 1 parent
  const toggleParent = async (parent) => {
    const id = String(parent.id);
    const newSet = new Set(openParentIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
      // Lúc mở thì fetch sub nếu chưa có
      fetchSubsForParent(parent.id);
    }
    setOpenParentIds(newSet);
  };

  // Chọn "Tất cả"
  const handleSelectAll = () => {
    onSelectSubSlug(null);
    onSelectParentSlug(null);
  };

  // Chọn parent
  const handleSelectParent = (parent) => {
    onSelectSubSlug(null); // reset sub
    onSelectParentSlug(parent.slug);
  };

  // Chọn sub
  const handleSelectSub = (sub) => {
    onSelectParentSlug(sub.parent_slug || null); // có thể set luôn parent_slug nếu BE trả
    onSelectSubSlug(sub.slug);
  };

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
                onClick={handleSelectAll}
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
                {/* Hàng parent */}
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
                    onClick={() => handleSelectParent(parent)}
                    className={`flex-1 text-left px-3 py-2 rounded-md hover:bg-green-100 ${
                      isActiveParent ? "bg-green-200 font-medium" : ""
                    }`}
                    title={parent.name}
                  >
                    <span className="block truncate">{parent.name}</span>
                  </button>
                </div>

                {/* Danh sách con */}
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
                                onClick={() => handleSelectSub(sub)}
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
