<<<<<<< HEAD
=======
// src/components/ProductFormModal.jsx
>>>>>>> feature/lead
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Upload, Loader2, Wand2, Plus, Sparkles, Languages } from 'lucide-react';
import EditorMd from './EditorMd';

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

<<<<<<< HEAD
// Hàm dịch từng dòng Markdown, giữ lại cú pháp
async function translateMarkdown(md, source, target) {
  const lines = md.split('\n');
  const result = [];
  for (const line of lines) {
    // Regex nhận diện dòng markdown (tiêu đề, list, quote, v.v.)
    const match = line.match(/^(\s*([#>*\-]|[0-9]+\.)\s*)(.*)$/);
    if (match) {
      // Dịch phần text sau ký tự markdown
      const prefix = match[1];
      const text = match[3];
      let translatedText = text;
      if (text.trim()) {
        try {
          const r = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, source, target }),
          });
          if (r.ok) translatedText = (await r.json())?.translated || text;
        } catch { }
      }
      result.push(prefix + translatedText);
    } else {
      // Dòng thường, dịch toàn bộ
      let translatedLine = line;
      if (line.trim()) {
        try {
          const r = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: line, source, target }),
          });
          if (r.ok) translatedLine = (await r.json())?.translated || line;
        } catch { }
      }
      result.push(translatedLine);
    }
  }
  return result.join('\n');
=======
/** Dịch markdown theo dòng, giữ prefix cú pháp */
async function translateMarkdown(md, source, target) {
  const lines = String(md || '').split('\n');
  const out = [];
  for (const line of lines) {
    const m = line.match(/^(\s*([#>*\-]|[0-9]+\.)\s*)(.*)$/);
    const prefix = m ? m[1] : '';
    const text = m ? m[3] : line;
    let translated = text;
    if (text.trim()) {
      try {
        const r = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, source, target }),
        });
        if (r.ok) translated = (await r.json())?.translated || text;
      } catch { }
    }
    out.push(prefix ? prefix + translated : translated);
  }
  return out.join('\n');
>>>>>>> feature/lead
}

const ProductFormModal = ({ isOpen, onClose, onSubmit, initialData = {} }) => {
  const isEditing = Boolean(initialData?.id);

<<<<<<< HEAD
  // Base (VI) -> bảng products
=======
  // Base (VI) -> products
>>>>>>> feature/lead
  const [base, setBase] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
    image_url: '',
    parent_id: null,       // để chọn parent trong UI (không gửi lên)
    subcategory_id: null,  // gửi lên API
  });

