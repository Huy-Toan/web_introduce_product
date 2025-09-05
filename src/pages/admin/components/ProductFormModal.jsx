// src/components/ProductFormModal.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Upload, Loader2, Wand2, Plus, Sparkles, Languages } from 'lucide-react';
import EditorMd from './EditorMd';
import R2FolderImportButton from './R2FolderImportButton';

// ====== Cấu hình import auto-translate ======
const IMPORT_TUNE = {
  wait_ms: 600,
  tries: 6,
  delay0: 400,
  backoff: 1.6,
  mode: 'strict',
  require_locales: 'en',
};

// ====== Utils ======
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

// ==== R2 absolute ⇄ key helpers ====
const PUBLIC_R2_URL =
  (import.meta.env?.VITE_PUBLIC_R2_URL || '').replace(/\/+$/, '');

const isAbsoluteHttp = (u = '') => /^https?:\/\//i.test(u);

const toR2Key = (u = '') => {
  if (!u) return '';
  if (u.startsWith('data:')) return u; // preview tạm, không gửi lên
  // 1) Nếu trùng prefix R2 đã biết, cắt prefix
  if (PUBLIC_R2_URL && u.startsWith(PUBLIC_R2_URL)) {
    return u.slice(PUBLIC_R2_URL.length).replace(/^\/+/, '');
  }
  // 2) Nếu là URL tuyệt đối khác, lấy pathname làm key
  try {
    const url = new URL(u);
    return url.pathname.replace(/^\/+/, '');
  } catch {
    // 3) Đã là key tương đối
    return u;
  }
};
const buildR2Url = (key = '') => {
  if (!key) return '';
  if (isAbsoluteHttp(key)) return key;
  return PUBLIC_R2_URL ? `${PUBLIC_R2_URL.replace(/\/+$/, '')}/${key.replace(/^\/+/, '')}` : key;
};

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

// ====== Chuẩn hoá/tiện ích cho gallery ======
function normalizeImages(input) {
  let arr = [];
  if (Array.isArray(input)) arr = input;
  else if (typeof input === 'string') {
    try { const j = JSON.parse(input); arr = Array.isArray(j) ? j : []; }
    catch { arr = input.split(/[;,]/).map(s => s.trim()).filter(Boolean); }
  }

  const out = arr
    .map((it, i) => {
      if (!it) return null;
      if (typeof it === 'string') return { url: it, is_primary: i === 0 ? 1 : 0, sort_order: i };
      if (typeof it === 'object' && it.url) {
        return {
          url: String(it.url).trim(),
          is_primary: it.is_primary ? 1 : 0,
          sort_order: Number.isFinite(it.sort_order) ? it.sort_order : i
        };
      }
      return null;
    })
    .filter(Boolean)
    .sort((a, b) => (a?.sort_order ?? 0) - (b?.sort_order ?? 0));

  if (out.length) {
    const hasPrimary = out.some(x => x.is_primary === 1);
    if (!hasPrimary) out[0].is_primary = 1;
    out.forEach((x, idx) => (x.sort_order = idx));
  }
  return out;
}

function makeImagesJson(arr) {
  const clean = (arr || [])
    .filter(x => x?.url)
    .map((x, i) => ({
      url: x.url,
      is_primary: x.is_primary ? 1 : 0,
      sort_order: i
    }));
  return JSON.stringify(clean);
}

function pickCover(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return '';
  const p = arr.find(x => x.is_primary === 1) || arr[0];
  return p?.url || '';
}

