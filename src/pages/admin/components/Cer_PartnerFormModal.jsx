// src/components/CertPartnerFormModal.jsx
import React, { useEffect, useRef, useState } from "react";
import { X, Upload, Loader2, Image as ImageIcon, Tag, Plus, Languages, Sparkles } from "lucide-react";

const ALL_LOCALES = ["vi", "en", "ja", "ko", "zh", "fr", "de"];

/* ================= i18n ================= */
const LABELS = {
  vi: {
    header: (e) => (e ? "Chỉnh sửa Certification/Partner (đa ngôn ngữ)" : "Thêm Certification/Partner (đa ngôn ngữ)"),
    addLang: "Thêm ngôn ngữ",
    autoTranslate: "Tự dịch từ VI",
    name_label: (lc) => `Tên (${lc.toUpperCase()})`,
    name_label_vi: "Tên (name) — VI *",
    name_ph_vi: "Ví dụ: ISO 9001:2015 / ACME Inc.",
    name_ph: (lc) => `Nhập tên (${lc.toUpperCase()})`,
    type_label: "Loại (type) *",
    content_label: (lc) => `Nội dung (${lc.toUpperCase()})`,
    content_label_vi: "Nội dung (content) — VI *",
    content_ph_vi: "Mô tả ngắn về chứng nhận/đối tác...",
    content_ph: (lc) => `Nhập nội dung (${lc.toUpperCase()})`,
    translateFromVI: "Dịch từ VI",
    translating: "Đang tự dịch sang các ngôn ngữ khác…",
    image_section: "Ảnh (tùy chọn)",
    no_image: "Chưa có ảnh",
    pick_image: "Chọn ảnh từ máy tính",
    uploading: "Đang upload...",
    remove_image: "Gỡ ảnh",
    cancel: "Hủy",
    add: "Thêm",
    update: "Cập nhật",
    needNameVI: "Vui lòng nhập Tên (VI).",
    needType: "Vui lòng chọn Type.",
    needContentVI: "Vui lòng nhập Nội dung (VI).",
    type_badge: (v) => v,
  },
  en: {
    header: (e) => (e ? "Edit Certification/Partner (multi-language)" : "Add Certification/Partner (multi-language)"),
    addLang: "Add language",
    autoTranslate: "Auto-translate from VI",
    name_label: (lc) => `Name (${lc.toUpperCase()})`,
    name_label_vi: "Name — VI *",
    name_ph_vi: "e.g., ISO 9001:2015 / ACME Inc.",
    name_ph: (lc) => `Enter name (${lc.toUpperCase()})`,
    type_label: "Type *",
    content_label: (lc) => `Content (${lc.toUpperCase()})`,
    content_label_vi: "Content — VI *",
    content_ph_vi: "Short description about the certification/partner...",
    content_ph: (lc) => `Enter content (${lc.toUpperCase()})`,
    translateFromVI: "Translate from VI",
    translating: "Auto-translating to other languages…",
    image_section: "Image (optional)",
    no_image: "No image",
    pick_image: "Choose an image",
    uploading: "Uploading...",
    remove_image: "Remove image",
    cancel: "Cancel",
    add: "Add",
    update: "Update",
    needNameVI: "Please enter Name (VI).",
    needType: "Please select Type.",
    needContentVI: "Please enter Content (VI).",
    type_badge: (v) => v,
  },
  ja: {
    header: (e) => (e ? "認証/パートナーを編集（多言語）" : "認証/パートナーを追加（多言語）"),
    addLang: "言語を追加",
    autoTranslate: "VI から自動翻訳",
    name_label: (lc) => `名称（${lc.toUpperCase()}）`,
    name_label_vi: "名称 — VI *",
    name_ph_vi: "例: ISO 9001:2015 / ACME Inc.",
    name_ph: (lc) => `名称を入力（${lc.toUpperCase()}）`,
    type_label: "種別 *",
    content_label: (lc) => `内容（${lc.toUpperCase()}）`,
    content_label_vi: "内容 — VI *",
    content_ph_vi: "認証/パートナーの簡単な説明…",
    content_ph: (lc) => `内容を入力（${lc.toUpperCase()}）`,
    translateFromVI: "VI から翻訳",
    translating: "他の言語へ自動翻訳中…",
    image_section: "画像（任意）",
    no_image: "画像なし",
    pick_image: "画像を選択",
    uploading: "アップロード中...",
    remove_image: "画像を削除",
    cancel: "キャンセル",
    add: "追加",
    update: "更新",
    needNameVI: "名称（VI）を入力してください。",
    needType: "種別を選択してください。",
    needContentVI: "内容（VI）を入力してください。",
    type_badge: (v) => v,
  },
  ko: {
    header: (e) => (e ? "인증/파트너 수정(다국어)" : "인증/파트너 추가(다국어)"),
    addLang: "언어 추가",
    autoTranslate: "베트남어에서 자동 번역",
    name_label: (lc) => `이름 (${lc.toUpperCase()})`,
    name_label_vi: "이름 — VI *",
    name_ph_vi: "예: ISO 9001:2015 / ACME Inc.",
    name_ph: (lc) => `이름 입력 (${lc.toUpperCase()})`,
    type_label: "유형 *",
    content_label: (lc) => `내용 (${lc.toUpperCase()})`,
    content_label_vi: "내용 — VI *",
    content_ph_vi: "인증/파트너에 대한 짧은 설명…",
    content_ph: (lc) => `내용 입력 (${lc.toUpperCase()})`,
    translateFromVI: "VI에서 번역",
    translating: "다른 언어로 자동 번역 중…",
    image_section: "이미지(선택 사항)",
    no_image: "이미지 없음",
    pick_image: "이미지 선택",
    uploading: "업로드 중...",
    remove_image: "이미지 제거",
    cancel: "취소",
    add: "추가",
    update: "업데이트",
    needNameVI: "이름(VI)을 입력하세요.",
    needType: "유형을 선택하세요.",
    needContentVI: "내용(VI)을 입력하세요.",
    type_badge: (v) => v,
  },
  zh: {
    header: (e) => (e ? "编辑认证/合作伙伴（多语言）" : "新增认证/合作伙伴（多语言）"),
    addLang: "添加语言",
    autoTranslate: "从越南语自动翻译",
    name_label: (lc) => `名称（${lc.toUpperCase()}）`,
    name_label_vi: "名称 — VI *",
    name_ph_vi: "例如：ISO 9001:2015 / ACME Inc.",
    name_ph: (lc) => `请输入名称（${lc.toUpperCase()}）`,
    type_label: "类型 *",
    content_label: (lc) => `内容（${lc.toUpperCase()}）`,
    content_label_vi: "内容 — VI *",
    content_ph_vi: "关于认证/合作伙伴的简短说明…",
    content_ph: (lc) => `请输入内容（${lc.toUpperCase()}）`,
    translateFromVI: "从 VI 翻译",
    translating: "正在自动翻译到其他语言…",
    image_section: "图片（可选）",
    no_image: "暂无图片",
    pick_image: "选择图片",
    uploading: "上传中...",
    remove_image: "移除图片",
    cancel: "取消",
    add: "新增",
    update: "更新",
    needNameVI: "请填写名称（VI）。",
    needType: "请选择类型。",
    needContentVI: "请填写内容（VI）。",
    type_badge: (v) => v,
  },
  fr: {
    header: (e) => (e ? "Modifier Certification/Partenaire (multilingue)" : "Ajouter Certification/Partenaire (multilingue)"),
    addLang: "Ajouter une langue",
    autoTranslate: "Traduire automatiquement depuis le VI",
    name_label: (lc) => `Nom (${lc.toUpperCase()})`,
    name_label_vi: "Nom — VI *",
    name_ph_vi: "ex. : ISO 9001:2015 / ACME Inc.",
    name_ph: (lc) => `Saisir le nom (${lc.toUpperCase()})`,
    type_label: "Type *",
    content_label: (lc) => `Contenu (${lc.toUpperCase()})`,
    content_label_vi: "Contenu — VI *",
    content_ph_vi: "Brève description du certificat/partenaire…",
    content_ph: (lc) => `Saisir le contenu (${lc.toUpperCase()})`,
    translateFromVI: "Traduire depuis VI",
    translating: "Traduction automatique vers d’autres langues…",
    image_section: "Image (optionnel)",
    no_image: "Aucune image",
    pick_image: "Choisir une image",
    uploading: "Téléversement...",
    remove_image: "Retirer l’image",
    cancel: "Annuler",
    add: "Ajouter",
    update: "Mettre à jour",
    needNameVI: "Veuillez saisir le Nom (VI).",
    needType: "Veuillez choisir le Type.",
    needContentVI: "Veuillez saisir le Contenu (VI).",
    type_badge: (v) => v,
  },
  de: {
    header: (e) => (e ? "Zertifizierung/Partner bearbeiten (mehrsprachig)" : "Zertifizierung/Partner hinzufügen (mehrsprachig)"),
    addLang: "Sprache hinzufügen",
    autoTranslate: "Automatisch aus VI übersetzen",
    name_label: (lc) => `Name (${lc.toUpperCase()})`,
    name_label_vi: "Name — VI *",
    name_ph_vi: "z. B. ISO 9001:2015 / ACME Inc.",
    name_ph: (lc) => `Name eingeben (${lc.toUpperCase()})`,
    type_label: "Typ *",
    content_label: (lc) => `Inhalt (${lc.toUpperCase()})`,
    content_label_vi: "Inhalt — VI *",
    content_ph_vi: "Kurze Beschreibung der Zertifizierung/Partnerschaft…",
    content_ph: (lc) => `Inhalt eingeben (${lc.toUpperCase()})`,
    translateFromVI: "Aus VI übersetzen",
    translating: "Automatische Übersetzung in andere Sprachen…",
    image_section: "Bild (optional)",
    no_image: "Kein Bild",
    pick_image: "Bild auswählen",
    uploading: "Wird hochgeladen...",
    remove_image: "Bild entfernen",
    cancel: "Abbrechen",
    add: "Hinzufügen",
    update: "Aktualisieren",
    needNameVI: "Bitte Name (VI) eingeben.",
    needType: "Bitte Typ auswählen.",
    needContentVI: "Bitte Inhalt (VI) eingeben.",
    type_badge: (v) => v,
  },
};
const L = (lc, key, ...args) =>
  LABELS[lc] && LABELS[lc][key]
    ? (typeof LABELS[lc][key] === "function" ? LABELS[lc][key](...args) : LABELS[lc][key])
    : (typeof LABELS.en[key] === "function" ? LABELS.en[key](...args) : LABELS.en[key]);