<<<<<<< HEAD
  // Translations -> bảng product_translations
  const [translations, setTranslations] = useState(
    /** @type {Record<string,{title:string,slug:string,short_description:string,content:string}>} */({})
  );

  const [touched, setTouched] = useState(
    /** @type {Record<string,{title?:boolean,slug?:boolean,short_description?:boolean,content?:boolean}>} */({})
=======
  // Translations -> products_translations (title, description, content)
  const [translations, setTranslations] = useState(
    /** @type {Record<string,{title:string,description:string,content:string}>} */({})
  );

  const [touched, setTouched] = useState(
    /** @type {Record<string,{title?:boolean,description?:boolean,content?:boolean}>} */({})
>>>>>>> feature/lead
  );

  const [activeTab, setActiveTab] = useState('vi');
  const [openLocales, setOpenLocales] = useState(['vi', 'en']);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [slugErrorVI, setSlugErrorVI] = useState('');
<<<<<<< HEAD
  const [slugErrorByLC, setSlugErrorByLC] = useState({});

  const [autoTranslate, setAutoTranslate] = useState(true);
  const debounceTimer = useRef(null);
  const lastSourceTitle = useRef('');
  const lastSourceDesc = useRef('');
=======
>>>>>>> feature/lead

  const [autoTranslate, setAutoTranslate] = useState(true);
  const debounceTimer = useRef(null);
  const lastSourceTitle = useRef('');
  const lastSourceDesc = useRef('');

<<<<<<< HEAD
  // Editor refs
  const editorVIRef = useRef(null);
  const editorRefs = useRef({}); // per-locale editor for content
=======
  // Data cho dropdown
  const [parents, setParents] = useState([]);           // [{id,name,slug}]
  const [parentsLoading, setParentsLoading] = useState(false);
  const [subcats, setSubcats] = useState([]);           // [{id,parent_id,name,slug}]
  const [subcatsLoading, setSubcatsLoading] = useState(false);
>>>>>>> feature/lead

  // Editors
  const editorVIRef = useRef(null);
  const editorRefs = useRef({}); // per-locale

  // ===== Fetch parents khi mở modal
  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
<<<<<<< HEAD
        setCatLoading(true);
        const res = await fetch('/api/categories?locale=vi');
        const data = await res.json();
        setCategories(data?.categories || []);
      } catch {
        setCategories([]);
=======
        setParentsLoading(true);
        const r = await fetch('/api/parent_categories');
        const j = await r.json();
        setParents(j?.parents || []);
      } catch {
        setParents([]);
>>>>>>> feature/lead
      } finally {
        setParentsLoading(false);
      }
    })();
  }, [isOpen]);

  // ===== Khi chọn parent → fetch subcategories theo parent
  useEffect(() => {
<<<<<<< HEAD
    if (initialData && isOpen) {
      const fallbackDescription =
        initialData.description
        ?? initialData.short_description
        ?? initialData?.translations?.vi?.short_description
        ?? '';

      setBase({
        title: initialData.title || '',
        slug: initialData.slug || '',
        description: fallbackDescription,
        content: initialData.content || '',
        image_url: initialData.image_url || '',
        category_id: typeof initialData.category_id === 'number' ? initialData.category_id : null,
      });

      setImagePreview(initialData.image_url || '');
      setActiveTab('vi');
      setSlugErrorVI('');
      setSlugErrorByLC({});
      lastSourceTitle.current = initialData.title || '';
      lastSourceDesc.current = fallbackDescription;

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
              title: v?.title || '',
              slug: v?.slug || '',
              short_description: v?.short_description || '',
              content: v?.content || '',
            },
          ])
        )
      );
      setTouched({});
      setTimeout(() => editorVIRef.current?.refresh?.(), 0);
    }
  }, [initialData, isOpen]);

  useEffect(() => {
    const loadTranslationsIfEditing = async () => {
=======
    if (!isOpen) return;
    const pid = base.parent_id;
    if (!pid) { setSubcats([]); setBase(prev => ({ ...prev, subcategory_id: null })); return; }
    (async () => {
      try {
        setSubcatsLoading(true);
        const r = await fetch(`/api/sub_categories?parent_id=${pid}&locale=vi`);
        const j = await r.json();
        setSubcats(j?.subcategories || []);
      } catch {
        setSubcats([]);
      } finally {
        setSubcatsLoading(false);
      }
    })();
  }, [isOpen, base.parent_id]);

  // ===== Nạp initialData vào form
  useEffect(() => {
    if (!isOpen) return;

    const viDesc =
      initialData.description
      ?? initialData?.translations?.vi?.description
      ?? '';

    const parentFromData = typeof initialData.parent_id === 'number' ? initialData.parent_id : null;
    const subFromData = typeof initialData.subcategory_id === 'number' ? initialData.subcategory_id : null;

    setBase({
      title: initialData.title || '',
      slug: initialData.slug || '',
      description: viDesc,
      content: initialData.content || '',
      image_url: initialData.image_url || '',
      parent_id: parentFromData,
      subcategory_id: subFromData,
    });

    setImagePreview(initialData.image_url || '');
    setActiveTab('vi');
    setSlugErrorVI('');
    lastSourceTitle.current = initialData.title || '';
    lastSourceDesc.current = viDesc;

    // map translations nếu server trả kèm
    const initTr = { ...(initialData.translations || {}) };
    delete initTr.vi;
    setTranslations(
      Object.fromEntries(
        Object.entries(initTr).map(([lc, v]) => [
          lc,
          {
            title: v?.title || '',
            description: v?.description || '',
            content: v?.content || '',
          },
        ])
      )
    );
    const nextOpen = Array.from(new Set(['vi', 'en', ...Object.keys(initTr)]));
    setOpenLocales(nextOpen);
    setTouched({});
    setTimeout(() => editorVIRef.current?.refresh?.(), 0);
  }, [isOpen, initialData?.id]);

  // ===== Nếu edit: gọi API lấy translations nếu BE không trả kèm
  useEffect(() => {
    const loadTr = async () => {
>>>>>>> feature/lead
      if (!isOpen || !initialData?.id) return;
      try {
        const r = await fetch(`/api/products/${initialData.id}/translations`);
        if (!r.ok) return;
        const j = await r.json();
        if (j?.translations && typeof j.translations === 'object') {
<<<<<<< HEAD
          const initTr = {};
          for (const [lc, v] of Object.entries(j.translations)) {
            if (lc === 'vi') continue;
            initTr[lc] = {
              title: v?.title || '',
              slug: v?.slug || '',
              short_description: v?.short_description || '',
              content: v?.content || '',
            };
          }
          setTranslations(prev => ({ ...initTr, ...prev }));
          const nextOpen = Array.from(new Set(['vi', 'en', ...Object.keys(initTr)]));
          setOpenLocales(nextOpen);
        }
      } catch (e) {
        console.warn('load product translations error', e);
      }
    };
    loadTranslationsIfEditing();
  }, [isOpen, initialData?.id]);

=======
          const merged = {};
          for (const [lc, v] of Object.entries(j.translations)) {
            if (lc === 'vi') continue;
            merged[lc] = {
              title: v?.title || '',
              description: v?.description || '',
              content: v?.content || '',
            };
          }
          setTranslations(prev => ({ ...merged, ...prev }));
          setOpenLocales(prev => Array.from(new Set(['vi', 'en', ...Object.keys(merged), ...prev])));
        }
      } catch { }
    };
    loadTr();
  }, [isOpen, initialData?.id]);

  // ===== Lock editors khi upload
