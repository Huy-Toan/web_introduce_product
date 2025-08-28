// src/components/ParentCategoriesFormModal.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Upload, Loader2, Wand2, Plus, Sparkles } from 'lucide-react';

const slugify = (s = '') =>
  s
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const isValidSlug = (s = '') => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s);
const ALL_LOCALES = ['vi', 'en', 'ja', 'ko', 'zh', 'fr', 'de'];

/** Nhãn & placeholder theo locale */
const LABELS = {
  vi: {
    name: 'Tên danh mục lớn',
    name_ph: 'Nhập tên danh mục',
    description: 'Mô tả',
    description_ph: 'Nhập mô tả danh mục',
    autoTranslate: 'Tự dịch từ VI',
    slug: 'Slug',
    slug_ph: 'vd: thuc-pham',
  },
  en: {
    name: 'Category name',
    name_ph: 'Enter category name',
    description: 'Description',
    description_ph: 'Enter category description',
    autoTranslate: 'Auto-translate from VI',
    slug: 'Slug',
    slug_ph: 'e.g. food',
  },
  ja: {
    name: 'カテゴリ名',
    name_ph: 'カテゴリ名を入力',
    description: '説明',
    description_ph: 'カテゴリの説明を入力',
    autoTranslate: 'VI から自動翻訳',
    slug: 'スラッグ',
    slug_ph: '例: food',
  },
  ko: {
    name: '카테고리명',
    name_ph: '카테고리명을 입력하세요',
    description: '설명',
    description_ph: '카테고리 설명을 입력하세요',
    autoTranslate: '베트남어에서 자동 번역',
    slug: '슬러그',
    slug_ph: '예: food',
  },
  zh: {
    name: '分类名称',
    name_ph: '输入分类名称',
    description: '描述',
    description_ph: '输入分类描述',
    autoTranslate: '从越南语自动翻译',
    slug: '短链接',
    slug_ph: '例如: food',
  },
  fr: {
    name: 'Nom de catégorie',
    name_ph: 'Saisir le nom de la catégorie',
    description: 'Description',
    description_ph: 'Saisir la description de la catégorie',
    autoTranslate: 'Traduire automatiquement depuis le VI',
    slug: 'Slug',
    slug_ph: 'ex. food',
  },
  de: {
    name: 'Kategoriename',
    name_ph: 'Kategorienamen eingeben',
    description: 'Beschreibung',
    description_ph: 'Kategorie­beschreibung eingeben',
    autoTranslate: 'Automatisch aus VI übersetzen',
    slug: 'Slug',
    slug_ph: 'z. B. food',
  },
};
const L = (lc, key) => LABELS[lc]?.[key] ?? LABELS.en[key] ?? key;