// ====== Component chính ======
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

  // ====== Gallery ảnh ======
  const [images, setImages] = useState([]);            // [{url,is_primary,sort_order}]
  const [filesToUpload, setFilesToUpload] = useState([]); // File[]
  const [imagePreview, setImagePreview] = useState('');   // cover lớn

  // Khác
  const [isUploading, setIsUploading] = useState(false);
  const [slugErrorVI, setSlugErrorVI] = useState('');
  const [slugErrorsTr, setSlugErrorsTr] = useState(/** @type {Record<string,string>} */({}));
  const [autoTranslate, setAutoTranslate] = useState(true);
  const debounceTimer = useRef(null);
  const lastSourceTitle = useRef('');
  const lastSourceDesc = useRef('');
  const lastSourceContent = useRef('');

  // Import Excel
  const [isImporting, setIsImporting] = useState(false);
  const fileImportRef = useRef(null);

  // Subcategories
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

    // NẠP GALLERY: từ images (url tuyệt đối) -> hoặc images_json -> fallback image_url
    let initImages = [];
    if (Array.isArray(initialData.images) && initialData.images.length) {
      initImages = normalizeImages(initialData.images);
    } else if (initialData.images_json) {
      initImages = normalizeImages(initialData.images_json);
    } else if (initialData.image_url) {
      initImages = normalizeImages([initialData.image_url]);
    }
    setImages(initImages);
    setImagePreview(pickCover(initImages) || '');

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
    setTimeout(() => editorVIRef.current?.refresh?.(), 0);

    // reset batch upload
    setFilesToUpload([]);
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

  // Auto-translate title + description from VI
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
      if (lastSourceContent.current === srcContent) return;
      lastSourceContent.current = srcContent;

      const targets = openLocales.filter((lc) => lc !== 'vi');

      for (const lc of targets) {
        const touchedLC = touched[lc] || {};
        if (touchedLC.content) continue;

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
        } catch { /* noop */ }
      }
    }, 600);

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

  // Upload 1 ảnh -> upload-image (gốc) -> watermark (-wm) -> trả về key cuối cùng để lưu
  const uploadImage = async (file) => {
    // a) upload gốc
    const formData = new FormData();
    formData.append('image', file);

    const upRes = await fetch('/api/upload-image', { method: 'POST', body: formData });
    if (!upRes.ok) throw new Error('Upload failed');
    const up = await upRes.json();

    if (!up?.image_key) throw new Error('Upload: missing image_key');

    // b) watermark (dán logo từ public)
    //    Có thể tùy chỉnh: ?pos=tr&logoWidth=160&opacity=0.95
    let finalKey = up.image_key;
    try {
      const wmRes = await fetch('/api/watermark?pos=tr&logoWidth=160&opacity=0.95', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: up.image_key }),
      });
      const wm = await wmRes.json().catch(() => ({}));
      if (wmRes.ok && wm?.ok && wm?.key) {
        finalKey = wm.key; // dùng bản -wm
      } else {
        console.warn('Watermark skip/fail:', wm?.error || wm);
      }
    } catch (e) {
      console.warn('Watermark error:', e);
    }

    return {
      image_key: finalKey,               // <-- luôn trả về key cuối (ưu tiên -wm)
      previewUrl: buildR2Url(finalKey),  // để hiện thử nếu cần
    };
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
      '- Tùy chọn: description, images/images_json/image_url/slug.\n' +
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

      window.dispatchEvent(new CustomEvent('products:imported'));
    } catch (err) {
      console.error(err);
      alert(err.message || 'Có lỗi khi import!');
    } finally {
      setIsImporting(false);
      e.target.value = '';
    }
  }

  // ===== Submit =====
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
      // 1) Upload batch các file mới
      const uploadedKeys = [];
      for (const f of filesToUpload) {
        const up = await uploadImage(f);
        uploadedKeys.push(up.image_key);
      }

      // 2) Thay dataURL tạm bằng key thật (theo thứ tự đã chọn) & strip absolute URL -> key
      let keyIdx = 0;
      const mergedImages = images.map((x) => {
        const isData = String(x.url || '').startsWith('data:');
        const finalUrl = isData ? (uploadedKeys[keyIdx++] || '') : x.url;
        // Strip absolute URL -> R2 key để tránh dư tiền tố khi BE gắn prefix
        const urlAsKey = isAbsoluteHttp(finalUrl) ? toR2Key(finalUrl) : finalUrl;
        return { ...x, url: urlAsKey };
      }).filter(x => x.url);

      // 3) Chuẩn lại sort_order & cover
      const normalized = normalizeImages(mergedImages);
      const images_json_text = makeImagesJson(normalized);
      const coverKey = pickCover(normalized); // key/relative url

      // 4) Build payload
      let payloadBase = {
        title: base.title,
        description: base.description,
        content: base.content,
        subcategory_id: base.subcategory_id ?? null,
        images_json: JSON.parse(images_json_text), // gửi mảng để BE dễ xử lý
        image_url: coverKey || undefined,          // tương thích cũ
      };
      if (isEditing) payloadBase.slug = slugify(base.slug || '');

      if (!isEditing && payloadBase.slug) {
        const { slug, ...rest } = payloadBase;
        payloadBase = rest; // tạo mới: để BE tự sinh slug nếu muốn
      }

      // translations payload
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

      // reset
      setBase({ title: '', slug: '', description: '', content: '', image_url: '', subcategory_id: null });
      setTranslations({});
      setTouched({});
      setOpenLocales(['vi', 'en']);
      setActiveTab('vi');
      setImages([]);
      setFilesToUpload([]);
      setImagePreview('');
      setSlugErrorVI('');
      setSlugErrorsTr({});
      lastSourceTitle.current = '';
      lastSourceDesc.current = '';
      lastSourceContent.current = '';
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
              onBusyChange={setIsR2Importing}
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

              {/* Gallery ảnh (nhiều ảnh) */}
              <ImageGalleryPicker
                images={images}
                setImages={setImages}
                filesToUpload={filesToUpload}
                setFilesToUpload={setFilesToUpload}
                imagePreview={imagePreview}
                setImagePreview={setImagePreview}
                isBusy={isUploading || isImporting}
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

// ====== Tabs chọn locale ======
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