>>>>>>> feature/lead
  useEffect(() => {
    editorVIRef.current?.cm?.setOption('readOnly', isUploading ? 'nocursor' : false);
    Object.values(editorRefs.current || {}).forEach((ref) =>
      ref?.cm?.setOption('readOnly', isUploading ? 'nocursor' : false)
    );
  }, [isUploading]);

<<<<<<< HEAD
=======
  // ===== Auto-translate title + description từ VI
>>>>>>> feature/lead
  useEffect(() => {
    if (!autoTranslate) return;
    const srcTitle = base.title?.trim() || '';
    const srcDesc = base.description?.trim() || '';
    if (!srcTitle && !srcDesc) return;

    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      const needTitle = lastSourceTitle.current !== srcTitle && !!srcTitle;
      const needDesc = lastSourceDesc.current !== srcDesc && !!srcDesc;
      if (!needTitle && !needDesc) return;

      lastSourceTitle.current = srcTitle;
      lastSourceDesc.current = srcDesc;

<<<<<<< HEAD
      const targets = openLocales.filter((lc) => lc !== 'vi');
      for (const lc of targets) {
        const touchedLocale = touched[lc] || {};
=======
      const targets = openLocales.filter(lc => lc !== 'vi');
      for (const lc of targets) {
        const touchedLC = touched[lc] || {};
>>>>>>> feature/lead
        let newTitle = '';
        let newDesc = '';

        try {
<<<<<<< HEAD
          if (needTitle && !touchedLocale.title) {
=======
          if (needTitle && !touchedLC.title) {
>>>>>>> feature/lead
            const rt = await fetch('/api/translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: srcTitle, source: 'vi', target: lc }),
            });
            if (rt.ok) newTitle = (await rt.json())?.translated || '';
          }
<<<<<<< HEAD
          if (needDesc && !touchedLocale.short_description) {
=======
          if (needDesc && !touchedLC.description) {
>>>>>>> feature/lead
            const rd = await fetch('/api/translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: srcDesc, source: 'vi', target: lc }),
            });
            if (rd.ok) newDesc = (await rd.json())?.translated || '';
          }
        } catch { }

<<<<<<< HEAD
        setTranslations((prev) => {
          const curr = prev[lc] || { title: '', slug: '', short_description: '', content: '' };
          const title = !touchedLocale.title && newTitle ? newTitle : curr.title;
          const slug = curr.slug || slugify(title || '');
          const short_description = !touchedLocale.short_description && newDesc ? newDesc : curr.short_description;
          return { ...prev, [lc]: { ...curr, title, slug, short_description } };
=======
        setTranslations(prev => {
          const curr = prev[lc] || { title: '', description: '', content: '' };
          return {
            ...prev,
            [lc]: {
              ...curr,
              title: !touchedLC.title && newTitle ? newTitle : curr.title,
              description: !touchedLC.description && newDesc ? newDesc : curr.description,
            }
          };
>>>>>>> feature/lead
        });
      }
    }, 400);

    return () => clearTimeout(debounceTimer.current);
  }, [base.title, base.description, autoTranslate, openLocales, touched]);

<<<<<<< HEAD
  const canAddLocales = useMemo(
    () => ALL_LOCALES.filter((lc) => !openLocales.includes(lc)),
    [openLocales]
  );

  const handleBaseChange = (e) => {
    const { name, value } = e.target;
    if (name === 'category_id') {
      setBase((prev) => ({ ...prev, category_id: value ? Number(value) : null }));
      return;
    }
    setBase((prev) => ({ ...prev, [name]: value }));
=======
  // ===== Derived
  const selectedParent = useMemo(
    () => parents.find(p => String(p.id) === String(base.parent_id)),
    [parents, base.parent_id]
  );
  const selectedSub = useMemo(
    () => subcats.find(s => String(s.id) === String(base.subcategory_id)),
    [subcats, base.subcategory_id]
  );

  // ===== Handlers
  const handleBaseChange = (e) => {
    const { name, value } = e.target;
    if (name === 'parent_id') {
      setBase(prev => ({ ...prev, parent_id: value ? Number(value) : null, subcategory_id: null }));
      return;
    }
    if (name === 'subcategory_id') {
      setBase(prev => ({ ...prev, subcategory_id: value ? Number(value) : null }));
      return;
    }
    setBase(prev => ({ ...prev, [name]: value }));
>>>>>>> feature/lead
    if (name === 'slug') setSlugErrorVI('');
  };

  const handleTrChange = (lc, key, value) => {
<<<<<<< HEAD
    setTranslations((prev) => ({
      ...prev,
      [lc]: { ...(prev[lc] || { title: '', slug: '', short_description: '', content: '' }), [key]: value },
    }));
    setTouched((prev) => ({ ...prev, [lc]: { ...(prev[lc] || {}), [key]: true } }));
    if (key === 'slug') setSlugErrorByLC((prev) => ({ ...prev, [lc]: '' }));
  };

  const addLocaleTab = (lc) => {
    if (lc === 'vi') return;
    setOpenLocales((prev) => (prev.includes(lc) ? prev : [...prev, lc]));
    setTranslations((prev) =>
      prev[lc] ? prev : { ...prev, [lc]: { title: '', slug: '', short_description: '', content: '' } }
    );
    setActiveTab(lc);
  };

  const removeLocaleTab = (lc) => {
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
    setActiveTab('vi');
=======
    setTranslations(prev => ({
      ...prev,
      [lc]: { ...(prev[lc] || { title: '', description: '', content: '' }), [key]: value }
    }));
    setTouched(prev => ({ ...prev, [lc]: { ...(prev[lc] || {}), [key]: true } }));
>>>>>>> feature/lead
  };

  const handleSlugBlurVI = () => {
    if (!isEditing) return;
    const normalized = slugify(base.slug || '');
<<<<<<< HEAD
    setBase((prev) => ({ ...prev, slug: normalized }));
=======
    setBase(prev => ({ ...prev, slug: normalized }));
>>>>>>> feature/lead
    if (normalized && !isValidSlug(normalized)) {
      setSlugErrorVI('Slug chỉ gồm a-z, 0-9 và dấu gạch nối (-), không bắt đầu/kết thúc bằng -.');
    }
  };
<<<<<<< HEAD
  const generateSlugFromVITitle = () => {
    const s = slugify(base.title || '');
    setBase((prev) => ({ ...prev, slug: s }));
    setSlugErrorVI(s && !isValidSlug(s) ? 'Slug không hợp lệ.' : '');
  };

  const handleSlugBlurLC = (lc) => {
    const normalized = slugify(translations[lc]?.slug || '');
    handleTrChange(lc, 'slug', normalized);
    if (normalized && !isValidSlug(normalized)) {
      setSlugErrorByLC((prev) => ({ ...prev, [lc]: 'Slug không hợp lệ.' }));
    }
  };
  const generateSlugFromLCTitle = (lc) => {
    const s = slugify(translations[lc]?.title || '');
    handleTrChange(lc, 'slug', s);
    setSlugErrorByLC((prev) => ({ ...prev, [lc]: s && !isValidSlug(s) ? 'Slug không hợp lệ.' : '' }));
=======

  const generateSlugFromVITitle = () => {
    const s = slugify(base.title || '');
    setBase(prev => ({ ...prev, slug: s }));
    setSlugErrorVI(s && !isValidSlug(s) ? 'Slug không hợp lệ.' : '');
>>>>>>> feature/lead
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await fetch('/api/upload-image', { method: 'POST', body: formData });
    if (!response.ok) throw new Error('Upload failed');
    const data = await response.json();
    return data.url;
  };

<<<<<<< HEAD
  // Sử dụng hàm translateMarkdown cho nội dung chi tiết
=======
>>>>>>> feature/lead
  const translateContentFromVI = async (lc) => {
    const src = base.content?.trim() || '';
    if (!src) return;
    try {
      const translated = await translateMarkdown(src, 'vi', lc);
      if (!translated) return;
<<<<<<< HEAD
      setTranslations((prev) => {
        const curr = prev[lc] || { title: '', slug: '', short_description: '', content: '' };
        return { ...prev, [lc]: { ...curr, content: translated } };
      });
    } catch { }
  };

=======
      handleTrChange(lc, 'content', translated);
    } catch { }
  };

  // ===== Submit
>>>>>>> feature/lead
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!base.title?.trim()) { alert('Vui lòng nhập Tên sản phẩm'); return; }
    if (!base.content?.trim()) { alert('Vui lòng nhập Nội dung sản phẩm'); return; }

