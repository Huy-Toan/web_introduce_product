// src/components/FieldFormModal.jsx
import React, { useEffect, useRef, useState } from "react";
import { X, Upload, Loader2, Plus, Languages, Sparkles } from "lucide-react";
import EditorMd from "./EditorMd";

const ALL_LOCALES = ["vi", "en", "ja", "ko", "zh", "fr", "de"];

/* ================= i18n ================= */
const LABELS = {
  vi: {
    header: (e) => (e ? "Chỉnh sửa Lĩnh vực (đa ngôn ngữ)" : "Thêm Lĩnh vực mới (đa ngôn ngữ)"),
    addLang: "Thêm ngôn ngữ",
    autoTranslate: "Tự dịch từ VI",
    name_label_vi: "Tên lĩnh vực (VI) *",
    name_label: (lc) => `Tên lĩnh vực (${lc.toUpperCase()})`,
    name_ph_vi: "Nhập tên lĩnh vực",
    name_ph: (lc) => `Name (${lc.toUpperCase()})`,
    content_label_vi: "Nội dung (VI) *",
    content_label: (lc) => `Nội dung (${lc.toUpperCase()})`,
    content_ph_vi: "Nhập nội dung lĩnh vực (Markdown hỗ trợ)",
    content_ph: (lc) => `Nhập nội dung (${lc.toUpperCase()})`,
    translateFromVI: "Dịch từ VI",
    translating: "Đang tự dịch sang các ngôn ngữ khác…",
    image_section: "Ảnh minh họa",
    pick_image: "Chọn ảnh từ máy tính",
    uploading: "Đang upload...",
    remove_image: "Gỡ ảnh",
    cancel: "Hủy",
    add: "Thêm",
    update: "Cập nhật",
    needNameVI: "Vui lòng nhập Tên lĩnh vực (VI)",
    needContentVI: "Vui lòng nhập Nội dung (VI)",
    markdown_hint: "Hỗ trợ Markdown",
  },
  en: {
    header: (e) => (e ? "Edit Field (multi-language)" : "Add Field (multi-language)"),
    addLang: "Add language",
    autoTranslate: "Auto-translate from VI",
    name_label_vi: "Field name (VI) *",
    name_label: (lc) => `Field name (${lc.toUpperCase()})`,
    name_ph_vi: "Enter field name",
    name_ph: (lc) => `Name (${lc.toUpperCase()})`,
    content_label_vi: "Content (VI) *",
    content_label: (lc) => `Content (${lc.toUpperCase()})`,
    content_ph_vi: "Enter field content (Markdown supported)",
    content_ph: (lc) => `Enter content (${lc.toUpperCase()})`,
    translateFromVI: "Translate from VI",
    translating: "Auto-translating to other languages…",
    image_section: "Illustration image",
    pick_image: "Choose an image",
    uploading: "Uploading...",
    remove_image: "Remove image",
    cancel: "Cancel",
    add: "Add",
    update: "Update",
    needNameVI: "Please enter Field name (VI)",
    needContentVI: "Please enter Content (VI)",
    markdown_hint: "Markdown supported",
  },
  ja: {
    header: (e) => (e ? "分野を編集（多言語）" : "分野を追加（多言語）"),
    addLang: "言語を追加",
    autoTranslate: "VI から自動翻訳",
    name_label_vi: "分野名（VI）*",
    name_label: (lc) => `分野名（${lc.toUpperCase()}）`,
    name_ph_vi: "分野名を入力",
    name_ph: (lc) => `名称（${lc.toUpperCase()}）`,
    content_label_vi: "内容（VI）*",
    content_label: (lc) => `内容（${lc.toUpperCase()}）`,
    content_ph_vi: "分野の内容を入力（Markdown 対応）",
    content_ph: (lc) => `内容を入力（${lc.toUpperCase()}）`,
    translateFromVI: "VI から翻訳",
    translating: "他の言語へ自動翻訳中…",
    image_section: "画像",
    pick_image: "画像を選択",
    uploading: "アップロード中...",
    remove_image: "画像を削除",
    cancel: "キャンセル",
    add: "追加",
    update: "更新",
    needNameVI: "分野名（VI）を入力してください",
    needContentVI: "内容（VI）を入力してください",
    markdown_hint: "Markdown 対応",
  },
  ko: {
    header: (e) => (e ? "분야 수정(다국어)" : "분야 추가(다국어)"),
    addLang: "언어 추가",
    autoTranslate: "베트남어에서 자동 번역",
    name_label_vi: "분야 이름 (VI) *",
    name_label: (lc) => `분야 이름 (${lc.toUpperCase()})`,
    name_ph_vi: "분야 이름 입력",
    name_ph: (lc) => `이름 (${lc.toUpperCase()})`,
    content_label_vi: "내용 (VI) *",
    content_label: (lc) => `내용 (${lc.toUpperCase()})`,
    content_ph_vi: "분야 내용을 입력 (Markdown 지원)",
    content_ph: (lc) => `내용 입력 (${lc.toUpperCase()})`,
    translateFromVI: "VI에서 번역",
    translating: "다른 언어로 자동 번역 중…",
    image_section: "이미지",
    pick_image: "이미지 선택",
    uploading: "업로드 중...",
    remove_image: "이미지 제거",
    cancel: "취소",
    add: "추가",
    update: "업데이트",
    needNameVI: "분야 이름(VI)을 입력하세요",
    needContentVI: "내용(VI)을 입력하세요",
    markdown_hint: "Markdown 지원",
  },
  zh: {
    header: (e) => (e ? "编辑领域（多语言）" : "新增领域（多语言）"),
    addLang: "添加语言",
    autoTranslate: "从越南语自动翻译",
    name_label_vi: "领域名称（VI）*",
    name_label: (lc) => `领域名称（${lc.toUpperCase()}）`,
    name_ph_vi: "请输入领域名称",
    name_ph: (lc) => `名称（${lc.toUpperCase()}）`,
    content_label_vi: "内容（VI）*",
    content_label: (lc) => `内容（${lc.toUpperCase()}）`,
    content_ph_vi: "输入领域内容（支持 Markdown）",
    content_ph: (lc) => `请输入内容（${lc.toUpperCase()}）`,
    translateFromVI: "从 VI 翻译",
    translating: "正在自动翻译到其他语言…",
    image_section: "配图",
    pick_image: "选择图片",
    uploading: "上传中...",
    remove_image: "移除图片",
    cancel: "取消",
    add: "新增",
    update: "更新",
    needNameVI: "请填写领域名称（VI）",
    needContentVI: "请填写内容（VI）",
    markdown_hint: "支持 Markdown",
  },
  fr: {
    header: (e) => (e ? "Modifier le domaine (multilingue)" : "Ajouter un domaine (multilingue)"),
    addLang: "Ajouter une langue",
    autoTranslate: "Traduire automatiquement depuis le VI",
    name_label_vi: "Nom du domaine (VI) *",
    name_label: (lc) => `Nom du domaine (${lc.toUpperCase()})`,
    name_ph_vi: "Saisir le nom du domaine",
    name_ph: (lc) => `Nom (${lc.toUpperCase()})`,
    content_label_vi: "Contenu (VI) *",
    content_label: (lc) => `Contenu (${lc.toUpperCase()})`,
    content_ph_vi: "Saisir le contenu (Markdown pris en charge)",
    content_ph: (lc) => `Saisir le contenu (${lc.toUpperCase()})`,
    translateFromVI: "Traduire depuis VI",
    translating: "Traduction automatique vers d’autres langues…",
    image_section: "Image",
    pick_image: "Choisir une image",
    uploading: "Téléversement...",
    remove_image: "Retirer l’image",
    cancel: "Annuler",
    add: "Ajouter",
    update: "Mettre à jour",
    needNameVI: "Veuillez saisir le nom du domaine (VI)",
    needContentVI: "Veuillez saisir le contenu (VI)",
    markdown_hint: "Markdown pris en charge",
  },
  de: {
    header: (e) => (e ? "Fachgebiet bearbeiten (mehrsprachig)" : "Fachgebiet hinzufügen (mehrsprachig)"),
    addLang: "Sprache hinzufügen",
    autoTranslate: "Automatisch aus VI übersetzen",
    name_label_vi: "Fachgebietsname (VI) *",
    name_label: (lc) => `Fachgebietsname (${lc.toUpperCase()})`,
    name_ph_vi: "Fachgebietsname eingeben",
    name_ph: (lc) => `Name (${lc.toUpperCase()})`,
    content_label_vi: "Inhalt (VI) *",
    content_label: (lc) => `Inhalt (${lc.toUpperCase()})`,
    content_ph_vi: "Inhalt eingeben (Markdown unterstützt)",
    content_ph: (lc) => `Inhalt eingeben (${lc.toUpperCase()})`,
    translateFromVI: "Aus VI übersetzen",
    translating: "Automatische Übersetzung in andere Sprachen…",
    image_section: "Bild",
    pick_image: "Bild auswählen",
    uploading: "Wird hochgeladen...",
    remove_image: "Bild entfernen",
    cancel: "Abbrechen",
    add: "Hinzufügen",
    update: "Aktualisieren",
    needNameVI: "Bitte Fachgebietsname (VI) eingeben",
    needContentVI: "Bitte Inhalt (VI) eingeben",
    markdown_hint: "Markdown unterstützt",
  },
};
const L = (lc, key, ...args) =>
  LABELS[lc] && LABELS[lc][key]
    ? typeof LABELS[lc][key] === "function"
      ? LABELS[lc][key](...args)
      : LABELS[lc][key]
    : typeof LABELS.en[key] === "function"
      ? LABELS.en[key](...args)
      : LABELS.en[key];

