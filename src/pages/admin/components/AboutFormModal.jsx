import React, { useEffect, useRef, useState } from 'react';
import { X, Upload, Loader2, Plus, Languages, Sparkles } from 'lucide-react';
import EditorMd from './EditorMd';

const ALL_LOCALES = ['vi', 'en', 'ja', 'ko', 'zh', 'fr', 'de'];

/* ===== i18n labels ===== */
const LABELS = {
  vi: {
    header: (isEditing) => (isEditing ? 'Chỉnh sửa Giới thiệu (đa ngôn ngữ)' : 'Thêm Giới thiệu mới (đa ngôn ngữ)'),
    addLang: 'Thêm ngôn ngữ',
    autoTranslate: 'Tự dịch từ VI',
    title: (lc) => `Tiêu đề (${lc.toUpperCase()})`,
    title_ph: 'Nhập tiêu đề phần Giới thiệu',
    content: (lc) => `Nội dung (${lc.toUpperCase()})`,
    cover: 'Ảnh minh họa',
    pickImage: 'Chọn ảnh từ máy tính',
    uploading: 'Đang upload...',
    insertFromVI: 'Dịch từ VI',
    insertContentFromVI: 'Dịch nội dung từ VI',
    translating: 'Đang tự dịch sang các ngôn ngữ khác…',
    cancel: 'Hủy',
    add: 'Thêm',
    update: 'Cập nhật',
  },
  en: {
    header: (isEditing) => (isEditing ? 'Edit About (multi-language)' : 'Add About (multi-language)'),
    addLang: 'Add language',
    autoTranslate: 'Auto-translate from VI',
    title: (lc) => `Title (${lc.toUpperCase()})`,
    title_ph: 'Enter the About title',
    content: (lc) => `Content (${lc.toUpperCase()})`,
    cover: 'Cover image',
    pickImage: 'Choose an image',
    uploading: 'Uploading...',
    insertFromVI: 'Translate from VI',
    insertContentFromVI: 'Translate content from VI',
    translating: 'Auto-translating to other languages…',
    cancel: 'Cancel',
    add: 'Add',
    update: 'Update',
  },
  ja: {
    header: (e) => (e ? '概要を編集（多言語）' : '概要を追加（多言語）'),
    addLang: '言語を追加',
    autoTranslate: 'VI から自動翻訳',
    title: (lc) => `タイトル（${lc.toUpperCase()}）`,
    title_ph: '概要のタイトルを入力',
    content: (lc) => `本文（${lc.toUpperCase()}）`,
    cover: '画像',
    pickImage: '画像を選択',
    uploading: 'アップロード中...',
    insertFromVI: 'VI から翻訳',
    insertContentFromVI: '本文を VI から翻訳',
    translating: '他の言語に自動翻訳中…',
    cancel: 'キャンセル',
    add: '追加',
    update: '更新',
  },
  ko: {
    header: (e) => (e ? '소개 수정(다국어)' : '소개 추가(다국어)'),
    addLang: '언어 추가',
    autoTranslate: '베트남어에서 자동 번역',
    title: (lc) => `제목 (${lc.toUpperCase()})`,
    title_ph: '소개 제목을 입력',
    content: (lc) => `콘텐츠 (${lc.toUpperCase()})`,
    cover: '이미지',
    pickImage: '이미지 선택',
    uploading: '업로드 중...',
    insertFromVI: 'VI에서 번역',
    insertContentFromVI: '콘텐츠를 VI에서 번역',
    translating: '다른 언어로 자동 번역 중…',
    cancel: '취소',
    add: '추가',
    update: '업데이트',
  },
  zh: {
    header: (e) => (e ? '编辑关于我们（多语言）' : '新增关于我们（多语言）'),
    addLang: '添加语言',
    autoTranslate: '从越南语自动翻译',
    title: (lc) => `标题（${lc.toUpperCase()}）`,
    title_ph: '输入关于我们的标题',
    content: (lc) => `正文（${lc.toUpperCase()}）`, // <-- fixed extra brace
    cover: '封面图',
    pickImage: '选择图片',
    uploading: '上传中...',
    insertFromVI: '从 VI 翻译',
    insertContentFromVI: '从 VI 翻译正文',
    translating: '正在自动翻译到其他语言…',
    cancel: '取消',
    add: '新增',
    update: '更新',
  },
  fr: {
    header: (e) => (e ? 'Modifier À propos (multilingue)' : 'Ajouter À propos (multilingue)'),
    addLang: 'Ajouter une langue',
    autoTranslate: 'Traduire automatiquement depuis le VI',
    title: (lc) => `Titre (${lc.toUpperCase()})`,
    title_ph: 'Saisir le titre de la page À propos',
    content: (lc) => `Contenu (${lc.toUpperCase()})`,
    cover: 'Image',
    pickImage: 'Choisir une image',
    uploading: 'Téléversement...',
    insertFromVI: 'Traduire depuis VI',
    insertContentFromVI: 'Traduire le contenu depuis VI',
    translating: 'Traduction automatique vers d’autres langues…',
    cancel: 'Annuler',
    add: 'Ajouter',
    update: 'Mettre à jour',
  },
  de: {
    header: (e) => (e ? 'Über uns bearbeiten (mehrsprachig)' : 'Über uns hinzufügen (mehrsprachig)'),
    addLang: 'Sprache hinzufügen',
    autoTranslate: 'Automatisch aus VI übersetzen',
    title: (lc) => `Titel (${lc.toUpperCase()})`,
    title_ph: 'Titel der „Über uns“-Seite eingeben',
    content: (lc) => `Inhalt (${lc.toUpperCase()})`,
    cover: 'Bild',
    pickImage: 'Bild auswählen',
    uploading: 'Wird hochgeladen...',
    insertFromVI: 'Aus VI übersetzen',
    insertContentFromVI: 'Inhalt aus VI übersetzen',
    translating: 'Automatische Übersetzung in andere Sprachen…',
    cancel: 'Abbrechen',
    add: 'Hinzufügen',
    update: 'Aktualisieren',
  },
};
const L = (lc, key, ...args) =>
  LABELS[lc] && LABELS[lc][key]
    ? (typeof LABELS[lc][key] === 'function' ? LABELS[lc][key](...args) : LABELS[lc][key])
    : (typeof LABELS.en[key] === 'function' ? LABELS.en[key](...args) : LABELS.en[key]);