/* Type option labels per locale (UI label only) */
const TYPE_LABELS = {
  vi: { certification: "Chứng nhận", partner: "Đối tác", award: "Giải thưởng", license: "Giấy phép" },
  en: { certification: "Certification", partner: "Partner", award: "Award", license: "License" },
  ja: { certification: "認証", partner: "パートナー", award: "受賞", license: "ライセンス" },
  ko: { certification: "인증", partner: "파트너", award: "수상", license: "라이선스" },
  zh: { certification: "认证", partner: "合作伙伴", award: "奖项", license: "许可" },
  fr: { certification: "Certification", partner: "Partenaire", award: "Prix", license: "Licence" },
  de: { certification: "Zertifizierung", partner: "Partner", award: "Auszeichnung", license: "Lizenz" },
};
const tType = (lc, v) => (TYPE_LABELS[lc]?.[v] ?? TYPE_LABELS.en[v] ?? v);

/* ================= translate helpers ================= */
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

function LocaleTabs({ openLocales, activeTab, setActiveTab, addLocale, removeLocale, addLabel }) {
  const canAdd = ALL_LOCALES.filter((lc) => !openLocales.includes(lc));
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {openLocales.map((lc) => (
        <div key={lc} className="flex items-center">
          <button
            type="button"
            onClick={() => setActiveTab(lc)}
            className={`px-3 py-1 rounded-full border text-sm mr-1 ${activeTab === lc ? "bg-black text-white" : ""}`}
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
const CertPartnerFormModal = ({ isOpen, onClose, onSubmit, initialData = {} }) => {
  const isEditing = Boolean(initialData?.id || initialData?.item?.id);

  // Base (VI)
  const [baseVI, setBaseVI] = useState({
    name: "",
    type: "certification",
    content: "",
    image_url: "",
  });

  // Translations
  const [translations, setTranslations] = useState(
    /** @type {Record<string, { name: string, content: string }>} */({})
  );

  // Touched
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

  // Load data when opening
  useEffect(() => {
    if (!isOpen) return;

    const raw = initialData?.item ? initialData.item : (initialData || {});
    if (isEditing) {
      setBaseVI({
        name: raw.name || "",
        type: raw.type || "certification",
        content: raw.content || "",
        image_url: raw.image_url || "",
      });
      setImagePreview(raw.image_url || "");

      lastSourceName.current = raw.name || "";
      lastSourceContent.current = raw.content || "";

      (async () => {
        try {
          const id = raw.id || initialData.id;
          const r = await fetch(`/api/cer-partners/${id}/translations`);
          if (!r.ok) return;
          const j = await r.json();
          const tr = j?.translations || {};

          const norm = Object.fromEntries(
            Object.entries(tr).map(([lc, v]) => [
              lc.toLowerCase(),
              { name: v?.name || "", content: v?.content || "" },
            ])
          );
          delete norm.vi; // VI is base

          setTranslations(norm);

          // mark touched if have data to avoid overwriting
          const nextTouched = {};
          for (const [lc, v] of Object.entries(norm)) {
            nextTouched[lc] = {
              name: !!(v?.name && v.name.trim()),
              content: !!(v?.content && v.content.trim()),
            };
          }
          setTouched(nextTouched);

          const defaults = ["vi", "en"];
          const withData = Object.entries(norm)
            .filter(([, v]) => v.name || v.content)
            .map(([lc]) => lc);
          setOpenLocales(Array.from(new Set([...defaults, ...withData])));
        } catch (e) {
          console.warn("load cp translations error", e);
        }
      })();
    } else {
      setBaseVI({ name: "", type: "certification", content: "", image_url: "" });
      setImagePreview("");
      setTranslations({});
      setTouched({});
      setOpenLocales(["vi", "en"]);
      lastSourceName.current = "";
      lastSourceContent.current = "";
    }

    setActiveTab("vi");
  }, [isOpen, initialData, isEditing]);

  // Auto-translate VI → others
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
      if (!targets.length) return;

      try {
        setIsTranslating(true);
        for (const lc of targets) {
          const hasAny =
            !!(translations[lc]?.name && translations[lc].name.trim()) ||
            !!(translations[lc]?.content && translations[lc].content.trim());
          if (hasAny) continue;

          const t = touched[lc] || {};
          let newName = "";
          let newContent = "";

          if (needName && !t.name) newName = await translateText(srcName, "vi", lc);
          if (needContent && !t.content) newContent = await translateText(srcContent, "vi", lc);

          if (newName || newContent) {
            setTranslations((prev) => {
              const curr = prev[lc] || { name: "", content: "" };
              return { ...prev, [lc]: { name: newName || curr.name, content: newContent || curr.content } };
            });
          }
        }
      } finally {
        setIsTranslating(false);
      }
    }, 450);

    return () => clearTimeout(debounceTimer.current);
  }, [baseVI.name, baseVI.content, autoTranslate, openLocales, touched, translations]);

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
    const t = await translateText(src, "vi", lc);
    if (!t) return;
    handleTrChange(lc, "content", t);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return alert("Vui lòng chọn file ảnh hợp lệ!");
    if (file.size > 8 * 1024 * 1024) return alert("Kích thước ảnh tối đa 8MB!");
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (evt) => setImagePreview(String(evt.target?.result || ""));
    reader.readAsDataURL(file);
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    const response = await fetch("/api/upload-image", { method: "POST", body: formData });
    if (!response.ok) throw new Error("Upload failed");
    const data = await response.json();
    return data.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!baseVI.name.trim()) return alert(L(activeTab, "needNameVI"));
    if (!baseVI.type) return alert(L(activeTab, "needType"));
    if (!baseVI.content.trim()) return alert(L(activeTab, "needContentVI"));

    setIsUploading(true);
    try {
      let image_url = baseVI.image_url;
      if (imageFile) image_url = await uploadImage(imageFile);

      const payload = {
        name: baseVI.name,
        type: baseVI.type,
        content: baseVI.content,
        image_url,
      };

      const cleanTranslations = {};
      for (const [lc, v] of Object.entries(translations)) {
        const hasAny = v?.name || v?.content;
        if (!hasAny) continue;
        cleanTranslations[lc] = { name: v.name || "", content: v.content || "" };
      }
      if (Object.keys(cleanTranslations).length) payload.translations = cleanTranslations;

      if (isEditing) payload.id = initialData?.item?.id || initialData?.id;

      await onSubmit(payload);
      onClose?.();

      // reset
      setBaseVI({ name: "", type: "certification", content: "", image_url: "" });
      setTranslations({});
      setTouched({});
      setOpenLocales(["vi", "en"]);
      setActiveTab("vi");
      setImageFile(null);
      setImagePreview("");
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
    setBaseVI((prev) => ({ ...prev, image_url: "" }));
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
                  type="text"
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
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Tag size={16} /> {L("vi", "type_label")}
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    name="type"
                    value={baseVI.type}
                    onChange={handleBaseChange}
                    required
                    disabled={isUploading}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    {Object.keys(TYPE_LABELS.vi).map((k) => (
                      <option key={k} value={k}>
                        {tType("vi", k)}
                      </option>
                    ))}
                  </select>
                  <span
                    className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${baseVI.type === "certification"
                        ? "bg-blue-100 text-blue-700"
                        : baseVI.type === "partner"
                          ? "bg-green-100 text-green-700"
                          : baseVI.type === "award"
                            ? "bg-amber-100 text-amber-700"
                            : baseVI.type === "license"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-gray-100 text-gray-700"
                      }`}
                  >
                    {tType("vi", baseVI.type)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {L("vi", "content_label_vi")}
                </label>
                <textarea
                  name="content"
                  value={baseVI.content}
                  onChange={handleBaseChange}
                  rows={6}
                  placeholder={L("vi", "content_ph_vi")}
                  required
                  disabled={isUploading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
                {isTranslating && (
                  <div className="mt-2 text-xs text-gray-500 inline-flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" /> {L(activeTab, "translating")}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{L("vi", "image_section")}</label>
                {imagePreview ? (
                  <div className="mb-3 relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full max-h-[70vh] object-contain rounded-lg border bg-gray-50"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      disabled={isUploading}
                      className="cursor-pointer absolute top-2 right-2 bg-red-500 text-white rounded px-2 py-1 text-xs hover:bg-red-600 disabled:bg-gray-400"
                    >
                      {L("vi", "remove_image")}
                    </button>
                  </div>
                ) : (
                  <div className="mb-3 w-full aspect-video rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400">
                    <div className="flex items-center gap-2">
                      <ImageIcon /> {L("vi", "no_image")}
                    </div>
                  </div>
                )}

                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isUploading}
                    className="hidden"
                    id="certpartner-image-upload"
                  />
                  <label
                    htmlFor="certpartner-image-upload"
                    className={`cursor-pointer flex flex-col items-center space-y-2 ${isUploading ? "cursor-not-allowed opacity-50" : ""
                      }`}
                  >
                    {isUploading ? (
                      <Loader2 className="animate-spin text-blue-500" size={28} />
                    ) : (
                      <Upload className="text-gray-400" size={28} />
                    )}
                    <span className="text-sm text-gray-600">
                      {isUploading ? L("vi", "uploading") : L("vi", "pick_image")}
                    </span>
                    <span className="text-xs text-gray-400">PNG, JPG, WEBP ≤ 8MB</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Other locales */}
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
                    <textarea
                      value={translations[lc]?.content || ""}
                      onChange={(e) => handleTrChange(lc, "content", e.target.value)}
                      rows={6}
                      placeholder={L(lc, "content_ph", lc)}
                      disabled={isUploading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
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
              className="cursor-pointer px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:bg-blue-400 disabled:cursor-not-allowed inline-flex items-center gap-2"
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

export default CertPartnerFormModal;