<<<<<<< HEAD
    if (!base.title?.trim()) { alert('Vui lòng nhập Tên sản phẩm'); return; }
    if (!base.content?.trim()) { alert('Vui lòng nhập Nội dung sản phẩm'); return; }

    if (isEditing) {
      if (!base.slug) { setSlugErrorVI('Vui lòng nhập slug hoặc dùng “Tạo từ tên”.'); return; }
      if (!isValidSlug(base.slug)) { setSlugErrorVI('Slug không hợp lệ.'); return; }
    }

    for (const [lc, v] of Object.entries(translations)) {
      if (!v?.title && !v?.short_description && !v?.content) continue;
      if (v.slug && !isValidSlug(v.slug)) {
        setSlugErrorByLC((prev) => ({ ...prev, [lc]: 'Slug không hợp lệ.' }));
        return;
      }
=======
    if (isEditing) {
      if (!base.slug) { setSlugErrorVI('Vui lòng nhập slug hoặc dùng “Tạo từ tên”.'); return; }
      if (!isValidSlug(base.slug)) { setSlugErrorVI('Slug không hợp lệ.'); return; }
>>>>>>> feature/lead
    }

    setIsUploading(true);
    try {
      let image_url = base.image_url;
      if (imageFile) image_url = await uploadImage(imageFile);

<<<<<<< HEAD
=======
      // Build base payload
>>>>>>> feature/lead
      let payloadBase = {
        title: base.title,
        description: base.description,
        content: base.content,
        image_url,
<<<<<<< HEAD
        category_id: base.category_id ?? null,
      };
      if (isEditing) payloadBase.slug = slugify(base.slug || '');

=======
        subcategory_id: base.subcategory_id ?? null, // IMPORTANT: theo schema mới
      };
      if (isEditing) payloadBase.slug = slugify(base.slug || '');

      // Tạo mới: bỏ slug để BE tự sinh
>>>>>>> feature/lead
      if (!isEditing && payloadBase.slug) {
        const { slug, ...rest } = payloadBase;
        payloadBase = rest;
      }

<<<<<<< HEAD
      const cleanTranslations = {};
      for (const [lc, v] of Object.entries(translations)) {
        const hasAny = (v?.title || v?.short_description || v?.content || v?.slug);
        if (!hasAny) continue;
        const tSlug = v.slug?.trim() || slugify(v.title || '');
        cleanTranslations[lc] = {
          title: v.title || '',
          slug: tSlug,
          short_description: v.short_description || '',
          content: v.content || '',
=======
      // Build translations payload theo schema mới
      const cleanTranslations = {};
      for (const [lc, v] of Object.entries(translations)) {
        const hasAny = (v?.title || v?.description || v?.content);
        if (!hasAny) continue;
        cleanTranslations[lc] = {
          ...(v.title ? { title: v.title } : {}),
          ...(v.description ? { description: v.description } : {}),
          ...(v.content ? { content: v.content } : {}),
>>>>>>> feature/lead
        };
      }

      const finalPayload = {
        ...payloadBase,
        ...(Object.keys(cleanTranslations).length ? { translations: cleanTranslations } : {}),
      };
      if (initialData.id) finalPayload.id = initialData.id;

      await onSubmit(finalPayload);
      onClose();

<<<<<<< HEAD
      setBase({ title: '', slug: '', description: '', content: '', image_url: '', category_id: null });
=======
      // reset
      setBase({ title: '', slug: '', description: '', content: '', image_url: '', parent_id: null, subcategory_id: null });
>>>>>>> feature/lead
      setTranslations({});
      setTouched({});
      setOpenLocales(['vi', 'en']);
      setActiveTab('vi');
      setImageFile(null);
      setImagePreview('');
      setSlugErrorVI('');
<<<<<<< HEAD
      setSlugErrorByLC({});
=======
>>>>>>> feature/lead
      lastSourceTitle.current = '';
      lastSourceDesc.current = '';
    } catch (err) {
      console.error(err);
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
          <h3 className="text-lg font-semibold">
            {isEditing ? 'Chỉnh sửa sản phẩm (đa ngôn ngữ)' : 'Thêm sản phẩm mới (đa ngôn ngữ)'}
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
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600" disabled={isUploading}>
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-8">
          <LocaleTabs
            openLocales={openLocales}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
<<<<<<< HEAD
            addLocale={(lc) => addLocaleTab(lc)}
            removeLocale={(lc) => removeLocaleTab(lc)}
=======
            addLocale={(lc) => {
              setOpenLocales(prev => prev.includes(lc) ? prev : [...prev, lc]);
              setTranslations(prev => prev[lc] ? prev : { ...prev, [lc]: { title: '', description: '', content: '' } });
              setActiveTab(lc);
            }}
            removeLocale={(lc) => {
              setOpenLocales(prev => prev.filter(x => x !== lc));
              setTranslations(prev => { const cp = { ...prev }; delete cp[lc]; return cp; });
              setTouched(prev => { const cp = { ...prev }; delete cp[lc]; return cp; });
              setActiveTab('vi');
            }}
>>>>>>> feature/lead
          />

          {activeTab === 'vi' && (
            <div className="space-y-6">
<<<<<<< HEAD
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm (VI) *</label>
                  <input
                    name="title"
                    value={base.title}
                    onChange={handleBaseChange}
                    placeholder="Nhập tên sản phẩm"
                    required
                    disabled={isUploading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>

                {isEditing && (
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Slug (VI)</label>
                      <button
                        type="button"
                        onClick={generateSlugFromVITitle}
                        disabled={isUploading}
                        className="text-sm inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
                        title="Sinh slug từ tên (VI)"
                      >
                        <Wand2 size={16} /> Tạo từ tên
                      </button>
                    </div>
                    <input
                      name="slug"
                      value={base.slug}
                      onChange={handleBaseChange}
                      onBlur={handleSlugBlurVI}
                      placeholder="vd: ao-thun-basic"
                      disabled={isUploading}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 disabled:bg-gray-100 ${slugErrorVI ? 'border-red-400 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-500'
                        }`}
                    />
                    {slugErrorVI ? (
                      <p className="text-sm text-red-600 mt-1">{slugErrorVI}</p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">
                        URL: <span className="font-mono">{siteURL}/products/{base.slug || '<slug>'}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                <select
                  name="category_id"
                  value={base.category_id ?? ''}
                  onChange={handleBaseChange}
                  disabled={isUploading || catLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">— Không chọn —</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

=======
              {/* Parent & Subcategory */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục cha *</label>
                  <div className="relative">
                    <select
                      name="parent_id"
                      value={base.parent_id ?? ''}
                      onChange={handleBaseChange}
                      disabled={isUploading || parentsLoading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">— Chọn danh mục cha —</option>
                      {parents.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    {parentsLoading && <div className="absolute right-3 top-1/2 -translate-y-1/2"><Loader2 className="animate-spin text-gray-400" size={18} /></div>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục con</label>
                  <div className="relative">
                    <select
                      name="subcategory_id"
                      value={base.subcategory_id ?? ''}
                      onChange={handleBaseChange}
                      disabled={isUploading || subcatsLoading || !base.parent_id}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">{base.parent_id ? '— Chọn danh mục con —' : 'Hãy chọn danh mục cha trước'}</option>
                      {subcats.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    {subcatsLoading && <div className="absolute right-3 top-1/2 -translate-y-1/2"><Loader2 className="animate-spin text-gray-400" size={18} /></div>}
                  </div>
                </div>
              </div>

              {/* Title & Slug (VI) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm (VI) *</label>
                  <input
                    name="title"
                    value={base.title}
                    onChange={handleBaseChange}
                    placeholder="Nhập tên sản phẩm"
                    required
                    disabled={isUploading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>

                {isEditing && (
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Slug (VI)</label>
                      <button
                        type="button"
                        onClick={generateSlugFromVITitle}
                        disabled={isUploading}
                        className="text-sm inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
                        title="Sinh slug từ tên (VI)"
                      >
                        <Wand2 size={16} /> Tạo từ tên
                      </button>
                    </div>
                    <input
                      name="slug"
                      value={base.slug}
                      onChange={handleBaseChange}
                      onBlur={handleSlugBlurVI}
                      placeholder="vd: ao-thun-basic"
                      disabled={isUploading}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 disabled:bg-gray-100 ${slugErrorVI ? 'border-red-400 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-500'}`}
                    />
                    {slugErrorVI ? (
                      <p className="text-sm text-red-600 mt-1">{slugErrorVI}</p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">
                        URL: <span className="font-mono">{siteURL}/products/{base.slug || '<slug>'}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Description (VI) */}
>>>>>>> feature/lead
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn (VI)</label>
                <textarea
                  name="description"
                  value={base.description}
                  onChange={handleBaseChange}
                  rows={3}
                  placeholder="Mô tả ngắn"
                  disabled={isUploading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

<<<<<<< HEAD
=======
              {/* Content (VI) */}
>>>>>>> feature/lead
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung chi tiết (VI) *</label>
                </div>
                <EditorMd
                  ref={editorVIRef}
                  value={base.content}
                  height={500}
                  onChangeMarkdown={(md) => setBase((f) => ({ ...f, content: md }))}
                  onReady={() => editorVIRef.current?.refresh?.()}
                />
              </div>

<<<<<<< HEAD
=======
              {/* Image */}
>>>>>>> feature/lead
              <ImagePicker
                imagePreview={imagePreview}
                setImagePreview={setImagePreview}
                setImageFile={setImageFile}
                setBase={setBase}
                isUploading={isUploading}
              />
            </div>
          )}

<<<<<<< HEAD
          {openLocales
            .filter((lc) => lc !== 'vi')
            .map(
              (lc) =>
                activeTab === lc && (
                  <div key={lc} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title ({lc.toUpperCase()})
                        </label>
                        <input
                          value={translations[lc]?.title || ''}
                          onChange={(e) => handleTrChange(lc, 'title', e.target.value)}
                          placeholder={`Product title (${lc.toUpperCase()})`}
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
                            onClick={() => generateSlugFromLCTitle(lc)}
                            disabled={isUploading}
                            className="text-sm inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
                            title="Sinh slug từ title"
                          >
                            <Wand2 size={16} /> Tạo từ tên
                          </button>
                        </div>
                        <input
                          value={translations[lc]?.slug || ''}
                          onChange={(e) => handleTrChange(lc, 'slug', e.target.value)}
                          onBlur={() => handleSlugBlurLC(lc)}
                          placeholder={`vd: basic-tee-${lc}`}
                          disabled={isUploading}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 disabled:bg-gray-100 ${slugErrorByLC[lc] ? 'border-red-400 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-500'
                            }`}
                        />
                        {slugErrorByLC[lc] ? (
                          <p className="text-sm text-red-600 mt-1">{slugErrorByLC[lc]}</p>
                        ) : (
                          <p className="text-xs text-gray-500 mt-1">
                            Lưu vào <span className="font-mono">product_translations</span> ({lc.toUpperCase()}).
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mô tả ngắn ({lc.toUpperCase()})
                      </label>
                      <textarea
                        value={translations[lc]?.short_description || ''}
                        onChange={(e) => handleTrChange(lc, 'short_description', e.target.value)}
                        rows={3}
                        placeholder={`Short description (${lc.toUpperCase()})`}
                        disabled={isUploading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nội dung ({lc.toUpperCase()})
                        </label>
                        <button
                          type="button"
                          onClick={() => translateContentFromVI(lc)}
                          disabled={isUploading || !base.content}
                          className="text-sm inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
                          title="Dịch từ nội dung VI"
                        >
                          <Languages size={16} /> Dịch nội dung từ VI
                        </button>
                      </div>
                      <EditorMd
                        ref={(r) => (editorRefs.current[lc] = r)}
                        value={translations[lc]?.content || ''}
                        height={420}
                        onChangeMarkdown={(md) => handleTrChange(lc, 'content', md)}
                        onReady={() => editorRefs.current[lc]?.refresh?.()}
                      />
                    </div>
                  </div>
                )
            )}
=======
          {/* Các tab i18n khác */}
          {openLocales.filter(lc => lc !== 'vi').map(lc =>
            activeTab === lc && (
              <div key={lc} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title ({lc.toUpperCase()})</label>
                    <input
                      value={translations[lc]?.title || ''}
                      onChange={(e) => handleTrChange(lc, 'title', e.target.value)}
                      placeholder={`Product title (${lc.toUpperCase()})`}
                      disabled={isUploading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn ({lc.toUpperCase()})</label>
                    <textarea
                      value={translations[lc]?.description || ''}
                      onChange={(e) => handleTrChange(lc, 'description', e.target.value)}
                      rows={3}
                      placeholder={`Short description (${lc.toUpperCase()})`}
                      disabled={isUploading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung ({lc.toUpperCase()})</label>
                    <button
                      type="button"
                      onClick={() => translateContentFromVI(lc)}
                      disabled={isUploading || !base.content}
                      className="text-sm inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
                      title="Dịch nội dung từ VI"
                    >
                      <Languages size={16} /> Dịch nội dung từ VI
                    </button>
                  </div>
                  <EditorMd
                    ref={(r) => (editorRefs.current[lc] = r)}
                    value={translations[lc]?.content || ''}
                    height={420}
                    onChangeMarkdown={(md) => handleTrChange(lc, 'content', md)}
                    onReady={() => editorRefs.current[lc]?.refresh?.()}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Lưu vào <span className="font-mono">products_translations</span> ({lc.toUpperCase()}).
                  </p>
                </div>
              </div>
            )
          )}
>>>>>>> feature/lead

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUploading && <Loader2 className="animate-spin" size={16} />}
              {isEditing ? 'Cập nhật' : 'Thêm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

function LocaleTabs({ openLocales, activeTab, setActiveTab, addLocale, removeLocale }) {
<<<<<<< HEAD
  const canAdd = ALL_LOCALES.filter((lc) => !openLocales.includes(lc));
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {openLocales.map((lc) => (
=======
  const canAdd = ALL_LOCALES.filter(lc => !openLocales.includes(lc));
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {openLocales.map(lc => (
>>>>>>> feature/lead
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
<<<<<<< HEAD
              {canAdd.map((lc) => (
=======
              {canAdd.map(lc => (
>>>>>>> feature/lead
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

function ImagePicker({ imagePreview, setImagePreview, setImageFile, setBase, isUploading }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh sản phẩm</label>
      {imagePreview && (
        <div className="mb-3 relative inline-block">
          <img src={imagePreview} alt="Preview" className="w-40 h-40 object-cover rounded-md border" />
          <button
            type="button"
            onClick={() => {
              setImageFile(null);
              setImagePreview('');
<<<<<<< HEAD
              setBase((prev) => ({ ...prev, image_url: '' }));
=======
              setBase(prev => ({ ...prev, image_url: '' }));
>>>>>>> feature/lead
            }}
            disabled={isUploading}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 disabled:bg-gray-400"
          >
            <X size={12} />
          </button>
        </div>
      )}

      <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:border-blue-400 transition-colors">
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
          id="product-image-upload"
        />
        <label
          htmlFor="product-image-upload"
          className={`cursor-pointer flex flex-col items-center space-y-2 ${isUploading ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          {isUploading ? <Loader2 className="animate-spin text-blue-500" size={24} /> : <Upload className="text-gray-400" size={24} />}
          <span className="text-sm text-gray-600">{isUploading ? 'Đang upload...' : 'Chọn ảnh từ máy tính'}</span>
          <span className="text-xs text-gray-400">PNG, JPG, GIF tối đa 5MB</span>
        </label>
      </div>
    </div>
  );
}

<<<<<<< HEAD
export default ProductFormModal;
=======
export default ProductFormModal;
>>>>>>> feature/lead