/* ============== translate helpers ============== */
async function translateText(text, source, target) {
  try {
    const r = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, source, target }),
    });
    if (!r.ok) return "";
    const j = await r.json();
    return j?.translated || "";
  } catch {
    return "";
  }
}
async function translateMarkdown(md, source, target) {
  const lines = (md || "").split("\n");
  const out = [];
  for (const line of lines) {
    const m = line.match(/^(\s*([#>*\-]|[0-9]+\.)\s*)(.*)$/);
    if (m) {
      const prefix = m[1];
      const text = m[3];
      let t = text;
      if (text.trim()) t = (await translateText(text, source, target)) || text;
      out.push(prefix + t);
    } else {
      let t = line;
      if (line.trim()) t = (await translateText(line, source, target)) || line;
      out.push(t);
    }
  }
  return out.join("\n");
}

function LocaleTabs({ openLocales, activeTab, setActiveTab, addLocale, removeLocale, addLabel }) {
  const canAdd = ALL_LOCALES.filter((lc) => !openLocales.includes(lc));
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {openLocales.map((lc) => (
        <div key={lc} className="flex items-center">
          <button
            type="button"
            onClick={() => setActiveTab(lc)}
            className={`px-3 py-1 rounded-full border text-sm mr-1 ${activeTab === lc ? "bg-black text-white" : ""
              }`}
          >
            {lc.toUpperCase()}
          </button>
          {lc !== "vi" && (
            <button
              type="button"
              onClick={() => removeLocale(lc)}
              className="text-xs text-red-600 mr-2"
              title="Đóng tab này"
            >
              <X size={16} />
            </button>
          )}
        </div>
      ))}
      {canAdd.length > 0 && (
        <div className="relative">
          <details className="dropdown">
            <summary className="px-3 py-1 rounded-full border cursor-pointer inline-flex items-center gap-1">
              <Plus size={16} /> {addLabel}
            </summary>
            <div className="absolute z-10 mt-2 w-44 rounded-lg border bg-white shadow">
              {canAdd.map((lc) => (
                <button
                  key={lc}
                  type="button"
                  onClick={() => addLocale(lc)}
                  className="block w-full text-left px-3 py-2 hover:bg-gray-50"
                >
                  {lc.toUpperCase()}
                </button>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
}

/* ================= component ================= */
const FieldFormModal = ({ isOpen, onClose, onSubmit, initialData = {} }) => {
  const isEditing = Boolean(initialData?.id || initialData?.field?.id);
  const [removedImage, setRemovedImage] = useState(false);

  // Base (VI) – fields
  const [baseVI, setBaseVI] = useState({ name: "", content: "", image_url: "" });

  // Translations – fields_translations
  const [translations, setTranslations] = useState(
    /** @type {Record<string, { name: string, content: string }>} */({})
  );

  // track user touched fields
  const [touched, setTouched] = useState(
    /** @type {Record<string, { name?: boolean, content?: boolean }>} */({})
  );

  const [activeTab, setActiveTab] = useState("vi");
  const [openLocales, setOpenLocales] = useState(["vi", "en"]);

  // Image
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // State
  const [isUploading, setIsUploading] = useState(false);

  // Auto translate
  const [autoTranslate, setAutoTranslate] = useState(true);
  const debounceTimer = useRef(null);
  const lastSourceName = useRef("");
  const lastSourceContent = useRef("");
  const [isTranslating, setIsTranslating] = useState(false);

  // Editor refs
  const editorVIRef = useRef(null);
  const editorRefs = useRef({}); // per-locale editors

  // nạp dữ liệu khi mở modal
  useEffect(() => {
    if (!isOpen) return;

    const raw = initialData?.field ? initialData.field : initialData || {};
    if (isEditing) {
      setBaseVI({
        name: raw.name || "",
        content: raw.content || "",
        image_url: raw.image_url || "",
      });
      setImagePreview(raw.image_url || "");

      (async () => {
        try {
          const id = raw.id || initialData.id;
          const r = await fetch(`/api/fields/${id}/translations`);
          if (!r.ok) return;
          const j = await r.json();
          const tr = j?.translations || {};
          const norm = Object.fromEntries(
            Object.entries(tr).map(([lc, v]) => [
              lc.toLowerCase(),
              { name: v?.name || "", content: v?.content || "" },
            ])
          );
          delete norm.vi;
          setTranslations(norm);

          const defaults = ["vi", "en"];
          const withData = Object.entries(norm)
            .filter(([, v]) => v.name || v.content)
            .map(([lc]) => lc);
          setOpenLocales(Array.from(new Set([...defaults, ...withData])));
        } catch (e) {
          console.warn("load field translations error", e);
        }
      })();
    } else {
      // thêm mới
      setBaseVI({ name: "", content: "", image_url: "" });
      setImagePreview("");
      setTranslations({});
      setOpenLocales(["vi", "en"]);
    }

    setActiveTab("vi");
    setTouched({});
    setTimeout(() => editorVIRef.current?.refresh?.(), 0);
  }, [isOpen, initialData, isEditing]);

  // readOnly editor khi upload
  useEffect(() => {
    editorVIRef.current?.cm?.setOption("readOnly", isUploading ? "nocursor" : false);
    Object.values(editorRefs.current || {}).forEach((ref) =>
      ref?.cm?.setOption("readOnly", isUploading ? "nocursor" : false)
    );
  }, [isUploading]);

  // Auto-translate từ VI sang các tab mở (chưa touched)
  useEffect(() => {
    if (!autoTranslate) return;
    const srcName = (baseVI.name || "").trim();
    const srcContent = (baseVI.content || "").trim();
    if (!srcName && !srcContent) return;

    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      const needName = srcName && srcName !== lastSourceName.current;
      const needContent = srcContent && srcContent !== lastSourceContent.current;
      if (!needName && !needContent) return;

      lastSourceName.current = srcName;
      lastSourceContent.current = srcContent;

      const targets = openLocales.filter((lc) => lc !== "vi");
      if (targets.length === 0) return;

      try {
        setIsTranslating(true);
        for (const lc of targets) {
          const t = touched[lc] || {};
          let newName = "";
          let newContent = "";

          if (needName && !t.name) newName = await translateText(srcName, "vi", lc);
          if (needContent && !t.content) newContent = await translateMarkdown(srcContent, "vi", lc);

          if (newName || newContent) {
            setTranslations((prev) => {
              const curr = prev[lc] || { name: "", content: "" };
              return {
                ...prev,
                [lc]: {
                  name: newName || curr.name,
                  content: newContent || curr.content,
                },
              };
            });
          }
        }
      } finally {
        setIsTranslating(false);
      }
    }, 450);

    return () => clearTimeout(debounceTimer.current);
  }, [baseVI.name, baseVI.content, autoTranslate, openLocales, touched]);

  const addLocale = (lc) => {
    if (lc === "vi") return;
    setOpenLocales((prev) => (prev.includes(lc) ? prev : [...prev, lc]));
    setTranslations((prev) => (prev[lc] ? prev : { ...prev, [lc]: { name: "", content: "" } }));
    setActiveTab(lc);
  };
  const removeLocale = (lc) => {
    if (lc === "vi") return;
    setOpenLocales((prev) => prev.filter((x) => x !== lc));
    setTranslations((prev) => {
      const cp = { ...prev };
      delete cp[lc];
      return cp;
    });
    setTouched((prev) => {
      const cp = { ...prev };
      delete cp[lc];
      return cp;
    });
    setActiveTab("vi");
  };

  const handleBaseChange = (e) => {
    const { name, value } = e.target;
    setBaseVI((prev) => ({ ...prev, [name]: value }));
  };
  const handleTrChange = (lc, key, value) => {
    setTranslations((prev) => ({
      ...prev,
      [lc]: { ...(prev[lc] || { name: "", content: "" }), [key]: value },
    }));
    setTouched((prev) => ({ ...prev, [lc]: { ...(prev[lc] || {}), [key]: true } }));
  };

  const translateNameFromVI = async (lc) => {
    const src = (baseVI.name || "").trim();
    if (!src) return;
    const t = await translateText(src, "vi", lc);
    if (!t) return;
    handleTrChange(lc, "name", t);
  };
  const translateContentFromVI = async (lc) => {
    const src = (baseVI.content || "").trim();
    if (!src) return;
    const t = await translateMarkdown(src, "vi", lc);
    if (!t) return;
    handleTrChange(lc, "content", t);
    setTimeout(() => editorRefs.current[lc]?.refresh?.(), 0);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return alert("Vui lòng chọn file ảnh hợp lệ!");
    if (file.size > 5 * 1024 * 1024) return alert("Kích thước ảnh không vượt quá 5MB!");
    setImageFile(file);
    setRemovedImage(false); 
    const reader = new FileReader();
    reader.onload = (evt) => setImagePreview(String(evt.target?.result || ""));
    reader.readAsDataURL(file);
  };
  const uploadImage = async (file) => {
    const fd = new FormData();
    fd.append("image", file);
    const r = await fetch("/api/upload-image", { method: "POST", body: fd });
    if (!r.ok) throw new Error("Upload failed");
    const j = await r.json();
    return {
    image_key: j.image_key,                 
    previewUrl: j.displayUrl || data.url,   
  };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!baseVI.name?.trim()) return alert(L(activeTab, "needNameVI"));
    if (!baseVI.content?.trim()) return alert(L(activeTab, "needContentVI"));

    setIsUploading(true);
    try {
      const payload = {
        name: baseVI.name,
        content: baseVI.content,
        // KHÔNG đưa image_url ở đây để tránh overwrite
      };

      // Có chọn ảnh mới => upload + set image_url (key) vào payload
      if (imageFile) {
        const uploaded = await uploadImage(imageFile);
        payload.image_url = uploaded.image_key;
      }
      // User bấm X xóa ảnh => set image_url = null để BE xóa
      else if (removedImage) {
        payload.image_url = null;
      }
      // Còn lại: không gửi image_url => BE giữ nguyên ảnh cũ

      // lọc translations có dữ liệu
      const cleanTranslations = {};
      for (const [lc, v] of Object.entries(translations)) {
        const hasAny = v?.name || v?.content;
        if (!hasAny) continue;
        cleanTranslations[lc] = { name: v.name || "", content: v.content || "" };
      }
      if (Object.keys(cleanTranslations).length) payload.translations = cleanTranslations;

      if (isEditing) payload.id = initialData?.field?.id || initialData?.id;

      await onSubmit(payload);
      onClose?.();

      // reset
      setBaseVI({ name: "", content: "", image_url: "" });
      setTranslations({});
      setTouched({});
      setOpenLocales(["vi", "en"]);
      setActiveTab("vi");
      setImageFile(null);
      setImagePreview("");
      setRemovedImage(false);                       // << nhớ reset cờ
      lastSourceName.current = "";
      lastSourceContent.current = "";
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi upload ảnh hoặc gửi dữ liệu. Vui lòng thử lại!");
    } finally {
      setIsUploading(false);
    }
  };


  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    setRemovedImage(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-xl font-semibold">{L(activeTab, "header", isEditing)}</h3>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoTranslate}
                onChange={(e) => setAutoTranslate(e.target.checked)}
                disabled={isUploading}
              />
              <span className="inline-flex items-center gap-1">
                <Sparkles size={16} /> {L(activeTab, "autoTranslate")}
              </span>
            </label>
            <button
              onClick={onClose}
              className="cursor-pointer text-gray-400 hover:text-gray-600"
              disabled={isUploading}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Tabs */}
          <LocaleTabs
            openLocales={openLocales}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            addLocale={addLocale}
            removeLocale={removeLocale}
            addLabel={L(activeTab, "addLang")}
          />

          {/* VI tab */}
          {activeTab === "vi" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {L("vi", "name_label_vi")}
                </label>
                <input
                  name="name"
                  value={baseVI.name}
                  onChange={handleBaseChange}
                  placeholder={L("vi", "name_ph_vi")}
                  required
                  disabled={isUploading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {L("vi", "content_label_vi")}
                </label>
                <div className="relative">
                  <EditorMd
                    ref={editorVIRef}
                    value={baseVI.content}
                    height={480}
                    onChangeMarkdown={(md) => setBaseVI((f) => ({ ...f, content: md }))}
                    onReady={() => editorVIRef.current?.refresh?.()}
                  />
                  {isTranslating && (
                    <div className="mt-2 text-xs text-gray-500 inline-flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin" /> {L(activeTab, "translating")}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{L(activeTab, "markdown_hint")}</p>
              </div>

              {/* Ảnh cover */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {L(activeTab, "image_section")}
                </label>
                {imagePreview && (
                  <div className="mb-3 relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-64 h-40 object-cover rounded-md border"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      disabled={isUploading}
                      className="cursor-pointer absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 disabled:bg-gray-400"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isUploading}
                    className="hidden"
                    id="field-image-upload"
                  />
                  <label
                    htmlFor="field-image-upload"
                    className={`cursor-pointer flex flex-col items-center space-y-2 ${isUploading ? "cursor-not-allowed opacity-50" : ""
                      }`}
                  >
                    {isUploading ? (
                      <Loader2 className="animate-spin text-blue-500" size={28} />
                    ) : (
                      <Upload className="text-gray-400" size={28} />
                    )}
                    <span className="text-sm text-gray-600">
                      {isUploading ? L(activeTab, "uploading") : L(activeTab, "pick_image")}
                    </span>
                    <span className="text-xs text-gray-400">PNG, JPG, GIF ≤ 5MB</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Các tab locale khác */}
          {openLocales
            .filter((lc) => lc !== "vi")
            .map(
              (lc) =>
                activeTab === lc && (
                  <div key={lc} className="space-y-6">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">
                        {L(lc, "name_label", lc)}
                      </label>
                      <button
                        type="button"
                        onClick={() => translateNameFromVI(lc)}
                        disabled={isUploading || !baseVI.name}
                        className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
                        title={L(lc, "translateFromVI")}
                      >
                        <Languages size={14} /> {L(lc, "translateFromVI")}
                      </button>
                    </div>
                    <input
                      value={translations[lc]?.name || ""}
                      onChange={(e) => handleTrChange(lc, "name", e.target.value)}
                      placeholder={L(lc, "name_ph", lc)}
                      disabled={isUploading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />

                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">
                        {L(lc, "content_label", lc)}
                      </label>
                      <button
                        type="button"
                        onClick={() => translateContentFromVI(lc)}
                        disabled={isUploading || !baseVI.content}
                        className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
                        title={L(lc, "translateFromVI")}
                      >
                        <Languages size={16} /> {L(lc, "translateFromVI")}
                      </button>
                    </div>
                    <EditorMd
                      ref={(r) => (editorRefs.current[lc] = r)}
                      value={translations[lc]?.content || ""}
                      height={420}
                      onChangeMarkdown={(md) => handleTrChange(lc, "content", md)}
                      onReady={() => editorRefs.current[lc]?.refresh?.()}
                    />
                  </div>
                )
            )}

          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="cursor-pointer px-5 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {L(activeTab, "cancel")}
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="cursor-pointer px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUploading && <Loader2 className="animate-spin" size={18} />}
              {isEditing ? L(activeTab, "update") : L(activeTab, "add")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FieldFormModal;
