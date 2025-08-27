// src/components/LocaleSwitcherGT.jsx
import { useEffect, useRef, useState } from "react";
import { useGoogleTranslate, LANG_LABELS } from "../hooks/useGoogleTranslate";

export default function LocaleSwitcherGT() {
  const { langs, current, setLang } = useGoogleTranslate({
    pageLanguage: "vi",
    initialLangs: [
      "vi","en","ja","ko","zh-CN","zh-TW","fr","de","es",
      "pt","it","nl","ru","ar","hi","id","ms","th","fil","tr"
    ],
    persistKey: "gt_lang",
    mountId: "google_translate_element",
  });

  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // click outside -> đóng menu
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="fixed bottom-40 right-8 z-50">
      {/* Nút icon */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="
                h-14 w-14 rounded-full cursor-pointer
                bg-white/95 border border-neutral-200
                shadow-[0_8px_24px_rgba(0,0,0,0.15)]   
                backdrop-blur
                flex items-center justify-center
                transition-all duration-200
                hover:-translate-y-1 hover:scale-[1.03]  /* nhảy & phóng nhẹ */
                hover:shadow-[0_14px_32px_rgba(0,0,0,0.22)] /* bóng khi hover */
                focus:outline-none focus:ring-2 focus:ring-blue-500/40
                active:translate-y-0 active:scale-100
            "
      >
        <img
          src="/switch-language.jpg"
          alt="Language switcher"
          className="h-14 w-14 rounded-full object-cover pointer-events-none"
        />
      </button>

      {/* Menu thả xuống */}
      {open && (
        <div
          className="absolute bottom-14 right-0 w-48 
                     bg-white
                     border border-neutral-200 
                     rounded-lg shadow-lg overflow-hidden"
        >
          <ul className="max-h-64 overflow-auto">
            {langs.map((code) => {
              const active = code === current;
              return (
                <li key={code}>
                  <button
                    type="button"
                    onClick={() => {
                      setLang(code);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm cursor-pointer
                                hover:bg-neutral-200 
                                ${active ? "bg-neutral-100 dark:bg-neutral-200 font-medium" : ""}`}
                  >
                    {LANG_LABELS[code] || code}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
