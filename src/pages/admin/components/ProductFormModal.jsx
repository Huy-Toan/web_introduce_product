// src/components/ProductFormModal.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Upload, Loader2, Wand2, Plus, Sparkles, Languages } from 'lucide-react';
import EditorMd from './EditorMd';
import R2FolderImportButton from './R2FolderImportButton';
// Tinh chỉnh import: chờ dịch & retry
const IMPORT_TUNE = {
  wait_ms: 600,
  tries: 6,
  delay0: 400,
  backoff: 1.6,
  mode: 'strict',
  require_locales: 'en',
};

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
    title: 'Tên sản phẩm',
    title_ph: 'Nhập tên sản phẩm',
    description: 'Mô tả ngắn',
    description_ph: 'Mô tả ngắn',
    content: 'Nội dung chi tiết',
    content_ph: 'Nhập nội dung chi tiết',
    autoTranslate: 'Tự dịch từ VI',
    subcat: 'Danh mục con',
    translateContentBtn: 'Dịch nội dung từ VI',
    slug: 'Slug',
    slug_ph: 'vd: ao-thun-basic',
  },
  en: {
    title: 'Title',
    title_ph: 'Enter product title',
    description: 'Description',
    description_ph: 'Short description',
    content: 'Content',
    content_ph: 'Enter detailed content',
    autoTranslate: 'Auto-translate from VI',
    subcat: 'Subcategory',
    translateContentBtn: 'Translate content from VI',
    slug: 'Slug',
    slug_ph: 'e.g. basic-tee',
  },
  ja: {
    title: 'タイトル',
    title_ph: '商品名を入力',
    description: '説明',
    description_ph: '短い説明',
    content: 'コンテンツ',
    content_ph: '詳細コンテンツを入力',
    autoTranslate: 'VI から自動翻訳',
    subcat: 'サブカテゴリ',
    translateContentBtn: 'VI から内容を翻訳',
    slug: 'スラッグ',
    slug_ph: '例: basic-tee',
  },
  ko: {
    title: '제목',
    title_ph: '제품 이름을 입력하세요',
    description: '설명',
    description_ph: '짧은 설명',
    content: '내용',
    content_ph: '상세 내용을 입력하세요',
    autoTranslate: '베트남어에서 자동 번역',
    subcat: '하위 카테고리',
    translateContentBtn: 'VI에서 내용 번역',
    slug: '슬러그',
    slug_ph: '예: basic-tee',
  },
  zh: {
    title: '标题',
    title_ph: '输入产品标题',
    description: '描述',
    description_ph: '简短描述',
    content: '内容',
    content_ph: '输入详细内容',
    autoTranslate: '从越南语自动翻译',
    subcat: '子分类',
    translateContentBtn: '从越南语翻译内容',
    slug: '短链接',
    slug_ph: '例如: basic-tee',
  },
  fr: {
    title: 'Titre',
    title_ph: 'Saisir le titre du produit',
    description: 'Description',
    description_ph: 'Courte description',
    content: 'Contenu',
    content_ph: 'Saisir le contenu détaillé',
    autoTranslate: 'Traduire automatiquement depuis le VI',
    subcat: 'Sous-catégorie',
    translateContentBtn: 'Traduire le contenu depuis le VI',
    slug: 'Slug',
    slug_ph: 'ex. basic-tee',
  },
  de: {
    title: 'Titel',
    title_ph: 'Produkttitel eingeben',
    description: 'Beschreibung',
    description_ph: 'Kurze Beschreibung',
    content: 'Inhalt',
    content_ph: 'Detaillierten Inhalt eingeben',
    autoTranslate: 'Automatisch aus VI übersetzen',
    subcat: 'Unterkategorie',
    translateContentBtn: 'Inhalt aus VI übersetzen',
    slug: 'Slug',
    slug_ph: 'z. B. basic-tee',
  },
};
const L = (lc, key) => LABELS[lc]?.[key] ?? LABELS.en[key] ?? key;

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
      } catch { /* noop */ }
    }
    out.push(prefix ? prefix + translated : translated);
  }
  return out.join('\n');
}

