// BannerFormModal.jsx — giữ UI gốc, nâng cấp đa ngôn ngữ như "about"
import React, { useEffect, useRef, useState } from 'react';
import { X, Upload, Loader2, Image as ImageIcon, Plus, Languages, Sparkles } from 'lucide-react';

const ALL_LOCALES = ['vi', 'en', 'ja', 'ko', 'zh', 'fr', 'de'];

async function translateText(text, source, target) {
  try {
    const r = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, source, target }),
    });
    if (!r.ok) return '';
    const j = await r.json();
    return j?.translated || '';
  } catch {
    return '';
  }
}

// Dịch markdown/đoạn text theo dòng để giữ prefix (#, -, >, 1. ) nếu có
async function translateMarkdown(md, source, target) {
  const lines = (md || '').split('\n');
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
  return out.join('\n');
}

function LocaleTabs({ openLocales, active, setActive, addLocale, removeLocale }) {
  const canAdd = ALL_LOCALES.filter((lc) => !openLocales.includes(lc));
  return (
    <div className="flex items-center gap-2 flex-wrap mb-2">
      {openLocales.map((lc) => (
        <div key={lc} className="flex items-center">
          <button
            type="button"
            onClick={() => setActive(lc)}
            className={`px-3 py-1 rounded-full border text-sm mr-1 ${active === lc ? 'bg-black text-white' : ''}`}
          >
            {lc.toUpperCase()}
          </button>
          {lc !== 'vi' && (
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
              <Plus size={16} /> Thêm ngôn ngữ
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

const BannerFormModal = ({ isOpen, onClose, onSubmit, initialData = {} }) => {
  const isEditing = Boolean(initialData?.id);

  // Base (VI)
  const [form, setForm] = useState({ content: '', image_url: '' });

  // Translations: { [lc]: { content: string } }
  const [translations, setTranslations] = useState({});
  const [touched, setTouched] = useState({}); // { [lc]: { content: true } }

  // Tabs
  const [activeLang, setActiveLang] = useState('vi');
  const [openLocales, setOpenLocales] = useState(['vi', 'en']);

  // Image
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // State
  const [isUploading, setIsUploading] = useState(false);
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);
  const debounceRef = useRef(null);
  const lastVIMark = useRef('');

  // nạp dữ liệu khi mở modal
  useEffect(() => {
    if (!isOpen) return;

    const raw = initialData?.banner || initialData || {};
    const id = raw.id || initialData.id;

    setForm({
      content: raw.content || '',
      image_url: raw.image_url || ''
    });
    setImagePreview(raw.image_url || '');
    setImageFile(null);

    // load translations khi edit
    (async () => {
      try {
        if (!isEditing || !id) {
          setTranslations({});
          setOpenLocales(['vi', 'en']);
          setActiveLang('vi');
          return;
        }
        const r = await fetch(`/api/banners/${id}/translations`);
        if (!r.ok) {
          setTranslations({});
          setOpenLocales(['vi', 'en']);
          setActiveLang('vi');
          return;
        }
        const j = await r.json();
        const tr = j?.translations || {};
        const norm = Object.fromEntries(
          Object.entries(tr).map(([lc, v]) => [lc.toLowerCase(), { content: v?.content || '' }])
        );
        delete norm.vi;
        setTranslations(norm);

        const defaults = ['vi', 'en'];
        const withData = Object.entries(norm)
          .filter(([, v]) => (v.content || '').trim())
          .map(([lc]) => lc);
        setOpenLocales(Array.from(new Set([...defaults, ...withData])));
        setActiveLang('vi');
      } catch {
        setTranslations({});
        setOpenLocales(['vi', 'en']);
        setActiveLang('vi');
      }
    })();

    setTouched({});
    lastVIMark.current = raw.content || '';
  }, [initialData, isOpen, isEditing]);

  // auto translate từ VI → các tab mở (nếu chưa gõ vào)
  useEffect(() => {
    if (!autoTranslate) return;
    const src = (form.content || '').trim();
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (!src || src === lastVIMark.current) return;
      lastVIMark.current = src;

      const targets = openLocales.filter((lc) => lc !== 'vi');
      if (!targets.length) return;

      setIsTranslating(true);
      try {
        for (const lc of targets) {
          if (touched[lc]?.content) continue; // user đã chỉnh → không overwrite
          const out = await translateMarkdown(src, 'vi', lc);
          if (!out) continue;
          setTranslations((prev) => ({ ...prev, [lc]: { ...(prev[lc] || {}), content: out } }));
        }
      } finally {
        setIsTranslating(false);
      }
    }, 450);

    return () => clearTimeout(debounceRef.current);
  }, [form.content, autoTranslate, openLocales, touched]);

  const addLocale = (lc) => {
    if (lc === 'vi') return;
    setOpenLocales((prev) => (prev.includes(lc) ? prev : [...prev, lc]));
    setTranslations((prev) => (prev[lc] ? prev : { ...prev, [lc]: { content: '' } }));
    setActiveLang(lc);
  };
  const removeLocale = (lc) => {
    if (lc === 'vi') return;
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
    setActiveLang('vi');
  };

  const handleChangeVI = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleChangeTr = (lc, value) => {
    setTranslations((prev) => ({ ...prev, [lc]: { ...(prev[lc] || {}), content: value } }));
    setTouched((prev) => ({ ...prev, [lc]: { ...(prev[lc] || {}), content: true } }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return alert('Vui lòng chọn file ảnh hợp lệ!');
    if (file.size > 8 * 1024 * 1024) return alert('Kích thước ảnh tối đa 8MB!');
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (evt) => setImagePreview(evt.target.result);
    reader.readAsDataURL(file);
  };

  const translateContentFromVI = async (lc) => {
    const src = (form.content || '').trim();
    if (!src) return;
    const out = await translateMarkdown(src, 'vi', lc);
    if (!out) return;
    handleChangeTr(lc, out);
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await fetch('/api/upload-image', { method: 'POST', body: formData });
    if (!response.ok) throw new Error('Upload failed');
    const data = await response.json();
    return data.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.content?.trim()) {
      alert('Vui lòng nhập Nội dung (VI)');
      return;
    }
    setIsUploading(true);
    try {
      let finalForm = { ...form };

      if (imageFile) {
        const uploadedImageUrl = await uploadImage(imageFile);
        finalForm.image_url = uploadedImageUrl;
      }

      // gom translations có nội dung
      const outTr = {};
      for (const [lc, v] of Object.entries(translations)) {
        const md = (v?.content || '').trim();
        if (!md) continue;
        outTr[lc] = { content: md };
      }
      if (Object.keys(outTr).length) finalForm.translations = outTr;

      if (isEditing && initialData.id) {
        finalForm.id = initialData.id;
      }

      await onSubmit(finalForm);
      onClose();

      // reset
      setForm({ content: '', image_url: '' });
      setTranslations({});
      setTouched({});
      setOpenLocales(['vi', 'en']);
      setActiveLang('vi');
      setImageFile(null);
      setImagePreview('');
      lastVIMark.current = '';
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra khi upload ảnh hoặc gửi dữ liệu. Vui lòng thử lại!');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setForm((prev) => ({ ...prev, image_url: '' }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-xl font-semibold">
            {initialData.id ? 'Chỉnh sửa Banner (đa ngôn ngữ)' : 'Thêm Banner mới (đa ngôn ngữ)'}
          </h3>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoTranslate}
                onChange={(e) => setAutoTranslate(e.target.checked)}
                disabled={isUploading}
              />
              <span className="inline-flex items-center gap-1">
                <Sparkles size={16} /> Tự dịch từ VI
              </span>
            </label>
            <button
              onClick={onClose}
              className="cursor-pointer text-gray-400 hover:text-gray-600"
              disabled={isUploading}
              aria-label="Đóng"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tabs ngôn ngữ */}
          <LocaleTabs
            openLocales={openLocales}
            active={activeLang}
            setActive={setActiveLang}
            addLocale={addLocale}
            removeLocale={removeLocale}
          />

          {/* Content */}
          {activeLang === 'vi' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung (VI) *</label>
              <textarea
                name="content"
                value={form.content}
                onChange={handleChangeVI}
                rows={8}
                placeholder="Nhập nội dung banner"
                required
                disabled={isUploading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
              {isTranslating && (
                <div className="mt-2 text-xs text-gray-500 inline-flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" /> Đang tự dịch sang các ngôn ngữ khác…
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Nội dung ({activeLang.toUpperCase()})
                </label>
                <button
                  type="button"
                  onClick={() => translateContentFromVI(activeLang)}
                  disabled={isUploading || !(form.content || '').trim()}
                  className="cursor-pointer px-2 py-1 border rounded text-sm flex items-center gap-1 hover:bg-gray-50"
                  title="Dịch nội dung từ VI"
                >
                  <Languages size={16} /> Dịch từ VI
                </button>
              </div>
              <textarea
                value={translations[activeLang]?.content || ''}
                onChange={(e) => handleChangeTr(activeLang, e.target.value)}
                rows={8}
                placeholder={`Nhập nội dung (${activeLang.toUpperCase()})`}
                disabled={isUploading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
          )}

          {/* Image big preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ảnh banner
            </label>

            {imagePreview ? (
              <div className="mb-3 relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-h-[70vh] object-contain rounded-lg border bg-gray-50"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
                <button
                  type="button"
                  onClick={removeImage}
                  disabled={isUploading}
                  className="cursor-pointer absolute top-2 right-2 bg-red-500 text-white rounded px-2 py-1 text-xs hover:bg-red-600 disabled:bg-gray-400"
                >
                  Gỡ ảnh
                </button>
              </div>
            ) : (
              <div className="mb-3 w-full aspect-video rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400">
                <div className="flex items-center gap-2">
                  <ImageIcon /> Chưa có ảnh
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
                id="banner-image-upload"
              />
              <label
                htmlFor="banner-image-upload"
                className={`cursor-pointer flex flex-col items-center space-y-2 ${isUploading ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                {isUploading ? (
                  <Loader2 className="animate-spin text-blue-500" size={28} />
                ) : (
                  <Upload className="text-gray-400" size={28} />
                )}
                <span className="text-sm text-gray-600">
                  {isUploading ? 'Đang upload...' : 'Chọn ảnh từ máy tính'}
                </span>
                <span className="text-xs text-gray-400">PNG, JPG, WEBP tối đa 8MB</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="cursor-pointer px-5 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="cursor-pointer px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:bg-blue-400 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {isUploading && <Loader2 className="animate-spin" size={18} />}
              {isEditing ? 'Cập nhật' : 'Thêm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BannerFormModal;