const ParentCategoriesFormModal = ({ isOpen, onClose, onSubmit, initialData = {} }) => {
  const isEditing = Boolean(initialData?.id);

  // Base (VI) -> parent_categories
  const [base, setBase] = useState({ name: '', slug: '', description: '', image_url: '' });

  // Translations -> parent_categories_translations (name + description + slug)
  const [translations, setTranslations] = useState(
    /** @type {Record<string, {name?:string, slug?:string, description?:string}>} */({})
  );

  const [touched, setTouched] = useState(
    /** @type {Record<string,{name?:boolean,slug?:boolean,description?:boolean}>} */({})
  );
  const [activeTab, setActiveTab] = useState('vi');
  const [openLocales, setOpenLocales] = useState(['vi', 'en']);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [slugErrorVI, setSlugErrorVI] = useState('');
  const [slugErrorsTr, setSlugErrorsTr] = useState(/** @type {Record<string,string>} */({}));
  const [autoTranslate, setAutoTranslate] = useState(true);
  const debounceTimer = useRef(null);
  const lastSourceSnapshot = useRef({ name: '', description: '' });

  // Nạp dữ liệu khi mở modal
  useEffect(() => {
    if (initialData && isOpen) {
      setBase({
        name: initialData.name || '',
        slug: initialData.slug || '',
        description: initialData.description || '',
        image_url: initialData.image_url || ''
      });
      setImagePreview(initialData.image_url || '');
      setActiveTab('vi');
      setSlugErrorVI('');
      setSlugErrorsTr({});
      lastSourceSnapshot.current = {
        name: initialData.name || '',
        description: initialData.description || ''
      };

      // Nếu FE có kèm translations sẵn
      const initTr = { ...(initialData.translations || {}) };
      delete initTr.vi;
      const addLocales = Object.keys(initTr);
      const defaults = ['vi', 'en'];
      const nextOpen = Array.from(new Set([...defaults, ...addLocales]));
      setOpenLocales(nextOpen);
      setTranslations(
        Object.fromEntries(
          Object.entries(initTr).map(([lc, v]) => [
            lc,
            {
              name: v?.name || '',
              slug: v?.slug || '',
              description: v?.description || ''
            }
          ])
        )
      );
      setTouched({});
    }
  }, [initialData, isOpen]);

  // Khi EDIT: gọi API lấy translations nếu backend không trả kèm
  useEffect(() => {
    const loadTranslationsIfEditing = async () => {
      if (!isOpen || !initialData?.id) return;
      try {
        // NOTE: Cập nhật đúng endpoint lấy translations cho parent
        const r = await fetch(`/api/parent_categories/${initialData.id}/translations`);
        if (!r.ok) return;
        const j = await r.json();
        if (j?.translations && typeof j.translations === 'object') {
          const initTr = {};
          for (const [lc, v] of Object.entries(j.translations)) {
            if (lc === 'vi') continue;
            initTr[lc] = {
              name: v?.name || '',
              slug: v?.slug || '',
              description: v?.description || ''
            };
          }
          setTranslations(prev => ({ ...initTr, ...prev }));
          const nextOpen = Array.from(new Set(['vi', 'en', ...Object.keys(initTr)]));
          setOpenLocales(nextOpen);
        }
      } catch (e) {
        console.warn('load translations error', e);
      }
    };
    loadTranslationsIfEditing();
  }, [isOpen, initialData?.id]);

  // Auto-translate từ VI sang locale khác (nếu bật) cho name + description + auto-gen slug nếu rỗng/chưa touch
  useEffect(() => {
    if (!autoTranslate) return;
    const srcName = base.name?.trim() || '';
    const srcDesc = base.description?.trim() || '';
    if (!srcName && !srcDesc) return;

    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      const last = lastSourceSnapshot.current;
      if (last.name === srcName && last.description === srcDesc) return;
      lastSourceSnapshot.current = { name: srcName, description: srcDesc };

      const targets = openLocales.filter(lc => lc !== 'vi');
      for (const lc of targets) {
        const isTouched = touched[lc]?.name || touched[lc]?.description || touched[lc]?.slug;
        if (isTouched) continue;

        let nameTranslated = '';
        let descTranslated = '';
        try {
          if (srcName) {
            const r = await fetch('/api/translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: srcName, source: 'vi', target: lc })
            });
            if (r.ok) nameTranslated = (await r.json())?.translated || '';
          }
          if (srcDesc) {
            const r2 = await fetch('/api/translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: srcDesc, source: 'vi', target: lc })
            });
            if (r2.ok) descTranslated = (await r2.json())?.translated || '';
          }
        } catch { /* noop */ }

        setTranslations(prev => {
          const nextName = nameTranslated || prev[lc]?.name || srcName;
          const nextDesc = descTranslated || prev[lc]?.description || srcDesc;
          const currentSlug = (prev[lc]?.slug || '').trim();
          // chỉ tự sinh slug nếu đang trống
          const nextSlug = currentSlug ? currentSlug : (nextName ? slugify(nextName) : '');
          return {
            ...prev,
            [lc]: { name: nextName, slug: nextSlug, description: nextDesc }
          };
        });
      }
    }, 400);

    return () => clearTimeout(debounceTimer.current);
  }, [base.name, base.description, autoTranslate, openLocales, touched]);

  const canAddLocales = useMemo(
    () => ALL_LOCALES.filter(lc => !openLocales.includes(lc)),
    [openLocales]
  );

  const handleBaseChange = (e) => {
    const { name, value } = e.target;
    setBase(prev => ({ ...prev, [name]: value }));
    if (name === 'slug') setSlugErrorVI('');
  };

  const handleTrChange = (lc, key, value) => {
    setTranslations(prev => ({
      ...prev,
      [lc]: { ...(prev[lc] || { name: '', slug: '', description: '' }), [key]: value }
    }));
    setTouched(prev => ({ ...prev, [lc]: { ...(prev[lc] || {}), [key]: true } }));
    if (key === 'slug') {
      setSlugErrorsTr(prev => ({ ...prev, [lc]: '' }));
    }
  };

  const addLocaleTab = (lc) => {
    if (lc === 'vi') return;
    setOpenLocales(prev => prev.includes(lc) ? prev : [...prev, lc]);
    setTranslations(prev => prev[lc] ? prev : { ...prev, [lc]: { name: '', slug: '', description: '' } });
    setActiveTab(lc);
  };

  const removeLocaleTab = (lc) => {
    if (lc === 'vi') return;
    setOpenLocales(prev => prev.filter(x => x !== lc));
    setTranslations(prev => {
      const copy = { ...prev }; delete copy[lc]; return copy;
    });
    setTouched(prev => {
      const copy = { ...prev }; delete copy[lc]; return copy;
    });
    setSlugErrorsTr(prev => {
      const copy = { ...prev }; delete copy[lc]; return copy;
    });
    setActiveTab('vi');
  };

  const handleSlugBlurVI = () => {
    const normalized = slugify(base.slug || '');
    setBase(prev => ({ ...prev, slug: normalized }));
    if (normalized && !isValidSlug(normalized)) {
      setSlugErrorVI('Slug chỉ gồm a-z, 0-9 và dấu gạch nối (-), không bắt đầu/kết thúc bằng -.');
    }
  };
  const generateSlugFromVIName = () => {
    const s = slugify(base.name || '');
    setBase(prev => ({ ...prev, slug: s }));
    setSlugErrorVI(s && !isValidSlug(s) ? 'Slug không hợp lệ.' : '');
  };

  const handleSlugBlurTR = (lc) => {
    const current = translations[lc]?.slug || '';
    const normalized = slugify(current);
    setTranslations(prev => ({
      ...prev,
      [lc]: { ...(prev[lc] || {}), slug: normalized }
    }));
    setSlugErrorsTr(prev => ({
      ...prev,
      [lc]: normalized && !isValidSlug(normalized)
        ? 'Slug chỉ gồm a-z, 0-9 và dấu gạch nối (-), không bắt đầu/kết thúc bằng -.'
        : ''
    }));
  };
  const generateSlugFromTRName = (lc) => {
    const name = translations[lc]?.name || '';
    const s = slugify(name);
    setTranslations(prev => ({
      ...prev,
      [lc]: { ...(prev[lc] || {}), slug: s }
    }));
    setSlugErrorsTr(prev => ({
      ...prev,
      [lc]: s && !isValidSlug(s) ? 'Slug không hợp lệ.' : ''
    }));
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await fetch('/api/upload-image', { method: 'POST', body: formData });
    if (!response.ok) throw new Error('Upload failed');
    const data = await response.json();
    return {
      image_key: data.image_key,                 
      previewUrl: data.displayUrl || data.url,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate tối thiểu
    if (!base.name?.trim()) {
      alert('Vui lòng nhập tên danh mục (VI).');
      return;
    }
    if (isEditing && base.slug && !isValidSlug(base.slug)) {
      setSlugErrorVI('Slug không hợp lệ.');
      return;
    }
    // validate slug translations nếu có lỗi đang hiển thị
    for (const lc of Object.keys(slugErrorsTr)) {
      if (slugErrorsTr[lc]) {
        alert(`Slug (${lc.toUpperCase()}) không hợp lệ.`);
        return;
      }
    }

    setIsUploading(true);
    try {
      let image_url = base.image_url;
      if (imageFile) {
        const uploaded = await uploadImage(imageFile);
        image_url = uploaded.image_key;        
        setImagePreview(uploaded.previewUrl); 
      }

      // Base payload
      let payloadBase = { name: base.name, description: base.description, image_url };
      if (isEditing && base.slug) payloadBase.slug = slugify(base.slug || '');
      // Tạo mới: nếu muốn để BE tự sinh slug -> đừng gửi slug
      if (!isEditing && payloadBase.slug) {
        const { slug, ...rest } = payloadBase;
        payloadBase = rest;
      }

      // Translations payload (kèm slug)
      const cleanTranslations = {};
      for (const [lc, v] of Object.entries(translations)) {
        const tName = (v?.name || '').trim();
        const tDesc = (v?.description || '').trim();
        const tSlugRaw = (v?.slug || '').trim();
        const tSlug = tSlugRaw ? slugify(tSlugRaw) : '';
        const hasAny = tName || tDesc || tSlug;
        if (!hasAny) continue;

        const entry = {};
        if (tName) entry.name = tName;
        if (tDesc) entry.description = tDesc;
        if (tSlug && isValidSlug(tSlug)) entry.slug = tSlug;
        cleanTranslations[lc] = entry;
      }

      const finalPayload = {
        ...payloadBase,
        ...(Object.keys(cleanTranslations).length ? { translations: cleanTranslations } : {})
      };
      if (initialData.id) finalPayload.id = initialData.id;

      await onSubmit(finalPayload);
      onClose();

      // reset
      setBase({ name: '', slug: '', description: '', image_url: '' });
      setTranslations({});
      setTouched({});
      setOpenLocales(['vi', 'en']);
      setActiveTab('vi');
      setImageFile(null);
      setImagePreview('');
      setSlugErrorVI('');
      setSlugErrorsTr({});
      lastSourceSnapshot.current = { name: '', description: '' };
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra khi upload ảnh hoặc gửi dữ liệu. Vui lòng thử lại!');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;
  const siteURL = import.meta?.env?.VITE_SITE_URL || '';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-xl font-semibold">
            {isEditing ? 'Chỉnh sửa Danh mục lớn (đa ngôn ngữ)' : 'Thêm Danh mục lớn (đa ngôn ngữ)'}
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
                <Sparkles size={16} /> {L(activeTab, 'autoTranslate')}
              </span>
            </label>
            <button
              onClick={onClose}
              className="cursor-pointer text-gray-400 hover:text-gray-600"
              disabled={isUploading}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Tabs header */}
          <div className="flex items-center gap-2 flex-wrap">
            {openLocales.map(lc => (
              <div key={lc} className="flex items-center">
                <button
                  type="button"
                  onClick={() => setActiveTab(lc)}
                  className={`cursor-pointer px-3 py-1 rounded-full border text-sm mr-1 ${activeTab === lc ? 'bg-black text-white' : ''}`}
                >
                  {lc.toUpperCase()}
                </button>
                {lc !== 'vi' && (
                  <button
                    type="button"
                    onClick={() => removeLocaleTab(lc)}
                    className="cursor-pointer text-xs text-red-600 mr-2"
                    title="Đóng tab này"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}

            {canAddLocales.length > 0 && (
              <div className="relative">
                <details className="dropdown">
                  <summary className="px-3 py-1 rounded-full border cursor-pointer inline-flex items-center gap-1">
                    <Plus size={16} /> Thêm ngôn ngữ
                  </summary>
                  <div className="absolute z-10 mt-2 w-40 rounded-lg border bg-white shadow">
                    {canAddLocales.map(lc => (
                      <button
                        key={lc}
                        type="button"
                        onClick={() => addLocaleTab(lc)}
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

          {/* Tab VI */}
          {activeTab === 'vi' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {L('vi', 'name')} (VI) *
                  </label>
                  <input
                    name="name"
                    value={base.name}
                    onChange={handleBaseChange}
                    placeholder={L('vi', 'name_ph')}
                    required
                    disabled={isUploading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>

                {/* Slug VI */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slug (VI)
                    </label>
                    <button
                      type="button"
                      onClick={generateSlugFromVIName}
                      disabled={isUploading}
                      className="cursor-pointer text-sm inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
                      title="Sinh slug từ tên"
                    >
                      <Wand2 size={16} />
                      Tạo từ tên
                    </button>
                  </div>
                  <input
                    name="slug"
                    value={base.slug}
                    onChange={handleBaseChange}
                    onBlur={handleSlugBlurVI}
                    placeholder={L('vi', 'slug_ph')}
                    disabled={isUploading}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 disabled:bg-gray-100 ${slugErrorVI ? 'border-red-400 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                  />
                  {slugErrorVI ? (
                    <p className="text-sm text-red-600 mt-1">{slugErrorVI}</p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">
                      URL: <span className="font-mono">
                        {(siteURL)}/parents/{base.slug || '<slug>'}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {L('vi', 'description')} (VI) *
                </label>
                <textarea
                  name="description"
                  value={base.description}
                  onChange={handleBaseChange}
                  rows={6}
                  placeholder={L('vi', 'description_ph')}
                  required
                  disabled={isUploading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              {/* Ảnh */}
              <ImagePicker
                imagePreview={imagePreview}
                setImagePreview={setImagePreview}
                setImageFile={setImageFile}
                setBase={setBase}
                isUploading={isUploading}
              />
            </div>
          )}

          {/* Tabs khác */}
          {openLocales.filter(lc => lc !== 'vi').map(lc => (
            activeTab === lc && (
              <div key={lc} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {L(lc, 'name')} ({lc.toUpperCase()})
                    </label>
                    <input
                      value={translations[lc]?.name || ''}
                      onChange={(e) => handleTrChange(lc, 'name', e.target.value)}
                      placeholder={`${L(lc, 'name_ph')}`}
                      disabled={isUploading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  {/* Slug theo locale */}
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {L(lc, 'slug')} ({lc.toUpperCase()})
                      </label>
                      <button
                        type="button"
                        onClick={() => generateSlugFromTRName(lc)}
                        disabled={isUploading}
                        className="text-sm inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
                        title="Sinh slug từ tên"
                      >
                        <Wand2 size={16} />
                        Tạo từ tên
                      </button>
                    </div>
                    <input
                      value={translations[lc]?.slug || ''}
                      onChange={(e) => handleTrChange(lc, 'slug', e.target.value)}
                      onBlur={() => handleSlugBlurTR(lc)}
                      placeholder={L(lc, 'slug_ph')}
                      disabled={isUploading}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 disabled:bg-gray-100 ${slugErrorsTr[lc] ? 'border-red-400 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-500'}`}
                    />
                    {slugErrorsTr[lc] ? (
                      <p className="text-sm text-red-600 mt-1">{slugErrorsTr[lc]}</p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">
                        URL: <span className="font-mono">
                          {(siteURL)}/{lc}/parents/{translations[lc]?.slug || '<slug>'}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {L(lc, 'description')} ({lc.toUpperCase()})
                  </label>
                  <textarea
                    value={translations[lc]?.description || ''}
                    onChange={(e) => handleTrChange(lc, 'description', e.target.value)}
                    rows={6}
                    placeholder={`${L(lc, 'description_ph')}`}
                    disabled={isUploading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Dữ liệu sẽ lưu vào <span className="font-mono">parent_categories_translations</span> ({lc.toUpperCase()}).
                  </p>
                </div>
              </div>
            )
          ))}

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
              className="cursor-pointer px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
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

function ImagePicker({ imagePreview, setImagePreview, setImageFile, setBase, isUploading }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh minh họa</label>
      {imagePreview && (
        <div className="mb-3 relative inline-block">
          <img src={imagePreview} alt="Preview" className="w-64 h-40 object-cover rounded-md border" />
          <button
            type="button"
            onClick={() => {
              setImageFile(null);
              setImagePreview('');
              setBase(prev => ({ ...prev, image_url: '' }));
            }}
            disabled={isUploading}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 disabled:bg-gray-400"
          >
            <X size={12} />
          </button>
        </div>
      )}
      <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-blue-400 transition-colors">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (!file.type.startsWith('image/')) { alert('Vui lòng chọn file ảnh hợp lệ!'); return; }
            if (file.size > 5 * 1024 * 1024) { alert('Kích thước ảnh không vượt quá 5MB!'); return; }
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (evt) => setImagePreview(String(evt.target?.result || ''));
            reader.readAsDataURL(file);
          }}
          disabled={isUploading}
          className="hidden"
          id="parent-image-upload"
        />
        <label
          htmlFor="parent-image-upload"
          className={`cursor-pointer flex flex-col items-center space-y-2 ${isUploading ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          {isUploading ? <Loader2 className="animate-spin text-blue-500" size={28} /> : <Upload className="text-gray-400" size={28} />}
          <span className="text-sm text-gray-600">{isUploading ? 'Đang upload...' : 'Chọn ảnh từ máy tính'}</span>
          <span className="text-xs text-gray-400">PNG, JPG, GIF tối đa 5MB</span>
        </label>
      </div>
    </div>
  );
}

export default ParentCategoriesFormModal;
