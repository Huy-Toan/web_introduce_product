// src/components/SubCategoriesFormModal.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Upload, Loader2, Wand2, Sparkles, Plus } from 'lucide-react';

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

/** Nhãn/placeholder theo locale */
const LABELS = {
  vi: {
    parent: 'Danh mục cha',
    parent_ph: '— Chọn danh mục cha —',
    name: 'Tên danh mục con',
    name_ph: 'Nhập tên danh mục con',
    description: 'Mô tả',
    description_ph: 'Nhập mô tả danh mục con',
    autoTranslate: 'Tự dịch từ VI',
    name_any: (lc) => `Tên (${lc})`,
    name_any_ph: (lc) => `Name (${lc})`,
    desc_any: (lc) => `Mô tả (${lc})`,
    desc_any_ph: (lc) => `Description (${lc})`,
    slug: 'Slug',
    slug_ph: 'vd: trai-cay-tuoi',
  },
  en: {
    parent: 'Parent category',
    parent_ph: '— Select parent category —',
    name: 'Subcategory name',
    name_ph: 'Enter subcategory name',
    description: 'Description',
    description_ph: 'Enter subcategory description',
    autoTranslate: 'Auto-translate from VI',
    name_any: (lc) => `Name (${lc})`,
    name_any_ph: (lc) => `Name (${lc})`,
    desc_any: (lc) => `Description (${lc})`,
    desc_any_ph: (lc) => `Description (${lc})`,
    slug: 'Slug',
    slug_ph: 'e.g. fresh-fruits',
  },
  ja: {
    parent: '親カテゴリ',
    parent_ph: '— 親カテゴリを選択 —',
    name: 'サブカテゴリ名',
    name_ph: 'サブカテゴリ名を入力',
    description: '説明',
    description_ph: 'サブカテゴリの説明を入力',
    autoTranslate: 'VI から自動翻訳',
    name_any: (lc) => `名称 (${lc})`,
    name_any_ph: (lc) => `名称 (${lc})`,
    desc_any: (lc) => `説明 (${lc})`,
    desc_any_ph: (lc) => `説明 (${lc})`,
    slug: 'スラッグ',
    slug_ph: '例: fresh-fruits',
  },
  ko: {
    parent: '상위 카테고리',
    parent_ph: '— 상위 카테고리 선택 —',
    name: '하위 카테고리명',
    name_ph: '하위 카테고리명을 입력하세요',
    description: '설명',
    description_ph: '하위 카테고리 설명을 입력하세요',
    autoTranslate: '베트남어에서 자동 번역',
    name_any: (lc) => `이름 (${lc})`,
    name_any_ph: (lc) => `이름 (${lc})`,
    desc_any: (lc) => `설명 (${lc})`,
    desc_any_ph: (lc) => `설명 (${lc})`,
    slug: '슬러그',
    slug_ph: '예: fresh-fruits',
  },
  zh: {
    parent: '父级分类',
    parent_ph: '— 选择父级分类 —',
    name: '子分类名称',
    name_ph: '输入子分类名称',
    description: '描述',
    description_ph: '输入子分类描述',
    autoTranslate: '从越南语自动翻译',
    name_any: (lc) => `名称 (${lc})`,
    name_any_ph: (lc) => `名称 (${lc})`,
    desc_any: (lc) => `描述 (${lc})`,
    desc_any_ph: (lc) => `描述 (${lc})`,
    slug: '短链接',
    slug_ph: '例如: fresh-fruits',
  },
  fr: {
    parent: 'Catégorie parente',
    parent_ph: '— Sélectionner la catégorie parente —',
    name: 'Nom de la sous-catégorie',
    name_ph: 'Saisir le nom de la sous-catégorie',
    description: 'Description',
    description_ph: 'Saisir la description de la sous-catégorie',
    autoTranslate: 'Traduire automatiquement depuis le VI',
    name_any: (lc) => `Nom (${lc})`,
    name_any_ph: (lc) => `Nom (${lc})`,
    desc_any: (lc) => `Description (${lc})`,
    desc_any_ph: (lc) => `Description (${lc})`,
    slug: 'Slug',
    slug_ph: 'ex. fresh-fruits',
  },
  de: {
    parent: 'Übergeordnete Kategorie',
    parent_ph: '— Übergeordnete Kategorie wählen —',
    name: 'Unterkategoriename',
    name_ph: 'Unterkategorienamen eingeben',
    description: 'Beschreibung',
    description_ph: 'Beschreibung der Unterkategorie eingeben',
    autoTranslate: 'Automatisch aus VI übersetzen',
    name_any: (lc) => `Name (${lc})`,
    name_any_ph: (lc) => `Name (${lc})`,
    desc_any: (lc) => `Beschreibung (${lc})`,
    desc_any_ph: (lc) => `Beschreibung (${lc})`,
    slug: 'Slug',
    slug_ph: 'z. B. fresh-fruits',
  },
};
const L = (lc, key, ...args) =>
  typeof LABELS[lc]?.[key] === 'function'
    ? LABELS[lc][key](...args)
    : LABELS[lc]?.[key] ?? LABELS.en[key] ?? key;

