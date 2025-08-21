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

const CategoriesFormModal = ({ isOpen, onClose, onSubmit, initialData = {} }) => {
  const isEditing = Boolean(initialData?.id);

  // Base (VI) -> bảng chính
  const [base, setBase] = useState({ name: '', slug: '', description: '', image_url: '' });

  // Translations (khác 'vi') -> category_translations (name + slug)
  const [translations, setTranslations] = useState(
    /** @type {Record<string, {name:string, slug:string}>} */({})
  );

  const [touched, setTouched] = useState(/** @type {Record<string,{name?:boolean,slug?:boolean}>} */({}));
  const [activeTab, setActiveTab] = useState('vi');
  const [openLocales, setOpenLocales] = useState(['vi', 'en']);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [slugErrorVI, setSlugErrorVI] = useState('');
  const [slugErrorByLC, setSlugErrorByLC] = useState({});
  const [autoTranslate, setAutoTranslate] = useState(true);
  const debounceTimer = useRef(null);
  const lastSourceName = useRef('');

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
      setSlugErrorByLC({});
      lastSourceName.current = initialData.name || '';

      // Nếu response detail đã kèm translations (tuỳ backend), map vào
      const initTr = { ...(initialData.translations || {}) };
      delete initTr.vi;
      const addLocales = Object.keys(initTr);
      const defaults = ['vi', 'en'];
      const nextOpen = Array.from(new Set([...defaults, ...addLocales]));
      setOpenLocales(nextOpen);
      setTranslations(
        Object.fromEntries(
          Object.entries(initTr).map(([lc, v]) => [lc, { name: v?.name || '', slug: v?.slug || '' }])
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
        const r = await fetch(`/api/categories/${initialData.id}/translations`);
        if (!r.ok) return; // không có route này cũng không sao
        const j = await r.json();
        if (j?.translations && typeof j.translations === 'object') {
          const initTr = {};
          for (const [lc, v] of Object.entries(j.translations)) {
            if (lc === 'vi') continue;
            initTr[lc] = {
              name: v?.name || '',
              slug: v?.slug || ''
            };
          }
          setTranslations(prev => ({ ...initTr, ...prev })); // ưu tiên dữ liệu từ API
          const nextOpen = Array.from(new Set(['vi', 'en', ...Object.keys(initTr)]));
          setOpenLocales(nextOpen);
        }
      } catch (e) {
        // im lặng nếu không có route này
        console.warn('load translations error', e);
      }
    };
    loadTranslationsIfEditing();
  }, [isOpen, initialData?.id]);

  // Auto-translate từ tên VI sang locale khác (nếu bật)
  useEffect(() => {
    if (!autoTranslate) return;
    const src = base.name?.trim() || '';
    if (!src) return;

    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      if (lastSourceName.current === src) return;
      lastSourceName.current = src;

      const targets = openLocales.filter(lc => lc !== 'vi');
      for (const lc of targets) {
        const isTouched = touched[lc]?.name || touched[lc]?.slug;
        if (isTouched) continue;

        // Gọi /api/translate nếu có; fallback: copy nguyên rồi slugify
        let txt = '';
        try {
          const r = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: src, source: 'vi', target: lc })
          });
          if (r.ok) {
            const j = await r.json();
            txt = j?.translated || '';
          }
        } catch { }
        if (!txt) txt = src; // fallback copy

        setTranslations(prev => {
          const name = txt;
          const slug = prev[lc]?.slug || slugify(name);
          return { ...prev, [lc]: { name, slug } };
        });
      }
    }, 400);

    return () => clearTimeout(debounceTimer.current);
  }, [base.name, autoTranslate, openLocales, touched]);

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
      [lc]: { ...(prev[lc] || { name: '', slug: '' }), [key]: value }
    }));
    setTouched(prev => ({ ...prev, [lc]: { ...(prev[lc] || {}), [key]: true } }));
    if (key === 'slug') setSlugErrorByLC(prev => ({ ...prev, [lc]: '' }));
  };

  const addLocaleTab = (lc) => {
    if (lc === 'vi') return;
    setOpenLocales(prev => prev.includes(lc) ? prev : [...prev, lc]);
    setTranslations(prev => prev[lc] ? prev : { ...prev, [lc]: { name: '', slug: '' } });
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
    setActiveTab('vi');
  };

  const handleSlugBlurVI = () => {
    if (!isEditing) return; // giữ hành vi cũ: chỉ edit slug khi sửa
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

  const handleSlugBlurLC = (lc) => {
    const normalized = slugify((translations[lc]?.slug) || '');
    handleTrChange(lc, 'slug', normalized);
    if (normalized && !isValidSlug(normalized)) {
      setSlugErrorByLC(prev => ({ ...prev, [lc]: 'Slug không hợp lệ.' }));
    }
  };
  const generateSlugFromLCName = (lc) => {
    const s = slugify(translations[lc]?.name || '');
    handleTrChange(lc, 'slug', s);
    setSlugErrorByLC(prev => ({ ...prev, [lc]: s && !isValidSlug(s) ? 'Slug không hợp lệ.' : '' }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Vui lòng chọn file ảnh hợp lệ!'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Kích thước ảnh không vượt quá 5MB!'); return; }
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
    return data.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate VI slug khi edit
    if (isEditing) {
      if (!base.slug) { setSlugErrorVI('Vui lòng nhập slug hoặc dùng “Tạo từ tên”.'); return; }
      if (!isValidSlug(base.slug)) { setSlugErrorVI('Slug không hợp lệ.'); return; }
    }

    // Validate slug các locale khác
    for (const [lc, v] of Object.entries(translations)) {
      if (!v?.name) continue; // cho phép để trống
      if (v.slug && !isValidSlug(v.slug)) {
        setSlugErrorByLC(prev => ({ ...prev, [lc]: 'Slug không hợp lệ.' }));
        return;
      }
    }

    setIsUploading(true);
    try {
      let image_url = base.image_url;
      if (imageFile) {
        image_url = await uploadImage(imageFile);
      }

      // Build base payload
      let payloadBase = { name: base.name, description: base.description, image_url };
      if (isEditing) payloadBase.slug = slugify(base.slug || '');

      // Nếu muốn để backend tự sinh slug khi tạo mới, bỏ dòng này lại
      if (!isEditing && payloadBase.slug) {
        const { slug, ...rest } = payloadBase;
        payloadBase = rest;
      }

      // Build translations payload
      const cleanTranslations = {};
      for (const [lc, v] of Object.entries(translations)) {
        if (!v?.name && !v?.slug) continue;
        const tSlug = v.slug?.trim() || slugify(v.name || '');
        cleanTranslations[lc] = { name: v.name || '', slug: tSlug };
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
      setSlugErrorByLC({});
      lastSourceName.current = '';
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
            {isEditing ? 'Chỉnh sửa Danh mục (đa ngôn ngữ)' : 'Thêm Danh mục mới (đa ngôn ngữ)'}
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
              className="text-gray-400 hover:text-gray-600"
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
                    onClick={() => removeLocaleTab(lc)}
                    className="text-xs text-red-600 mr-2"
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
                    Tên danh mục (VI) *
                  </label>
                  <input
                    name="name"
                    value={base.name}
                    onChange={handleBaseChange}
                    placeholder="Nhập tên danh mục"
                    required
                    disabled={isUploading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>

                {/* Slug VI: chỉ hiển thị khi EDIT (giữ hành vi cũ) */}
                {isEditing && (
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Slug (VI)
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const s = slugify(base.name || '');
                          setBase(prev => ({ ...prev, slug: s }));
                          setSlugErrorVI(s && !isValidSlug(s) ? 'Slug không hợp lệ.' : '');
                        }}
                        disabled={isUploading}
                        className="text-sm inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
                        title="Sinh slug từ tên danh mục (VI)"
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
                      placeholder="vd: trai-cay-tuoi"
                      disabled={isUploading}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 disabled:bg-gray-100 ${slugErrorVI ? 'border-red-400 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-500'
                        }`}
                    />
                    {slugErrorVI ? (
                      <p className="text-sm text-red-600 mt-1">{slugErrorVI}</p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">
                        URL: <span className="font-mono">
                          {(import.meta?.env?.VITE_SITE_URL || '')}/categories/{base.slug || '<slug>'}
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả (VI) *
                </label>
                <textarea
                  name="description"
                  value={base.description}
                  onChange={handleBaseChange}
                  rows={8}
                  placeholder="Nhập mô tả danh mục"
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
                      Tên danh mục ({lc.toUpperCase()})
                    </label>
                    <input
                      value={translations[lc]?.name || ''}
                      onChange={(e) => handleTrChange(lc, 'name', e.target.value)}
                      placeholder={`Category name (${lc.toUpperCase()})`}
                      disabled={isUploading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Slug ({lc.toUpperCase()})
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const s = slugify(translations[lc]?.name || '');
                          handleTrChange(lc, 'slug', s);
                          setSlugErrorByLC(prev => ({ ...prev, [lc]: s && !isValidSlug(s) ? 'Slug không hợp lệ.' : '' }));
                        }}
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
                      onBlur={() => handleSlugBlurLC(lc)}
                      placeholder={`vd: books-${lc}`}
                      disabled={isUploading}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 disabled:bg-gray-100 ${slugErrorByLC[lc] ? 'border-red-400 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-500'
                        }`}
                    />
                    {slugErrorByLC[lc] ? (
                      <p className="text-sm text-red-600 mt-1">{slugErrorByLC[lc]}</p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">
                        Dữ liệu sẽ lưu vào <span className="font-mono">category_translations</span> ({lc.toUpperCase()}).
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          ))}

          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-5 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
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
          id="cat-image-upload"
        />
        <label
          htmlFor="cat-image-upload"
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

export default CategoriesFormModal;