// ====== Picker gallery nhiều ảnh (có kéo-thả) ======
function ImageGalleryPicker({
  images, setImages,
  filesToUpload, setFilesToUpload,
  imagePreview, setImagePreview,
  isBusy
}) {
  const [isDragging, setIsDragging] = useState(false);

  const acceptFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const valid = files.filter(f => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024);
    if (valid.length !== files.length) {
      alert('Chỉ chọn ảnh hợp lệ và ≤ 5MB/ảnh.');
    }
    // Tạo preview tạm & đưa vào danh sách upload
    valid.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const tempUrl = String(evt.target?.result || '');
        setImages(prev => {
          const next = [...prev, { url: tempUrl, is_primary: prev.length ? 0 : 1, sort_order: prev.length }];
          if (!next.some(x => x.is_primary === 1) && next.length) next[0].is_primary = 1;
          next.forEach((x, i) => (x.sort_order = i));
          return next;
        });
        setImagePreview(prev => prev || tempUrl);
      };
      reader.readAsDataURL(f);
    });
    setFilesToUpload(prev => [...prev, ...valid]);
  };

  // Kéo-thả
  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isBusy) setIsDragging(true);
  };
  const onDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isBusy) setIsDragging(true);
  };
  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isBusy) return;
    const dt = e.dataTransfer;
    if (dt?.files?.length) acceptFiles(dt.files);
  };

  // Paste từ clipboard (tuỳ chọn)
  const onPaste = (e) => {
    if (isBusy) return;
    const items = e.clipboardData?.items || [];
    const files = [];
    for (const it of items) {
      if (it.kind === 'file') {
        const f = it.getAsFile();
        if (f) files.push(f);
      }
    }
    if (files.length) acceptFiles(files);
  };

  const setPrimary = (idx) => {
    setImages(prev => prev.map((x, i) => ({ ...x, is_primary: i === idx ? 1 : 0 })));
    setImagePreview(images[idx]?.url || '');
  };

  const move = (idx, dir) => {
    setImages(prev => {
      const next = [...prev];
      const to = idx + dir;
      if (to < 0 || to >= next.length) return prev;
      const [item] = next.splice(idx, 1);
      next.splice(to, 0, item);
      next.forEach((x, i) => (x.sort_order = i));
      return next;
    });
  };

  const removeAt = (idx) => {
    setImages(prev => {
      const next = prev.filter((_, i) => i !== idx);
      next.forEach((x, i) => (x.sort_order = i));
      if (next.length && !next.some(x => x.is_primary === 1)) next[0].is_primary = 1;
      if (!next.length) setImagePreview('');
      else if (next[0].is_primary === 1) setImagePreview(next[0].url);
      return next;
    });
    // Nếu muốn: có thể lọc filesToUpload tương ứng, nhưng vì preview tạm là data: khó map 1-1 ⇒ để BE bỏ qua data:
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh sản phẩm (nhiều ảnh)</label>

      {/* Cover lớn */}
      {imagePreview && (
        <div className="mb-3">
          <img src={imagePreview} alt="Cover" className="w-full max-h-72 object-cover rounded-md border" />
          <p className="text-xs text-gray-500 mt-1">Ảnh đại diện (cover)</p>
        </div>
      )}

      {/* Lưới ảnh */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-3">
        {images.map((it, idx) => (
          <div key={`${it.url}-${idx}`} className="relative border rounded p-2">
            <img src={it.url} alt={`img-${idx}`} className="w-full h-28 object-cover rounded" />
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" onClick={() => setPrimary(idx)} className="text-xs px-2 py-1 rounded bg-gray-100">
                {it.is_primary ? '✔ Đại diện' : 'Đặt làm đại diện'}
              </button>
              <button type="button" onClick={() => move(idx, -1)} className="text-xs px-2 py-1 rounded bg-gray-100">↑</button>
              <button type="button" onClick={() => move(idx, +1)} className="text-xs px-2 py-1 rounded bg-gray-100">↓</button>
              <button type="button" onClick={() => removeAt(idx)} className="text-xs px-2 py-1 rounded bg-red-100 text-red-700">Xoá</button>
            </div>
          </div>
        ))}
      </div>

      {/* Khu vực upload + kéo-thả + dán */}
      <div
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onPaste={onPaste}
        className={[
          "border-2 border-dashed rounded-md p-4 text-center transition-colors",
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400",
          isBusy ? "opacity-50 cursor-not-allowed" : ""
        ].join(" ")}
        title="Kéo thả ảnh vào đây, dán ảnh (Ctrl/Cmd+V) hoặc bấm để chọn"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') document.getElementById('product-images-upload')?.click(); }}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => acceptFiles(e.target.files)}
          disabled={isBusy}
          className="hidden"
          id="product-images-upload"
        />
        <label
          htmlFor="product-images-upload"
          className={`cursor-pointer flex flex-col items-center space-y-2 ${isBusy ? 'pointer-events-none' : ''}`}
        >
          {isBusy ? <Loader2 className="animate-spin text-blue-500" size={24} /> : <Upload className="text-gray-400" size={24} />}
          <span className="text-sm text-gray-600">
            {isBusy ? 'Đang xử lý...' : (isDragging ? 'Thả ảnh vào đây' : 'Chọn ảnh, hoặc kéo-thả / Ctrl+V để dán')}
          </span>
          <span className="text-xs text-gray-400">PNG, JPG, GIF ≤ 5MB/ảnh</span>
        </label>
      </div>
    </div>
  );
}

export default ProductFormModal;