const SubCategoriesFormModal = ({ isOpen, onClose, onSubmit, initialData = {} }) => {
  const isEditing = Boolean(initialData?.id);

  // Base (VI) -> subcategories
  const [form, setForm] = useState({
    parent_id: '',
    name: '',
    slug: '',
    description: '',
    image_url: ''
  });

  // Translations -> subcategories_translations (name + description + slug)
  const [translations, setTranslations] = useState(
    /** @type {Record<string, {name?:string, slug?:string, description?:string}>} */({})
  );

  const [parents, setParents] = useState([]); // [{id,name,slug,...}]
  const [parentsLoading, setParentsLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [slugError, setSlugError] = useState('');
  const [slugErrorsTr, setSlugErrorsTr] = useState(/** @type {Record<string,string>} */({}));
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [activeTab, setActiveTab] = useState('vi');
  const [openLocales, setOpenLocales] = useState(['vi', 'en']);
  const [touched, setTouched] = useState(/** @type {Record<string,{name?:boolean,slug?:boolean,description?:boolean}>} */({}));
  const debounceRef = useRef(null);
  const lastSnapshotRef = useRef({ name: '', description: '' });

  const selectedParent = useMemo(
    () => parents.find(p => String(p.id) === String(form.parent_id)),
    [parents, form.parent_id]
  );

  // nạp dữ liệu khi mở modal
  useEffect(() => {
    if (!isOpen) return;

    const fetchParents = async () => {
      try {
        setParentsLoading(true);
        const res = await fetch('/api/parent_categories'); // hoặc /api/parents tuỳ router bạn
        const data = await res.json();
        const list = data.parents || data.parent_categories || [];
        setParents(list);
      } catch (e) {
        console.error('fetch parents error:', e);
        setParents([]);
      } finally {
        setParentsLoading(false);
      }
    };

    fetchParents();

    // set base form
    setForm({
      parent_id: initialData.parent_id ?? '',
      name: initialData.name || '',
      slug: initialData.slug || '',
      description: initialData.description || '',
      image_url: initialData.image_url || ''
    });
    setImagePreview(initialData.image_url || '');
    setImageFile(null);
    setSlugError('');
    setSlugErrorsTr({});

    // translations nếu BE trả kèm
    const initTr = { ...(initialData.translations || {}) };
    delete initTr.vi;
    setTranslations(
      Object.fromEntries(
        Object.entries(initTr).map(([lc, v]) => [lc, {
          name: v?.name || '',
          slug: v?.slug || '',
          description: v?.description || ''
        }])
      )
    );
    const nextOpen = Array.from(new Set(['vi', 'en', ...Object.keys(initTr)]));
    setOpenLocales(nextOpen);
    setActiveTab('vi');
    setTouched({});
    lastSnapshotRef.current = { name: initialData.name || '', description: initialData.description || '' };
  }, [isOpen, initialData?.id]);

  // Khi EDIT: gọi API lấy translations nếu backend không trả kèm
  useEffect(() => {
    const loadTranslationsIfEditing = async () => {
      if (!isOpen || !initialData?.id) return;
      try {
        // Sửa path đúng router: /api/subcategories/:id/translations
        const r = await fetch(`/api/sub_categories/${initialData.id}/translations`);
        if (!r.ok) return;
        const j = await r.json();
        if (j?.translations && typeof j.translations === 'object') {
          const apiTr = {};
          for (const [lc, v] of Object.entries(j.translations)) {
            if (lc === 'vi') continue;
            apiTr[lc] = {
              name: v?.name || '',
              slug: v?.slug || '',
              description: v?.description || ''
            };
          }
          setTranslations(prev => ({ ...apiTr, ...prev })); // ưu tiên dữ liệu từ API
          const nextOpen = Array.from(new Set(['vi', 'en', ...Object.keys(apiTr)]));
          setOpenLocales(nextOpen);
        }
      } catch (e) {
        console.warn('load translations error', e);
      }
    };
    loadTranslationsIfEditing();
  }, [isOpen, initialData?.id]);

  // Auto-translate name + description + auto-gen slug nếu trống
  useEffect(() => {
    if (!autoTranslate) return;
    const srcName = form.name?.trim() || '';
    const srcDesc = form.description?.trim() || '';
    if (!srcName && !srcDesc) return;

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const last = lastSnapshotRef.current;
      if (last.name === srcName && last.description === srcDesc) return;
      lastSnapshotRef.current = { name: srcName, description: srcDesc };

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
          const nextSlug = currentSlug ? currentSlug : (nextName ? slugify(nextName) : '');
          return { ...prev, [lc]: { name: nextName, slug: nextSlug, description: nextDesc } };
        });
      }
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [form.name, form.description, autoTranslate, openLocales, touched]);

  const canAddLocales = useMemo(
    () => ALL_LOCALES.filter(lc => !openLocales.includes(lc)),
    [openLocales]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'slug') setSlugError('');
  };

  const handleTrChange = (lc, key, value) => {
    setTranslations(prev => ({
      ...prev,
      [lc]: { ...(prev[lc] || { name: '', slug: '', description: '' }), [key]: value }
    }));
    setTouched(prev => ({ ...prev, [lc]: { ...(prev[lc] || {}), [key]: true } }));
    if (key === 'slug') setSlugErrorsTr(prev => ({ ...prev, [lc]: '' }));
  };

  const handleSlugBlur = () => {
    if (!isEditing) return;
    const normalized = slugify(form.slug || '');
    setForm(prev => ({ ...prev, slug: normalized }));
    if (normalized && !isValidSlug(normalized)) {
      setSlugError('Slug chỉ gồm a-z, 0-9 và dấu gạch nối (-), không bắt đầu/kết thúc bằng -.');
    }
  };

  const handleSlugBlurTR = (lc) => {
    const current = translations[lc]?.slug || '';
    const normalized = slugify(current);
    setTranslations(prev => ({ ...prev, [lc]: { ...(prev[lc] || {}), slug: normalized } }));
    setSlugErrorsTr(prev => ({
      ...prev,
      [lc]: normalized && !isValidSlug(normalized)
        ? 'Slug chỉ gồm a-z, 0-9 và dấu gạch nối (-), không bắt đầu/kết thúc bằng -.'
        : ''
    }));
  };

  const generateSlugFromName = () => {
    const s = slugify(form.name || '');
    setForm(prev => ({ ...prev, slug: s }));
    setSlugError(s && !isValidSlug(s) ? 'Slug không hợp lệ.' : '');
  };

  const generateSlugFromTRName = (lc) => {
    const name = translations[lc]?.name || '';
    const s = slugify(name);
    setTranslations(prev => ({ ...prev, [lc]: { ...(prev[lc] || {}), slug: s } }));
    setSlugErrorsTr(prev => ({ ...prev, [lc]: s && !isValidSlug(s) ? 'Slug không hợp lệ.' : '' }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Vui lòng chọn file ảnh hợp lệ!'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Kích thước ảnh không được vượt quá 5MB!'); return; }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (evt) => setImagePreview(String(evt.target?.result || ''));
    reader.readAsDataURL(file);
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

    // validate bắt buộc
    if (!form.parent_id) { alert(L('vi', 'parent') + ' *'); return; }
    if (!form.name?.trim()) { alert(L('vi', 'name') + ' *'); return; }

    // validate slug khi EDIT
    if (isEditing) {
      if (!form.slug) { setSlugError('Vui lòng nhập slug hoặc dùng “Tạo từ tên”.'); return; }
      if (!isValidSlug(form.slug)) { setSlugError('Slug không hợp lệ.'); return; }
    }

    // validate slug translations (nếu có lỗi đang hiển thị)
    for (const lc of Object.keys(slugErrorsTr)) {
      if (slugErrorsTr[lc]) { alert(`Slug (${lc.toUpperCase()}) không hợp lệ.`); return; }
    }

    setIsUploading(true);
    try {
      let finalForm = { ...form, parent_id: Number(form.parent_id) };

      if (imageFile) {
        const { image_key} = await uploadImage(imageFile);
        finalForm.image_key = image_key;     
      }

      // translations payload: { lc: { name?, slug?, description? } }
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

      // thêm mới: không gửi slug → backend tự sinh
      if (!isEditing) {
        const { slug, ...rest } = finalForm;
        finalForm = rest;
      } else {
        finalForm.slug = slugify(finalForm.slug || '');
      }

      if (Object.keys(cleanTranslations).length) {
        finalForm.translations = cleanTranslations;
      }
      if (initialData.id) finalForm.id = initialData.id;

      await onSubmit(finalForm);
      onClose();

      // reset
      setForm({ parent_id: '', name: '', slug: '', description: '', image_url: '' });
      setImageFile(null);
      setImagePreview('');
      setSlugError('');
      setSlugErrorsTr({});
      setTranslations({});
      setOpenLocales(['vi', 'en']);
      setActiveTab('vi');
      setTouched({});
      lastSnapshotRef.current = { name: '', description: '' };
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
    setForm(prev => ({ ...prev, image_url: '' }));
  };

  if (!isOpen) return null;

  const siteURL = import.meta?.env?.VITE_SITE_URL || '';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-xl font-semibold">
            {isEditing ? 'Chỉnh sửa Danh mục con (đa ngôn ngữ)' : 'Thêm Danh mục con (đa ngôn ngữ)'}
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
                  className={`px-3 py-1 rounded-full border text-sm mr-1 ${activeTab === lc ? 'bg-black text-white' : ''}`}
                >
                  {lc.toUpperCase()}
                </button>
                {lc !== 'vi' && (
                  <button
                    type="button"
                    onClick={() => {
                      setOpenLocales(prev => prev.filter(x => x !== lc));
                      setTranslations(prev => { const copy = { ...prev }; delete copy[lc]; return copy; });
                      setTouched(prev => { const copy = { ...prev }; delete copy[lc]; return copy; });
                      setSlugErrorsTr(prev => { const copy = { ...prev }; delete copy[lc]; return copy; });
                      setActiveTab('vi');
                    }}
                    className="text-xs text-red-600 mr-2"
                    title="Đóng tab này"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}

            {ALL_LOCALES.some(lc => !openLocales.includes(lc)) && (
              <div className="relative">
                <details className="dropdown">
                  <summary className="px-3 py-1 rounded-full border cursor-pointer inline-flex items-center gap-1">
                    <Plus size={16} /> Thêm ngôn ngữ
                  </summary>
                  <div className="absolute z-10 mt-2 w-40 rounded-lg border bg-white shadow">
                    {ALL_LOCALES.filter(lc => !openLocales.includes(lc)).map(lc => (
                      <button
                        key={lc}
                        type="button"
                        onClick={() => {
                          setOpenLocales(prev => [...prev, lc]);
                          setTranslations(prev => prev[lc] ? prev : { ...prev, [lc]: { name: '', slug: '', description: '' } });
                          setActiveTab(lc);
                        }}
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

          {/* TAB VI (base) */}
          {activeTab === 'vi' && (
            <div className="space-y-6">
              {/* Parent Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {L('vi', 'parent')} *
                </label>
                <div className="relative">
                  <select
                    name="parent_id"
                    value={form.parent_id}
                    onChange={handleChange}
                    disabled={isUploading || parentsLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">{L('vi', 'parent_ph')}</option>
                    {parents.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  {parentsLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="animate-spin text-gray-400" size={18} />
                    </div>
                  )}
                </div>
                {selectedParent && (
                  <p className="text-xs text-gray-500 mt-1">
                    Đã chọn: <span className="font-medium">{selectedParent.name}</span> ({selectedParent.slug})
                  </p>
                )}
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {L('vi', 'name')} *
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder={L('vi', 'name_ph')}
                  required
                  disabled={isUploading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              {/* Slug (chỉ hiện khi edit) */}
              {isEditing && (
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slug (URL)
                    </label>
                    <button
                      type="button"
                      onClick={generateSlugFromName}
                      disabled={isUploading}
                      className="text-sm inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
                      title="Sinh slug từ tên danh mục"
                    >
                      <Wand2 size={16} />
                      Tạo từ tên
                    </button>
                  </div>
                  <input
                    name="slug"
                    value={form.slug}
                    onChange={handleChange}
                    onBlur={handleSlugBlur}
                    placeholder={L('vi', 'slug_ph')}
                    disabled={isUploading}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 disabled:bg-gray-100 ${slugError ? 'border-red-400 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-500'}`}
                  />
                  {slugError ? (
                    <p className="text-sm text-red-600 mt-1">{slugError}</p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">
                      URL: <span className="font-mono">
                        {(import.meta?.env?.VITE_SITE_URL || '')}/parents/{selectedParent?.slug || '<parent>'}/{form.slug || '<slug>'}
                      </span>
                    </p>
                  )}
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {L('vi', 'description')} (VI) *
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={8}
                  placeholder={L('vi', 'description_ph')}
                  required
                  disabled={isUploading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              {/* Image */}
              <ImagePicker
                imagePreview={imagePreview}
                setImagePreview={setImagePreview}
                setImageFile={setImageFile}
                setForm={setForm}
                isUploading={isUploading}
              />
            </div>
          )}

          {/* Các TAB ngôn ngữ khác */}
          {openLocales.filter(lc => lc !== 'vi').map(lc => (
            activeTab === lc && (
              <div key={lc} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {L(lc, 'name_any', lc.toUpperCase())}
                    </label>
                    <input
                      value={translations[lc]?.name || ''}
                      onChange={(e) => handleTrChange(lc, 'name', e.target.value)}
                      placeholder={L(lc, 'name_any_ph', lc.toUpperCase())}
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
                      placeholder={LABELS[lc]?.slug_ph || LABELS.vi.slug_ph}
                      disabled={isUploading}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 disabled:bg-gray-100 ${slugErrorsTr[lc] ? 'border-red-400 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-500'}`}
                    />
                    {slugErrorsTr[lc] ? (
                      <p className="text-sm text-red-600 mt-1">{slugErrorsTr[lc]}</p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">
                        URL: <span className="font-mono">
                          {(import.meta?.env?.VITE_SITE_URL || '')}/{lc}/parents/{selectedParent?.slug || '<parent>'}/{translations[lc]?.slug || '<slug>'}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {L(lc, 'desc_any', lc.toUpperCase())}
                  </label>
                  <textarea
                    value={translations[lc]?.description || ''}
                    onChange={(e) => handleTrChange(lc, 'description', e.target.value)}
                    rows={6}
                    placeholder={L(lc, 'desc_any_ph', lc.toUpperCase())}
                    disabled={isUploading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Dữ liệu sẽ lưu vào <span className="font-mono">subcategories_translations</span> ({lc.toUpperCase()}).
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

function ImagePicker({ imagePreview, setImagePreview, setImageFile, setForm, isUploading }) {
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
              setForm(prev => ({ ...prev, image_url: '' }));
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
          id="subcat-image-upload"
        />
        <label
          htmlFor="subcat-image-upload"
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

export default SubCategoriesFormModal;