const ProductFormModal = ({ isOpen, onClose, onSubmit, initialData = {} }) => {
  const isEditing = Boolean(initialData?.id);
  const [isR2Importing, setIsR2Importing] = useState(false);

  // Base (VI)
  const [base, setBase] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
    image_url: '',
    subcategory_id: null,
  });

  // Translations (kèm slug)
  const [translations, setTranslations] = useState(
    /** @type {Record<string,{title:string,slug?:string,description:string,content:string}>} */({})
  );
  const [touched, setTouched] = useState(
    /** @type {Record<string,{title?:boolean,slug?:boolean,description?:boolean,content?:boolean}>} */({})
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
  const lastSourceTitle = useRef('');
  const lastSourceDesc = useRef('');
  const lastSourceContent = useRef('');

  // Import Excel state
  const [isImporting, setIsImporting] = useState(false);
  const fileImportRef = useRef(null);

  // Subcategories for dropdown
  const [subcats, setSubcats] = useState([]);
  const [subcatsLoading, setSubcatsLoading] = useState(false);

  // Editors
  const editorVIRef = useRef(null);
  const editorRefs = useRef({});

  // Fetch subcategories
  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        setSubcatsLoading(true);
        const r = await fetch(`/api/sub_categories?locale=vi`);
        const j = await r.json();
        setSubcats(j?.subcategories || []);
      } catch {
        setSubcats([]);
      } finally {
        setSubcatsLoading(false);
      }
    })();
  }, [isOpen]);

  // Load initialData
  useEffect(() => {
    if (!isOpen) return;

    const viDesc = initialData.description ?? initialData?.translations?.vi?.description ?? '';
    const subFromData = typeof initialData.subcategory_id === 'number' ? initialData.subcategory_id : null;

    setBase({
      title: initialData.title || '',
      slug: initialData.slug || '',
      description: viDesc,
      content: initialData.content || '',
      image_url: initialData.image_url || '',
      subcategory_id: subFromData,
    });

    setImagePreview(initialData.image_url || '');
    setActiveTab('vi');
    setSlugErrorVI('');
    setSlugErrorsTr({});
    lastSourceTitle.current = initialData.title || '';
    lastSourceDesc.current = viDesc;

    const initTr = { ...(initialData.translations || {}) };
    delete initTr.vi;
    setTranslations(
      Object.fromEntries(
        Object.entries(initTr).map(([lc, v]) => [
          lc,
          {
            title: v?.title || '',
            slug: v?.slug || '',
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

  // Load translations if editing
  useEffect(() => {
    const loadTr = async () => {
      if (!isOpen || !initialData?.id) return;
      try {
        const r = await fetch(`/api/products/${initialData.id}/translations`);
        if (!r.ok) return;
        const j = await r.json();
        if (j?.translations && typeof j.translations === 'object') {
          const merged = {};
          for (const [lc, v] of Object.entries(j.translations)) {
            if (lc === 'vi') continue;
            merged[lc] = {
              title: v?.title || '',
              slug: v?.slug || '',
              description: v?.description || '',
              content: v?.content || '',
            };
          }
          setTranslations(prev => ({ ...merged, ...prev }));
          setOpenLocales(prev => Array.from(new Set(['vi', 'en', ...Object.keys(merged), ...prev])));
        }
      } catch { /* noop */ }
    };
    loadTr();
  }, [isOpen, initialData?.id]);

  // Lock editors when uploading or importing
  useEffect(() => {
    const lock = (isUploading || isImporting || isR2Importing) ? 'nocursor' : false;
    editorVIRef.current?.cm?.setOption('readOnly', lock);
    Object.values(editorRefs.current || {}).forEach((ref) =>
      ref?.cm?.setOption('readOnly', lock)
    );
  }, [isUploading, isImporting, isR2Importing]);

  // Auto-translate title + description from VI (+ tự sinh slug nếu trống/chưa touch)
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

      const targets = openLocales.filter(lc => lc !== 'vi');
      for (const lc of targets) {
        const touchedLC = touched[lc] || {};
        let newTitle = '';
        let newDesc = '';

        try {
          if (needTitle && !touchedLC.title) {
            const rt = await fetch('/api/translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: srcTitle, source: 'vi', target: lc }),
            });
            if (rt.ok) newTitle = (await rt.json())?.translated || '';
          }
          if (needDesc && !touchedLC.description) {
            const rd = await fetch('/api/translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: srcDesc, source: 'vi', target: lc }),
            });
            if (rd.ok) newDesc = (await rd.json())?.translated || '';
          }
        } catch { /* noop */ }

        setTranslations(prev => {
          const curr = prev[lc] || { title: '', slug: '', description: '', content: '' };
          const nextTitle = !touchedLC.title && newTitle ? newTitle : curr.title;
          const nextDesc = !touchedLC.description && newDesc ? newDesc : curr.description;
          // chỉ tự sinh slug nếu đang trống và chưa touch slug
          const currSlug = (curr.slug || '').trim();
          const nextSlug = (currSlug || touchedLC.slug) ? currSlug : (nextTitle ? slugify(nextTitle) : '');
          return { ...prev, [lc]: { ...curr, title: nextTitle, description: nextDesc, slug: nextSlug } };
        });
      }
    }, 400);

    return () => clearTimeout(debounceTimer.current);
  }, [base.title, base.description, autoTranslate, openLocales, touched]);
  // Auto-translate CONTENT (Markdown) from VI -> other locales
  useEffect(() => {
    if (!autoTranslate) return;

    const srcContent = (base.content || '').trim();
    if (!srcContent) return;

    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      // Nếu content không đổi thì bỏ qua
      if (lastSourceContent.current === srcContent) return;
      lastSourceContent.current = srcContent;

      const targets = openLocales.filter((lc) => lc !== 'vi');

      for (const lc of targets) {
        const touchedLC = touched[lc] || {};
        // Nếu user đã sửa content ở locale đó rồi => không tự động ghi đè
        if (touchedLC.content) continue;

        // Nếu đã có content sẵn, và bạn không muốn override => có thể skip:
        // if ((translations[lc]?.content || '').trim()) continue;

        try {
          const translatedMd = await translateMarkdown(srcContent, 'vi', lc);
          if (!translatedMd) continue;

          setTranslations((prev) => ({
            ...prev,
            [lc]: {
              ...(prev[lc] || { title: '', slug: '', description: '', content: '' }),
              content: translatedMd,
            },
          }));
        } catch {
          // bỏ qua lỗi 1 locale, tiếp tục locale khác
        }
      }
    }, 600); // tăng debounce lên một chút để giảm số lần gọi API khi đang gõ

    return () => clearTimeout(debounceTimer.current);
  }, [base.content, autoTranslate, openLocales, touched]);

  // Derived
  const selectedSub = useMemo(
    () => subcats.find(s => String(s.id) === String(base.subcategory_id)),
    [subcats, base.subcategory_id]
  );

  // Handlers
  const handleBaseChange = (e) => {
    const { name, value } = e.target;
    if (name === 'subcategory_id') {
      setBase(prev => ({ ...prev, subcategory_id: value ? Number(value) : null }));
      return;
    }
    setBase(prev => ({ ...prev, [name]: value }));
    if (name === 'slug') setSlugErrorVI('');
  };

  const handleTrChange = (lc, key, value) => {
    setTranslations(prev => ({
      ...prev,
      [lc]: { ...(prev[lc] || { title: '', slug: '', description: '', content: '' }), [key]: value }
    }));
    setTouched(prev => ({ ...prev, [lc]: { ...(prev[lc] || {}), [key]: true } }));
    if (key === 'slug') setSlugErrorsTr(prev => ({ ...prev, [lc]: '' }));
  };

  const handleSlugBlurVI = () => {
    if (!isEditing) return;
    const normalized = slugify(base.slug || '');
    setBase(prev => ({ ...prev, slug: normalized }));
    if (normalized && !isValidSlug(normalized)) {
      setSlugErrorVI('Slug chỉ gồm a-z, 0-9 và dấu gạch nối (-), không bắt đầu/kết thúc bằng -.');
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

  const generateSlugFromVITitle = () => {
    const s = slugify(base.title || '');
    setBase(prev => ({ ...prev, slug: s }));
    setSlugErrorVI(s && !isValidSlug(s) ? 'Slug không hợp lệ.' : '');
  };
  const generateSlugFromTRTitle = (lc) => {
    const s = slugify(translations[lc]?.title || '');
    setTranslations(prev => ({ ...prev, [lc]: { ...(prev[lc] || {}), slug: s } }));
    setSlugErrorsTr(prev => ({ ...prev, [lc]: s && !isValidSlug(s) ? 'Slug không hợp lệ.' : '' }));
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await fetch('/api/upload-image', { method: 'POST', body: formData });
    if (!response.ok) throw new Error('Upload failed');
    const data = await response.json();
    return data.url;
  };

  const translateContentFromVI = async (lc) => {
    const src = base.content?.trim() || '';
    if (!src) return;
    try {
      const translated = await translateMarkdown(src, 'vi', lc);
      if (!translated) return;
      handleTrChange(lc, 'content', translated);
    } catch { /* noop */ }
  };

  // ===== Import Excel =====
  async function handleImportSelected(e) {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!/\.(xlsx|xls|csv)$/i.test(f.name)) {
      alert('Chỉ hỗ trợ file .xlsx, .xls, .csv');
      e.target.value = '';
      return;
    }

    const ok = confirm(
      'Import sản phẩm từ file Excel.\n' +
      '- Cột yêu cầu: title, content, subcategory_name (hoặc subcategory).\n' +
      '- Tùy chọn: description, image_url, slug.\n' +
      'Tiếp tục?'
    );

    if (!ok) { e.target.value = ''; return; }

    setIsImporting(true);
    try {
      const fd = new FormData();
      fd.append('file', f);

      const q = new URLSearchParams({
        auto: '1',
        targets: 'en',
        source: 'vi',
        wait_ms: String(IMPORT_TUNE.wait_ms),
        tries: String(IMPORT_TUNE.tries),
        delay0: String(IMPORT_TUNE.delay0),
        backoff: String(IMPORT_TUNE.backoff),
        mode: String(IMPORT_TUNE.mode || 'soft'),
        require_locales: String(IMPORT_TUNE.require_locales || 'en'),
      });
      const res = await fetch(`/api/products/import?${q.toString()}`, { method: 'POST', body: fd });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.ok === false) {
        throw new Error(data.error || 'Import thất bại');
      }

      alert(
        `Import thành công!\n` +
        `- Tạo mới: ${data.created ?? 0}\n` +
        `- Cập nhật: ${data.updated ?? 0}\n` +
        `- Bỏ qua: ${data.skipped ?? 0}`
      );

      // Phát sự kiện để trang danh sách reload (nếu bạn lắng nghe ở ngoài)
      window.dispatchEvent(new CustomEvent('products:imported'));

      // Nếu muốn đóng modal sau import:
      // onClose();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Có lỗi khi import!');
    } finally {
      setIsImporting(false);
      e.target.value = '';
    }
  }

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!base.title?.trim()) { alert('Vui lòng nhập Tên sản phẩm'); return; }
    if (!base.content?.trim()) { alert('Vui lòng nhập Nội dung sản phẩm'); return; }

    if (isEditing) {
      if (!base.slug) { setSlugErrorVI('Vui lòng nhập slug hoặc dùng “Tạo từ tên”.'); return; }
      if (!isValidSlug(base.slug)) { setSlugErrorVI('Slug không hợp lệ.'); return; }
    }
    for (const lc of Object.keys(slugErrorsTr)) {
      if (slugErrorsTr[lc]) { alert(`Slug (${lc.toUpperCase()}) không hợp lệ.`); return; }
    }

    setIsUploading(true);
    try {
      let image_url = base.image_url;
      if (imageFile) image_url = await uploadImage(imageFile);

      let payloadBase = {
        title: base.title,
        description: base.description,
        content: base.content,
        image_url,
        subcategory_id: base.subcategory_id ?? null,
      };
      if (isEditing) payloadBase.slug = slugify(base.slug || '');

      if (!isEditing && payloadBase.slug) {
        const { slug, ...rest } = payloadBase;
        payloadBase = rest; // tạo mới: để BE tự sinh slug nếu muốn
      }

      // translations payload: { lc: { title?, slug?, description?, content? } }
      const cleanTranslations = {};
      for (const [lc, v] of Object.entries(translations)) {
        const hasAny = (v?.title || v?.description || v?.content || v?.slug);
        if (!hasAny) continue;

        const tSlugRaw = (v?.slug || '').trim();
        const tSlug = tSlugRaw ? slugify(tSlugRaw) : '';

        const entry = {};
        if (v.title) entry.title = v.title;
        if (v.description) entry.description = v.description;
        if (v.content) entry.content = v.content;
        if (tSlug && isValidSlug(tSlug)) entry.slug = tSlug;

        cleanTranslations[lc] = entry;
      }

      const finalPayload = {
        ...payloadBase,
        ...(Object.keys(cleanTranslations).length ? { translations: cleanTranslations } : {}),
      };
      if (initialData.id) finalPayload.id = initialData.id;

      await onSubmit(finalPayload);
      onClose();

      setBase({ title: '', slug: '', description: '', content: '', image_url: '', subcategory_id: null });
      setTranslations({});
      setTouched({});
      setOpenLocales(['vi', 'en']);
      setActiveTab('vi');
      setImageFile(null);
      setImagePreview('');
      setSlugErrorVI('');
      setSlugErrorsTr({});
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
                disabled={isUploading || isImporting}
              />
              <span className="inline-flex items-center gap-1">
                <Sparkles size={16} /> {L(activeTab, 'autoTranslate')}
              </span>
            </label>

            {/* Nút Import Excel */}
            <button
              type="button"
              onClick={() => fileImportRef.current?.click()}
              disabled={isUploading || isImporting}
              className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
              title="Import sản phẩm từ Excel"
            >

              <Upload size={16} />
              {isImporting ? 'Đang import...' : 'Import Excel'}
            </button>
            <input
              ref={fileImportRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              hidden
              onChange={handleImportSelected}
            />

            <R2FolderImportButton
              apiUrl="/api/upload-image"
              folder=""
              concurrent={3}
              className="inline-block"
              onBusyChange={setIsR2Importing}       // NEW: nhận busy từ child
            />

            <button onClick={onClose} className="cursor-pointer text-gray-400 hover:text-gray-600" disabled={isUploading || isImporting}>
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-8">
          <LocaleTabs
            openLocales={openLocales}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            addLocale={(lc) => {
              setOpenLocales(prev => prev.includes(lc) ? prev : [...prev, lc]);
              setTranslations(prev => prev[lc] ? prev : { ...prev, [lc]: { title: '', slug: '', description: '', content: '' } });
              setActiveTab(lc);
            }}
            removeLocale={(lc) => {
              setOpenLocales(prev => prev.filter(x => x !== lc));
              setTranslations(prev => { const cp = { ...prev }; delete cp[lc]; return cp; });
              setTouched(prev => { const cp = { ...prev }; delete cp[lc]; return cp; });
              setSlugErrorsTr(prev => { const cp = { ...prev }; delete cp[lc]; return cp; });
              setActiveTab('vi');
            }}
          />

          {activeTab === 'vi' && (
            <div className="space-y-6">
              {/* Subcategory */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{L('vi', 'subcat')}</label>
                <div className="relative">
                  <select
                    name="subcategory_id"
                    value={base.subcategory_id ?? ''}
                    onChange={handleBaseChange}
                    disabled={isUploading || subcatsLoading || isImporting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">— Không chọn —</option>
                    {subcats.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  {subcatsLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="animate-spin text-gray-400" size={18} />
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Slug (VI) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{L('vi', 'title')} (VI) *</label>
                  <input
                    name="title"
                    value={base.title}
                    onChange={handleBaseChange}
                    placeholder={L('vi', 'title_ph')}
                    required
                    disabled={isUploading || isImporting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>

                {isEditing && (
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700 mb-1">{L('vi', 'slug')} (VI)</label>
                      <button
                        type="button"
                        onClick={generateSlugFromVITitle}
                        disabled={isUploading || isImporting}
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
                      placeholder={L('vi', 'slug_ph')}
                      disabled={isUploading || isImporting}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{L('vi', 'description')} (VI)</label>
                <textarea
                  name="description"
                  value={base.description}
                  onChange={handleBaseChange}
                  rows={3}
                  placeholder={L('vi', 'description_ph')}
                  disabled={isUploading || isImporting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              {/* Content (VI) */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{L('vi', 'content')} (VI) *</label>
                </div>
                <EditorMd
                  ref={editorVIRef}
                  value={base.content}
                  height={500}
                  onChangeMarkdown={(md) => setBase((f) => ({ ...f, content: md }))}
                  onReady={() => editorVIRef.current?.refresh?.()}
                />
              </div>

              {/* Image */}
              <ImagePicker
                imagePreview={imagePreview}
                setImagePreview={setImagePreview}
                setImageFile={setImageFile}
                setBase={setBase}
                isUploading={isUploading || isImporting}
              />
            </div>
          )}

          {/* i18n tabs */}
          {openLocales.filter(lc => lc !== 'vi').map(lc =>
            activeTab === lc && (
              <div key={lc} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {L(lc, 'title')} ({lc.toUpperCase()})
                    </label>
                    <input
                      value={translations[lc]?.title || ''}
                      onChange={(e) => handleTrChange(lc, 'title', e.target.value)}
                      placeholder={`${L(lc, 'title_ph')}`}
                      disabled={isUploading || isImporting}
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
                        onClick={() => generateSlugFromTRTitle(lc)}
                        disabled={isUploading || isImporting}
                        className="text-sm inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
                        title="Sinh slug từ tiêu đề"
                      >
                        <Wand2 size={16} /> Tạo từ tên
                      </button>
                    </div>
                    <input
                      value={translations[lc]?.slug || ''}
                      onChange={(e) => handleTrChange(lc, 'slug', e.target.value)}
                      onBlur={() => handleSlugBlurTR(lc)}
                      placeholder={LABELS[lc]?.slug_ph || LABELS.vi.slug_ph}
                      disabled={isUploading || isImporting}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 disabled:bg-gray-100 ${slugErrorsTr[lc] ? 'border-red-400 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-500'}`}
                    />
                    {slugErrorsTr[lc] ? (
                      <p className="text-sm text-red-600 mt-1">{slugErrorsTr[lc]}</p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">
                        URL: <span className="font-mono">
                          {(siteURL)}/{lc}/products/{translations[lc]?.slug || '<slug>'}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {L(lc, 'description')} ({lc.toUpperCase()})
                  </label>
                  <textarea
                    value={translations[lc]?.description || ''}
                    onChange={(e) => handleTrChange(lc, 'description', e.target.value)}
                    rows={3}
                    placeholder={`${L(lc, 'description_ph')}`}
                    disabled={isUploading || isImporting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>

                {/* Content */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {L(lc, 'content')} ({lc.toUpperCase()})
                    </label>
                    <button
                      type="button"
                      onClick={() => translateContentFromVI(lc)}
                      disabled={isUploading || isImporting || !base.content}
                      className="text-sm inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
                      title={L(lc, 'translateContentBtn')}
                    >
                      <Languages size={16} /> {L(lc, 'translateContentBtn')}
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

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading || isImporting}
              className="cursor-pointer px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isUploading || isImporting}
              className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {(isUploading || isImporting) && <Loader2 className="animate-spin" size={16} />}
              {isEditing ? 'Cập nhật' : 'Thêm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

function LocaleTabs({ openLocales, activeTab, setActiveTab, addLocale, removeLocale }) {
  const canAdd = ALL_LOCALES.filter(lc => !openLocales.includes(lc));
  return (
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
              onClick={() => removeLocale(lc)}
              className="cursor-pointer text-xs text-red-600 mr-2"
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
              {canAdd.map(lc => (
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
              setBase(prev => ({ ...prev, image_url: '' }));
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

export default ProductFormModal;
