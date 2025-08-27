// src/components/TestTranslateBox.jsx
import { useGoogleTranslate, LANG_LABELS } from "../hooks/useGoogleTranslate";

export default function TestTranslateBox() {
  const { langs, current, setLang, retrigger, mountId } = useGoogleTranslate({
    pageLanguage: "vi",
    initialLangs: ["vi","en","ja","ko","zh-CN","fr","es"],
    persistKey: "gt_lang",
    mountId: "google_translate_element",
  });

  return (
    <>
      <div className="fixed bottom-4 right-4 z-[99999] bg-white border shadow rounded px-3 py-2 flex gap-2">
        <select
          value={current}
          onChange={(e) => setLang(e.target.value)}
          className="border rounded px-2 py-1"
        >
          {langs.map(code => (
            <option key={code} value={code}>
              {LANG_LABELS[code] || code}
            </option>
          ))}
        </select>
        <button onClick={() => setLang("en")} className="border rounded px-2">Force EN</button>
        <button onClick={retrigger} className="bg-blue-600 text-white rounded px-2">Refresh</button>
      </div>

      {/* HIỆN widget gốc để nhìn thấy dropdown Google (đừng ẩn) */}
      <div
        id={mountId}
        style={{
          position: "fixed",
          right: 16,
          bottom: 64,
          zIndex: 99999,
          background: "#fff",
          padding: "6px 8px",
          borderRadius: 8,
          boxShadow: "0 2px 10px rgba(0,0,0,.12)"
        }}
      />
    </>
  );
}