/* ===== translate helpers ===== */
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

// Dịch markdown theo dòng để giữ prefix (#, -, >, 1. ... )
async function translateMarkdown(md, source, target) {
  const lines = md.split('\n');
  const out = [];
  for (const line of lines) {
    const match = line.match(/^(\s*([#>*\-]|[0-9]+\.)\s*)(.*)$/);
    if (match) {
      const prefix = match[1];
      const text = match[3];
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

/* ===== Tabs ===== */
function LocaleTabs({ openLocales, activeTab, setActiveTab, addLocale, removeLocale, addLabel }) {
  const canAdd = ALL_LOCALES.filter((lc) => !openLocales.includes(lc));
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {openLocales.map((lc) => (
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

const AboutFormModal = ({ isOpen, onClose, onSubmit, initialData = {} }) => {
  const isEditing = Boolean(initialData?.id);

  // Base (VI)
  const [baseVI, setBaseVI] = useState({ title: '', content: '', image_url: '' });

  // Translations
  const [translations, setTranslations] = useState(
    /** @type {Record<string, { title: string, content: string }>} */({})
  );

  const [touched, setTouched] = useState(
    /** @type {Record<string, { title?: boolean, content?: boolean }>} */({})
  );

  const [activeTab, setActiveTab] = useState('vi');
  const [openLocales, setOpenLocales] = useState(['vi', 'en']);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const [autoTranslate, setAutoTranslate] = useState(true);
  const debounceTimer = useRef(null);
  const lastSourceTitle = useRef('');
  const lastSourceContent = useRef('');
  const [isTranslating, setIsTranslating] = useState(false);

  const editorVIRef = useRef(null);
  const editorRefs = useRef({}); // per-locale

  // Load data when open
  useEffect(() => {
    if (!isOpen) return;

    const raw = initialData?.about ? initialData.about : (initialData || {});
    if (isEditing) {
      setBaseVI({
        title: raw.title || '',
        content: raw.content || '',
        image_url: raw.image_url || '',
      });
      setImagePreview(raw.image_url || '');

      // Prevent auto-translate from firing on initial mount
      lastSourceTitle.current = raw.title || '';
      lastSourceContent.current = raw.content || '';

      (async () => {
        try {
          const r = await fetch(`/api/about/${raw.id || initialData.id}/translations`);
          if (!r.ok) return;
          const j = await r.json();
          const tr = j?.translations || {};
          const norm = Object.fromEntries(
            Object.entries(tr).map(([lc, v]) => [
              lc.toLowerCase(),
              { title: v?.title || '', content: v?.content || '' },
            ])
          );
          delete norm.vi;
          setTranslations(norm);

          // mark touched for locales that already have data (avoid overwrite)
          const nextTouched = {};
          for (const [lc, v] of Object.entries(norm)) {
            nextTouched[lc] = {
              title: !!(v?.title && v.title.trim()),
              content: !!(v?.content && v.content.trim()),
            };
          }
          setTouched(nextTouched);

          const defaults = ['vi', 'en'];
          const withData = Object.entries(norm)
            .filter(([, v]) => (v.title || v.content))
            .map(([lc]) => lc);
          setOpenLocales(Array.from(new Set([...defaults, ...withData])));
        } catch (e) {
          console.warn('load about translations error', e);
        }
      })();
    } else {
      setBaseVI({ title: '', content: '', image_url: '' });
      setImagePreview('');
      setTranslations({});
      setOpenLocales(['vi', 'en']);
      // reset last sources
      lastSourceTitle.current = '';
      lastSourceContent.current = '';
    }

    setActiveTab('vi');
    setTouched((prev) => (isEditing ? prev : {}));
    setTimeout(() => editorVIRef.current?.refresh?.(), 0);
  }, [isOpen, initialData, isEditing]);

  // Toggle readOnly editor when uploading
  useEffect(() => {
    editorVIRef.current?.cm?.setOption('readOnly', isUploading ? 'nocursor' : false);
    Object.values(editorRefs.current || {}).forEach((ref) =>
      ref?.cm?.setOption('readOnly', isUploading ? 'nocursor' : false)
    );
  }, [isUploading]);

  // Auto-translate VI -> open locales (only if not touched)
  useEffect(() => {
    if (!autoTranslate) return;
    const srcTitle = (baseVI.title || '').trim();
    const srcContent = (baseVI.content || '').trim();
    if (!srcTitle && !srcContent) return;

    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      const needTitle = srcTitle && srcTitle !== lastSourceTitle.current;
      const needContent = srcContent && srcContent !== lastSourceContent.current;
      if (!needTitle && !needContent) return;

      lastSourceTitle.current = srcTitle;
      lastSourceContent.current = srcContent;

      const targets = openLocales.filter((lc) => lc !== 'vi');
      if (targets.length === 0) return;

      try {
        setIsTranslating(true);
        for (const lc of targets) {
          const t = touched[lc] || {};
          let newTitle = '';
          let newContent = '';

          if (needTitle && !t.title) newTitle = await translateText(srcTitle, 'vi', lc);
          if (needContent && !t.content) newContent = await translateMarkdown(srcContent, 'vi', lc);

          if (newTitle || newContent) {
            setTranslations((prev) => {
              const curr = prev[lc] || { title: '', content: '' };
              return {
                ...prev,
                [lc]: {
                  title: newTitle || curr.title,
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
  }, [baseVI.title, baseVI.content, autoTranslate, openLocales, touched]);

  const addLocale = (lc) => {
    if (lc === 'vi') return;
    setOpenLocales((prev) => (prev.includes(lc) ? prev : [...prev, lc]));
    setTranslations((prev) => (prev[lc] ? prev : { ...prev, [lc]: { title: '', content: '' } }));
    setActiveTab(lc);
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
    setActiveTab('vi');
  };

  const handleBaseChange = (e) => {
    const { name, value } = e.target;
    setBaseVI((prev) => ({ ...prev, [name]: value }));
  };

  const handleTrChange = (lc, key, value) => {
    setTranslations((prev) => ({
      ...prev,
      [lc]: { ...(prev[lc] || { title: '', content: '' }), [key]: value },
    }));
    setTouched((prev) => ({ ...prev, [lc]: { ...(prev[lc] || {}), [key]: true } }));
  };

  const translateContentFromVI = async (lc) => {
    const src = (baseVI.content || '').trim();
    if (!src) return;
    const t = await translateMarkdown(src, 'vi', lc);
    if (!t) return;
    handleTrChange(lc, 'content', t);
    setTimeout(() => editorRefs.current[lc]?.refresh?.(), 0);
  };

  const translateTitleFromVI = async (lc) => {
    const src = (baseVI.title || '').trim();
    if (!src) return;
    const t = await translateText(src, 'vi', lc);
    if (!t) return;
    handleTrChange(lc, 'title', t);
  };

  const handleImageChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) return alert('Vui lòng chọn file ảnh hợp lệ!');
    if (f.size > 5 * 1024 * 1024) return alert('Kích thước ảnh không vượt quá 5MB!');
    setImageFile(f);
    const r = new FileReader();
    r.onload = (ev) => setImagePreview(String(ev.target?.result || ''));
    r.readAsDataURL(f);
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
    if (!baseVI.title?.trim()) return alert('Vui lòng nhập Tiêu đề (VI)');
    if (!baseVI.content?.trim()) return alert('Vui lòng nhập Nội dung (VI)');

    setIsUploading(true);
    try {
      let image_url = baseVI.image_url;
      if (imageFile) image_url = await uploadImage(imageFile);

      const payload = {
        title: baseVI.title,
        content: baseVI.content,
        image_url,
      };

      const cleanTranslations = {};
      for (const [lc, v] of Object.entries(translations)) {
        const hasAny = v?.title || v?.content;
        if (!hasAny) continue;
        cleanTranslations[lc] = { title: v.title || '', content: v.content || '' };
      }
      if (Object.keys(cleanTranslations).length) payload.translations = cleanTranslations;

      if (isEditing) payload.id = initialData?.about?.id || initialData?.id;

      await onSubmit(payload);
      onClose();

      // reset
      setBaseVI({ title: '', content: '', image_url: '' });
      setTranslations({});
      setTouched({});
      setOpenLocales(['vi', 'en']);
      setActiveTab('vi');
      setImageFile(null);
      setImagePreview('');
      lastSourceTitle.current = '';
      lastSourceContent.current = '';
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi upload ảnh hoặc gửi dữ liệu. Vui lòng thử lại!');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setBaseVI((prev) => ({ ...prev, image_url: '' }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-xl font-semibold">
            {L(activeTab, 'header', isEditing)}
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
            <button onClick={onClose} className="cursor-pointer text-gray-400 hover:text-gray-600" disabled={isUploading}>
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Tabs ngôn ngữ */}
          <LocaleTabs
            openLocales={openLocales}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            addLocale={addLocale}
            removeLocale={removeLocale}
            addLabel={L(activeTab, 'addLang')}
          />

          {/* VI tab (base) */}
          {activeTab === 'vi' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{L('vi', 'title', 'vi')} *</label>
                <input
                  name="title"
                  value={baseVI.title}
                  onChange={handleBaseChange}
                  placeholder={L('vi', 'title_ph')}
                  required
                  disabled={isUploading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{L('vi', 'content', 'vi')} *</label>
                <EditorMd
                  ref={editorVIRef}
                  value={baseVI.content}
                  height={480}
                  onChangeMarkdown={(md) => setBaseVI((f) => ({ ...f, content: md }))}
                  onReady={() => editorVIRef.current?.refresh?.()}
                />
                {isTranslating && (
                  <div className="mt-2 text-xs text-gray-500 inline-flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" /> {L('vi', 'translating')}
                  </div>
                )}
              </div>

              {/* Ảnh cover */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{L(activeTab, 'cover')}</label>

                {imagePreview && (
                  <div className="mb-3 relative inline-block">
                    <img src={imagePreview} alt="Preview" className="w-64 h-40 object-cover rounded-md border" />
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
                    id="about-image-upload"
                  />
                  <label
                    htmlFor="about-image-upload"
                    className={`cursor-pointer flex flex-col items-center space-y-2 ${isUploading ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    {isUploading ? (
                      <Loader2 className="animate-spin text-blue-500" size={28} />
                    ) : (
                      <Upload className="text-gray-400" size={28} />
                    )}
                    <span className="text-sm text-gray-600">
                      {isUploading ? L(activeTab, 'uploading') : L(activeTab, 'pickImage')}
                    </span>
                    <span className="text-xs text-gray-400">PNG, JPG, GIF ≤ 5MB</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Other locale tabs */}
          {openLocales
            .filter((lc) => lc !== 'vi')
            .map(
              (lc) =>
                activeTab === lc && (
                  <div key={lc} className="space-y-6">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">
                        {L(lc, 'title', lc)}
                      </label>
                      <button
                        type="button"
                        onClick={() => translateTitleFromVI(lc)}
                        disabled={isUploading || !baseVI.title}
                        className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
                        title={L(lc, 'insertFromVI')}
                      >
                        <Languages size={14} /> {L(lc, 'insertFromVI')}
                      </button>
                    </div>
                    <input
                      value={translations[lc]?.title || ''}
                      onChange={(e) => handleTrChange(lc, 'title', e.target.value)}
                      placeholder={L(lc, 'title', lc)}
                      disabled={isUploading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />

                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">
                        {L(lc, 'content', lc)}
                      </label>
                      <button
                        type="button"
                        onClick={() => translateContentFromVI(lc)}
                        disabled={isUploading || !baseVI.content}
                        className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
                        title={L(lc, 'insertContentFromVI')}
                      >
                        <Languages size={16} /> {L(lc, 'insertContentFromVI')}
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
                )
            )}

          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="cursor-pointer px-5 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {L(activeTab, 'cancel')}
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="cursor-pointer px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUploading && <Loader2 className="animate-spin" size={18} />}
              {isEditing ? L(activeTab, 'update') : L(activeTab, 'add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AboutFormModal;
