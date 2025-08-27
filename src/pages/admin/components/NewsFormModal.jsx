import { useEffect, useMemo, useRef, useState } from 'react'
import { X, Sparkles, ImagePlus, Languages, Plus, Wand2, Loader2 } from 'lucide-react'
import EditorMd from './EditorMd'
import useNewsForm from '../hook/UseFormModal'
import TurndownService from 'turndown'

const LANGUAGES = [
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'zh', label: '中文' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
]

// ===== i18n labels/placeholder theo locale đang mở =====
const LABELS = {
  vi: {
    tab_title: (isEditing) => (isEditing ? 'Chỉnh sửa tin tức (đa ngôn ngữ)' : 'Thêm tin tức mới (đa ngôn ngữ)'),
    autoTranslate: 'Tự dịch từ VI',
    addLang: 'Thêm ngôn ngữ',
    keyword: 'Từ khóa',
    keyword_ph: 'Nhập từ khóa...',
    gen_content: (loading) => (loading ? 'Đang tạo...' : 'Tạo nội dung'),
    gen_content_hint: (lc) => `Tạo nội dung cho ngôn ngữ đang chọn: ${lc.toUpperCase()}`,
    title: (lc) => `Tiêu đề (${lc.toUpperCase()})`,
    slug: (lc) => `Slug (${lc.toUpperCase()})`,
    meta: (lc) => `Meta description (${lc.toUpperCase()})`,
    meta_ph: (lc) => `Meta (${lc.toUpperCase()})`,
    keywords: (lc) => `Từ khóa SEO (${lc.toUpperCase()})`,
    keywords_ph: 'keyword1, keyword2, keyword3...',
    from_vi: 'Dịch từ VI',
    make_from_title: 'Tạo từ tên',
    slug_hint_ok: 'Chỉ gồm a-z, 0-9 và dấu gạch nối (-).',
    slug_hint_bad: 'Slug không hợp lệ.',
    content: (lc) => `Nội dung (${lc.toUpperCase()})`,
    insert_image: 'Chèn ảnh',
    translate_content: 'Dịch nội dung từ VI',
    gen_seo: (loading) => (loading ? 'Đang tạo...' : 'Tạo SEO'),
    cover: 'Ảnh minh họa (cover)',
    cancel: 'Hủy',
    submit_add: 'Thêm',
    submit_update: 'Cập nhật',
    translating: 'Đang tự dịch sang các ngôn ngữ khác…',
  },
  en: {
    tab_title: (isEditing) => (isEditing ? 'Edit news (multi-language)' : 'Add news (multi-language)'),
    autoTranslate: 'Auto-translate from VI',
    addLang: 'Add language',
    keyword: 'Keyword',
    keyword_ph: 'Enter a keyword...',
    gen_content: (loading) => (loading ? 'Generating...' : 'Generate content'),
    gen_content_hint: (lc) => `Generate content for active language: ${lc.toUpperCase()}`,
    title: (lc) => `Title (${lc.toUpperCase()})`,
    slug: (lc) => `Slug (${lc.toUpperCase()})`,
    meta: (lc) => `Meta description (${lc.toUpperCase()})`,
    meta_ph: (lc) => `Meta (${lc.toUpperCase()})`,
    keywords: (lc) => `SEO keywords (${lc.toUpperCase()})`,
    keywords_ph: 'keyword1, keyword2, keyword3...',
    from_vi: 'Translate from VI',
    make_from_title: 'From title',
    slug_hint_ok: 'Only a-z, 0-9 and hyphens (-).',
    slug_hint_bad: 'Invalid slug.',
    content: (lc) => `Content (${lc.toUpperCase()})`,
    insert_image: 'Insert image',
    translate_content: 'Translate content from VI',
    gen_seo: (loading) => (loading ? 'Generating...' : 'Generate SEO'),
    cover: 'Cover image',
    cancel: 'Cancel',
    submit_add: 'Add',
    submit_update: 'Update',
    translating: 'Auto-translating to other languages…',
  },
  ja: {
    tab_title: (e) => (e ? 'ニュース編集（多言語）' : 'ニュース追加（多言語）'),
    autoTranslate: 'VI から自動翻訳',
    addLang: '言語を追加',
    keyword: 'キーワード',
    keyword_ph: 'キーワードを入力...',
    gen_content: (l) => (l ? '生成中...' : 'コンテンツ生成'),
    gen_content_hint: (lc) => `現在の言語で生成: ${lc.toUpperCase()}`,
    title: (lc) => `タイトル（${lc.toUpperCase()}）`,
    slug: (lc) => `スラッグ（${lc.toUpperCase()}）`,
    meta: (lc) => `メタ説明（${lc.toUpperCase()}）`,
    meta_ph: (lc) => `メタ（${lc.toUpperCase()}）`,
    keywords: (lc) => `SEOキーワード（${lc.toUpperCase()}）`,
    keywords_ph: 'keyword1, keyword2, keyword3...',
    from_vi: 'VI から翻訳',
    make_from_title: 'タイトルから作成',
    slug_hint_ok: 'a-z, 0-9 とハイフン (-) のみ。',
    slug_hint_bad: '無効なスラッグです。',
    content: (lc) => `本文（${lc.toUpperCase()}）`,
    insert_image: '画像を挿入',
    translate_content: '本文を VI から翻訳',
    gen_seo: (l) => (l ? '生成中...' : 'SEO 作成'),
    cover: 'カバー画像',
    cancel: 'キャンセル',
    submit_add: '追加',
    submit_update: '更新',
    translating: '他の言語に自動翻訳中…',
  },
  ko: {
    tab_title: (e) => (e ? '뉴스 편집(다국어)' : '뉴스 추가(다국어)'),
    autoTranslate: '베트남어에서 자동 번역',
    addLang: '언어 추가',
    keyword: '키워드',
    keyword_ph: '키워드를 입력...',
    gen_content: (l) => (l ? '생성 중...' : '콘텐츠 생성'),
    gen_content_hint: (lc) => `현재 언어로 생성: ${lc.toUpperCase()}`,
    title: (lc) => `제목 (${lc.toUpperCase()})`,
    slug: (lc) => `슬러그 (${lc.toUpperCase()})`,
    meta: (lc) => `메타 설명 (${lc.toUpperCase()})`,
    meta_ph: (lc) => `메타 (${lc.toUpperCase()})`,
    keywords: (lc) => `SEO 키워드 (${lc.toUpperCase()})`,
    keywords_ph: 'keyword1, keyword2, keyword3...',
    from_vi: 'VI에서 번역',
    make_from_title: '제목에서 생성',
    slug_hint_ok: 'a-z, 0-9, 하이픈(-)만.',
    slug_hint_bad: '유효하지 않은 슬러그.',
    content: (lc) => `콘텐츠 (${lc.toUpperCase()})`,
    insert_image: '이미지 삽입',
    translate_content: 'VI에서 콘텐츠 번역',
    gen_seo: (l) => (l ? '생성 중...' : 'SEO 생성'),
    cover: '커버 이미지',
    cancel: '취소',
    submit_add: '추가',
    submit_update: '업데이트',
    translating: '다른 언어로 자동 번역 중…',
  },
  zh: {
    tab_title: (e) => (e ? '编辑新闻（多语言）' : '新增新闻（多语言）'),
    autoTranslate: '从越南语自动翻译',
    addLang: '添加语言',
    keyword: '关键词',
    keyword_ph: '输入关键词…',
    gen_content: (l) => (l ? '生成中…' : '生成内容'),
    gen_content_hint: (lc) => `为当前语言生成：${lc.toUpperCase()}`,
    title: (lc) => `标题（${lc.toUpperCase()}）`,
    slug: (lc) => `Slug（${lc.toUpperCase()}）`,
    meta: (lc) => `Meta 描述（${lc.toUpperCase()}）`,
    meta_ph: (lc) => `Meta（${lc.toUpperCase()}）`,
    keywords: (lc) => `SEO 关键词（${lc.toUpperCase()}）`,
    keywords_ph: 'keyword1, keyword2, keyword3...',
    from_vi: '从 VI 翻译',
    make_from_title: '由标题生成',
    slug_hint_ok: '仅包含 a-z、0-9 和连字符 (-)。',
    slug_hint_bad: '无效的 Slug。',
    content: (lc) => `正文（${lc.toUpperCase()}）`,
    insert_image: '插入图片',
    translate_content: '从 VI 翻译正文',
    gen_seo: (l) => (l ? '生成中…' : '生成 SEO'),
    cover: '封面图',
    cancel: '取消',
    submit_add: '新增',
    submit_update: '更新',
    translating: '正在自动翻译到其他语言…',
  },
  fr: {
    tab_title: (e) => (e ? 'Modifier l’article (multilingue)' : 'Ajouter un article (multilingue)'),
    autoTranslate: 'Traduire automatiquement depuis le VI',
    addLang: 'Ajouter une langue',
    keyword: 'Mot-clé',
    keyword_ph: 'Saisir un mot-clé…',
    gen_content: (l) => (l ? 'Génération…' : 'Générer le contenu'),
    gen_content_hint: (lc) => `Générer pour la langue active : ${lc.toUpperCase()}`,
    title: (lc) => `Titre (${lc.toUpperCase()})`,
    slug: (lc) => `Slug (${lc.toUpperCase()})`,
    meta: (lc) => `Meta description (${lc.toUpperCase()})`,
    meta_ph: (lc) => `Meta (${lc.toUpperCase()})`,
    keywords: (lc) => `Mots-clés SEO (${lc.toUpperCase()})`,
    keywords_ph: 'mot1, mot2, mot3…',
    from_vi: 'Traduire depuis VI',
    make_from_title: 'Depuis le titre',
    slug_hint_ok: 'Seulement a-z, 0-9 et tirets (-).',
    slug_hint_bad: 'Slug invalide.',
    content: (lc) => `Contenu (${lc.toUpperCase()})`,
    insert_image: 'Insérer une image',
    translate_content: 'Traduire le contenu depuis VI',
    gen_seo: (l) => (l ? 'Génération…' : 'Générer le SEO'),
    cover: 'Image de couverture',
    cancel: 'Annuler',
    submit_add: 'Ajouter',
    submit_update: 'Mettre à jour',
    translating: 'Traduction automatique vers d’autres langues…',
  },
  de: {
    tab_title: (e) => (e ? 'News bearbeiten (mehrsprachig)' : 'News hinzufügen (mehrsprachig)'),
    autoTranslate: 'Automatisch aus VI übersetzen',
    addLang: 'Sprache hinzufügen',
    keyword: 'Schlüsselwort',
    keyword_ph: 'Schlüsselwort eingeben…',
    gen_content: (l) => (l ? 'Wird erstellt…' : 'Inhalt erstellen'),
    gen_content_hint: (lc) => `Für aktive Sprache generieren: ${lc.toUpperCase()}`,
    title: (lc) => `Titel (${lc.toUpperCase()})`,
    slug: (lc) => `Slug (${lc.toUpperCase()})`,
    meta: (lc) => `Meta-Beschreibung (${lc.toUpperCase()})`,
    meta_ph: (lc) => `Meta (${lc.toUpperCase()})`,
    keywords: (lc) => `SEO-Schlüsselwörter (${lc.toUpperCase()})`,
    keywords_ph: 'keyword1, keyword2, keyword3...',
    from_vi: 'Aus VI übersetzen',
    make_from_title: 'Aus Titel',
    slug_hint_ok: 'Nur a-z, 0-9 und Bindestriche (-).',
    slug_hint_bad: 'Ungültiger Slug.',
    content: (lc) => `Inhalt (${lc.toUpperCase()})`,
    insert_image: 'Bild einfügen',
    translate_content: 'Inhalt aus VI übersetzen',
    gen_seo: (l) => (l ? 'Wird erstellt…' : 'SEO erstellen'),
    cover: 'Titelbild',
    cancel: 'Abbrechen',
    submit_add: 'Hinzufügen',
    submit_update: 'Aktualisieren',
    translating: 'Automatische Übersetzung in andere Sprachen…',
  },
}
const L = (lc, key, ...args) =>
  (LABELS[lc] && LABELS[lc][key])
    ? (typeof LABELS[lc][key] === 'function' ? LABELS[lc][key](...args) : LABELS[lc][key])
    : (typeof LABELS.en[key] === 'function' ? LABELS.en[key](...args) : LABELS.en[key])

const slugify = (s = '') =>
  s.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

const isValidSlug = (s = '') => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s)

// ——— Utils ———
function normalizeTranslations(input) {
  let trAll = input || {}
  if (Array.isArray(trAll)) {
    const obj = {}
    for (const t of trAll) {
      const lc = String(t?.locale || '').toLowerCase().trim()
      if (!lc) continue
      obj[lc] = t || {}
    }
    trAll = obj
  }
  const normalized = {}
  for (const k of Object.keys(trAll)) {
    normalized[String(k).toLowerCase().trim()] = trAll[k] || {}
  }
  return normalized
}

// Dịch từng dòng Markdown, giữ cú pháp
async function translateMarkdown(md, source, target) {
  const lines = md.split('\n')
  const out = []
  for (const line of lines) {
    const match = line.match(/^(\s*([#>*\-]|[0-9]+\.)\s*)(.*)$/)
    if (match) {
      const prefix = match[1]
      const text = match[3]
      let translated = text
      if (text.trim()) {
        try {
          const r = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, source, target }),
          })
          if (r.ok) translated = (await r.json())?.translated || text
        } catch { }
      }
      out.push(prefix + translated)
    } else {
      let translated = line
      if (line.trim()) {
        try {
          const r = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: line, source, target }),
          })
          if (r.ok) translated = (await r.json())?.translated || line
        } catch { }
      }
      out.push(translated)
    }
  }
  return out.join('\n')
}

export default function NewsFormModal({ isOpen, onClose, onSubmit, initialData = {} }) {
  // —— giống product: tính rawData & isEditing chuẩn —— //
  const rawData = initialData?.news ? initialData.news : (initialData || {})
  const isEditing = Boolean(rawData?.id)

  const [shared, setShared] = useState({ keyword: '', image_url: '' })

  const emptyLocaleBlock = { title: '', slug: '', meta: '', content: '', keywords: '' }
  const [translations, setTranslations] = useState(
    Object.fromEntries(LANGUAGES.map(l => [l.code, { ...emptyLocaleBlock }]))
  )

  const [activeLang, setActiveLang] = useState('vi')
  const [openLocales, setOpenLocales] = useState(['vi', 'en'])

  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  const editorRefs = useRef({})
  const [mdByLocale, setMdByLocale] = useState(
    Object.fromEntries(LANGUAGES.map(l => [l.code, '']))
  )
  const filePickerRefs = useRef({})
  const tempImagesByLocale = useRef(
    Object.fromEntries(LANGUAGES.map(l => [l.code, new Map()]))
  )

  const [autoTranslate, setAutoTranslate] = useState(true)
  const debounceTimer = useRef(null)
  const lastSourceVI = useRef({ title: '', meta: '', keywords: '', content: '' })
  const [isTranslating, setIsTranslating] = useState(false)

  const formActive = {
    keyword: shared.keyword,
    title: translations[activeLang]?.title || '',
    meta: translations[activeLang]?.meta || '',
    content: mdByLocale[activeLang] || translations[activeLang]?.content || '',
    keywords: translations[activeLang]?.keywords || '',
    slug: translations[activeLang]?.slug || '',
    image_url: shared.image_url || '',
  }

  const setFormActive = (updater) => {
    setTranslations(prev => {
      const before = prev[activeLang] || { ...emptyLocaleBlock }
      const nextForm =
        typeof updater === 'function'
          ? updater({ ...formActive })
          : { ...formActive, ...(updater || {}) }

      if (nextForm.content !== mdByLocale[activeLang]) {
        setMdByLocale(m => ({ ...m, [activeLang]: nextForm.content || '' }))
      }

      return {
        ...prev,
        [activeLang]: {
          ...before,
          title: nextForm.title || '',
          meta: nextForm.meta || '',
          keywords: nextForm.keywords || '',
          slug: nextForm.slug || '',
          content: nextForm.content || '',
        }
      }
    })

    if (typeof updater === 'function') {
      const snap = updater({ ...formActive })
      if (snap && 'keyword' in snap) {
        setShared(s => ({ ...s, keyword: snap.keyword }))
      }
      if (snap && 'image_url' in snap) {
        setShared(s => ({ ...s, image_url: snap.image_url }))
      }
    } else if (updater) {
      if ('keyword' in updater) setShared(s => ({ ...s, keyword: updater.keyword }))
      if ('image_url' in updater) setShared(s => ({ ...s, image_url: updater.image_url }))
    }
  }

  const { uploadImage, generateContentFromKeyword, generateSEOFromContent, isGenerating } =
    useNewsForm(formActive, setFormActive)

  const turndown = useRef(new TurndownService()).current
  const initialMarkdownVI = useMemo(() => {
    const src = (rawData.content || '').trim()
    if (!src) return ''
    const hasTags = /<\/?[a-z][\s\S]*>/i.test(src)
    return hasTags ? turndown.turndown(src) : src
  }, [rawData.content, isOpen])

  // —— Khởi tạo (giữ nguyên logic cũ) —— //
  useEffect(() => {
    if (!isOpen) return

    setShared({
      keyword: '',
      image_url: rawData.image_url || '',
    })
    setImagePreview(rawData.image_url || '')

    const empty = { ...emptyLocaleBlock }
    const nextTr = Object.fromEntries(LANGUAGES.map(l => [l.code, { ...empty }]))

    const trAll = normalizeTranslations(rawData.translations)

    const pickLocaleBlock = (lc) => {
      const t = trAll[lc] || {}
      const fromTr = {
        title: t.title || '',
        slug: t.slug || '',
        content: t.content || '',
        meta: (t.meta != null ? t.meta : t.meta_description) || '',
        keywords: t.keywords || '',
      }
      if (lc === 'vi') {
        return {
          title: fromTr.title || rawData.title || '',
          slug: fromTr.slug || rawData.slug || '',
          content: fromTr.content || rawData.content || '',
          meta: fromTr.meta || rawData.meta_description || '',
          keywords: fromTr.keywords || rawData.keywords || '',
        }
      }
      return fromTr
    }

    nextTr.vi = pickLocaleBlock('vi')
    LANGUAGES.map(l => l.code).filter(lc => lc !== 'vi').forEach(lc => {
      nextTr[lc] = pickLocaleBlock(lc)
    })

    const haveData = (b) =>
      (b.title && b.title.trim()) ||
      (b.meta && b.meta.trim()) ||
      (b.keywords && b.keywords.trim()) ||
      (b.content && b.content.trim())

    const defaults = ['vi', 'en']
    const localesWithData = LANGUAGES
      .map(l => l.code)
      .filter(lc => lc === 'vi' || haveData(nextTr[lc]))
    const nextOpen = Array.from(new Set([].concat(defaults, localesWithData)))

    const nextMd = {}
    LANGUAGES.map(l => l.code).forEach(lc => {
      const src = (nextTr[lc]?.content || '').trim()
      if (!src) { nextMd[lc] = ''; return }
      const hasTags = /<\/?[a-z][\s\S]*>/i.test(src)
      nextMd[lc] = hasTags ? turndown.turndown(src) : src
    })

    setTranslations(nextTr)
    setMdByLocale(nextMd)
    setOpenLocales(nextOpen)

    const enHas = haveData(nextTr.en || empty)
    setActiveLang(enHas ? 'en' : 'vi')

    setTimeout(() => {
      Object.values(editorRefs.current).forEach(ref => ref?.cm?.refresh?.())
    }, 0)

    lastSourceVI.current = {
      title: nextTr.vi.title || '',
      meta: nextTr.vi.meta || '',
      keywords: nextTr.vi.keywords || '',
      content: nextMd.vi || ''
    }
  }, [isOpen, rawData])

  // —— Lazy load bản dịch —— //
  useEffect(() => {
    if (!isOpen || !rawData?.id) return
    const controller = new AbortController()

      ; (async () => {
        const targets = openLocales.filter(lc => lc !== 'vi')
        for (const lc of targets) {
          const cur = translations[lc] || emptyLocaleBlock
          const missing =
            !(cur.title?.trim()) &&
            !(cur.meta?.trim()) &&
            !(cur.keywords?.trim()) &&
            !(cur.content?.trim())
          if (!missing) continue

          try {
            const r = await fetch(`/api/news/${rawData.id}/translation?locale=${encodeURIComponent(lc)}`, {
              signal: controller.signal
            })
            if (!r.ok) continue
            const v = await r.json()
            const merged = {
              title: v?.title || '',
              slug: v?.slug || '',
              content: v?.content || '',
              meta: (v?.meta != null ? v.meta : v?.meta_description) || '',
              keywords: v?.keywords || ''
            }
            setTranslations(prev => ({ ...prev, [lc]: { ...(prev[lc] || emptyLocaleBlock), ...merged } }))
            setMdByLocale(prev => {
              const src = (merged.content || '').trim()
              if (!src) return prev
              const hasTags = /<\/?[a-z][\s\S]*>/i.test(src)
              return { ...prev, [lc]: hasTags ? turndown.turndown(src) : src }
            })
          } catch { }
        }
      })()

    return () => controller.abort()
  }, [isOpen, rawData?.id, openLocales])

  const pickInlineImage = async (lc, e) => {
    const f = e.target.files?.[0]; if (!f) return
    if (!f.type.startsWith('image/')) { alert('Vui lòng chọn file ảnh!'); return }
    if (f.size > 5 * 1024 * 1024) { alert('Ảnh không vượt 5MB!'); return }
    const blobUrl = URL.createObjectURL(f)
    tempImagesByLocale.current[lc].set(blobUrl, f)
    editorRefs.current[lc]?.insertValue?.(`\n![](${blobUrl})\n`)
    e.target.value = ''
  }

  async function replaceTempImagesInMarkdown(lc, markdown) {
    let out = markdown
    const re = /!\[[^\]]*]\(([^)]+)\)/g
    const jobs = []
    for (const m of markdown.matchAll(re)) {
      const url = m[1]
      if (url.startsWith('blob:')) {
        const file = tempImagesByLocale.current[lc].get(url)
        if (!file) continue
        jobs.push((async () => {
          const u = await uploadImage(file)
          out = out.split(url).join(u)
        })())
      } else if (url.startsWith('data:image/')) {
        jobs.push((async () => {
          const file = await dataURLtoFile(url)
          const u = await uploadImage(file)
          out = out.split(url).join(u)
        })())
      }
    }
    await Promise.all(jobs)
    return out
  }

  function dataURLtoFile(dataurl) {
    const [meta, b64] = dataurl.split(',')
    const mime = meta.match(/data:(.*?);base64/)?.[1] || 'image/png'
    const bin = atob(b64 || '')
    const arr = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
    const ext = (mime.split('/')[1] || 'png').toLowerCase()
    return new File([arr], `inline-${Date.now()}.${ext}`, { type: mime })
  }

  const handleImageChange = (e) => {
    const f = e.target.files?.[0]; if (!f) return
    if (!f.type.startsWith('image/')) return alert('Vui lòng chọn file ảnh!')
    if (f.size > 5 * 1024 * 1024) return alert('Ảnh không vượt 5MB!')
    setImageFile(f)
    const r = new FileReader()
    r.onload = ev => setImagePreview(ev.target.result)
    r.readAsDataURL(f)
  }

  const handleGenerateClick = async () => {
    const out = await generateContentFromKeyword()
    const src = (typeof out === 'string' && out.trim()) ? out : (mdByLocale[activeLang] || translations[activeLang]?.content || '')
    if (!src) return
    const hasTags = /<\/?[a-z][\s\S]*>/i.test(src)
    const newMd = hasTags ? turndown.turndown(src) : src

    setMdByLocale(prev => ({ ...prev, [activeLang]: newMd }))
    setTranslations(prev => ({
      ...prev,
      [activeLang]: { ...(prev[activeLang] || emptyLocaleBlock), content: newMd }
    }))
    requestAnimationFrame(() => editorRefs.current[activeLang]?.refresh?.())
  }

  const handleGenerateSEOClick = async () => {
    await generateSEOFromContent()
    requestAnimationFrame(() => editorRefs.current[activeLang]?.refresh?.())
  }

  useEffect(() => {
    const srcTitle = (translations.vi?.title || '').trim()
    const srcMeta = (translations.vi?.meta || '').trim()
    const srcKeywords = (translations.vi?.keywords || '').trim()
    const srcContent = (mdByLocale.vi || '').trim()

    const needTitle = srcTitle && srcTitle !== lastSourceVI.current.title
    const needMeta = srcMeta && srcMeta !== lastSourceVI.current.meta
    const needKeywords = srcKeywords && srcKeywords !== lastSourceVI.current.keywords
    const needContent = srcContent && srcContent !== lastSourceVI.current.content

    if (!autoTranslate || (!needTitle && !needMeta && !needKeywords && !needContent)) return

    clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(async () => {
      lastSourceVI.current = { title: srcTitle, meta: srcMeta, keywords: srcKeywords, content: srcContent }
      const targets = openLocales.filter((lc) => lc !== 'vi')
      if (targets.length === 0) return

      try {
        setIsTranslating(true)
        for (const lc of targets) {
          const updates = {}
          const cur = translations[lc] || emptyLocaleBlock

          if (needTitle && !cur.title) {
            const t = await translateText(srcTitle, 'vi', lc)
            if (t) {
              updates.title = t
              updates.slug = cur.slug || slugify(t)
            }
          }
          if (needMeta && !cur.meta) {
            const t = await translateText(srcMeta, 'vi', lc)
            if (t) updates.meta = t
          }
          if (needKeywords && !cur.keywords) {
            const t = await translateText(srcKeywords, 'vi', lc)
            if (t) updates.keywords = t
          }
          if (needContent && !(mdByLocale[lc] || '').trim()) {
            const t = await translateMarkdown(srcContent, 'vi', lc)
            if (t) {
              updates.content = t
              setMdByLocale(prev => ({ ...prev, [lc]: t }))
            }
          }

          if (Object.keys(updates).length) {
            setTranslations(prev => ({ ...prev, [lc]: { ...(prev[lc] || emptyLocaleBlock), ...updates } }))
          }
        }
      } finally {
        setIsTranslating(false)
      }
    }, 450)

    return () => clearTimeout(debounceTimer.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [translations.vi?.title, translations.vi?.meta, translations.vi?.keywords, mdByLocale.vi, autoTranslate, openLocales])

  async function translateText(text, source, target) {
    try {
      const r = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, source, target }),
      })
      if (!r.ok) return ''
      const j = await r.json()
      return j?.translated || ''
    } catch {
      return ''
    }
  }

  const handleSharedChange = (e) => {
    const { name, value } = e.target
    setShared(prev => ({ ...prev, [name]: value }))
  }

  const handleTrChange = (lc, key, value) => {
    setTranslations(prev => {
      const curr = prev[lc] || { ...emptyLocaleBlock }
      const next = { ...curr, [key]: value }
      if (key === 'title' && !curr.slug) next.slug = slugify(value || '')
      return { ...prev, [lc]: next }
    })
  }

  const handleSlugBlurLC = (lc) => {
    const normalized = slugify(translations[lc]?.slug || '')
    setTranslations(prev => ({ ...prev, [lc]: { ...(prev[lc] || emptyLocaleBlock), slug: normalized } }))
  }

  const canAddLocales = LANGUAGES.filter(l => !openLocales.includes(l.code))
  const addLocaleTab = (lc) => {
    if (!openLocales.includes(lc)) setOpenLocales(prev => [...prev, lc])
    setActiveLang(lc)
    setTranslations(prev => prev[lc] ? prev : { ...prev, [lc]: { ...emptyLocaleBlock } })
  }
  const removeLocaleTab = (lc) => {
    if (lc === 'vi') return
    setOpenLocales(prev => prev.filter(x => x !== lc))
    setActiveLang('vi')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsUploading(true)
    try {
      const viTitle = (translations.vi?.title || '').trim()
      if (!viTitle) { alert('Vui lòng nhập Tiêu đề (VI)'); setIsUploading(false); return }
      let viMd = (mdByLocale.vi ?? translations.vi?.content ?? '').trim()
      if (!viMd) { alert('Vui lòng nhập Nội dung (VI)'); setIsUploading(false); return }

      let finalImage = shared.image_url
      if (imageFile) {
        finalImage = await uploadImage(imageFile)
      }

      if (/blob:|data:image\//.test(viMd)) {
        viMd = await replaceTempImagesInMarkdown('vi', viMd)
      }

      let viSlug = (translations.vi?.slug || slugify(viTitle)).trim()
      if (viSlug && !isValidSlug(viSlug)) {
        viSlug = slugify(viSlug)
      }

      const basePayload = {
        title: viTitle,
        slug: viSlug,
        content: viMd,
        image_url: finalImage || null,
        meta_description: (translations.vi?.meta || '').trim() || null,
        keywords: (translations.vi?.keywords || '').trim() || null,
      }

      const outTranslations = {}
      for (const lc of Object.keys(translations)) {
        if (lc === 'vi') continue
        const t = translations[lc] || emptyLocaleBlock
        let md = (mdByLocale[lc] ?? t.content ?? '').trim()
        if (/blob:|data:image\//.test(md)) {
          md = await replaceTempImagesInMarkdown(lc, md)
        }
        const anyField = (t.title || '').trim() || (t.meta || '').trim() || (t.keywords || '').trim() || md
        if (!anyField) continue
        let tSlug = (t.slug || slugify(t.title || '')).trim()
        if (tSlug && !isValidSlug(tSlug)) tSlug = slugify(tSlug)
        outTranslations[lc] = {
          title: (t.title || '').trim(),
          slug: tSlug,
          content: md,
          meta_description: (t.meta || '').trim() || null,
          keywords: (t.keywords || '').trim() || null,
        }
      }

      const finalForm = {
        ...basePayload,
        translations: outTranslations,
      }
      if (isEditing) finalForm.id = rawData.id

      await onSubmit(finalForm)
      handleClose()
    } catch (err) {
      console.error(err)
      alert('Có lỗi khi lưu!')
    } finally {
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    onClose()
    setShared({ keyword: '', image_url: '' })
    setImageFile(null)
    setImagePreview('')
    setTranslations(Object.fromEntries(LANGUAGES.map(l => [l.code, { ...emptyLocaleBlock }])))
    setMdByLocale(Object.fromEntries(LANGUAGES.map(l => [l.code, ''])))
    tempImagesByLocale.current = Object.fromEntries(LANGUAGES.map(l => [l.code, new Map()]))
    setOpenLocales(['vi', 'en'])
    setActiveLang('vi')
  }

  if (!isOpen) return null

  const wordCount = (mdByLocale[activeLang] || '').replace(/<[^>]+>/g, ' ').trim().match(/\S+/g)?.length || 0

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[100vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{L(activeLang, 'tab_title', isEditing)}</h3>
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoTranslate}
                onChange={(e) => setAutoTranslate(e.target.checked)}
                disabled={isGenerating || isUploading}
              />
              <span className="inline-flex items-center gap-1">
                <Sparkles size={16} /> {L(activeLang, 'autoTranslate')}
              </span>
            </label>
            <button onClick={handleClose} disabled={isUploading || isGenerating} className="cursor-pointer text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {/* Tabs ngôn ngữ */}
          <div className="flex items-center gap-2 flex-wrap">
            {openLocales.map((lc) => (
              <div key={lc} className="flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    setActiveLang(lc)
                    setTimeout(() => editorRefs.current[lc]?.cm?.refresh?.(), 0)
                  }}
                  className={`px-3 py-1 rounded-full border text-sm mr-1 ${activeLang === lc ? 'bg-black text-white' : ''}`}
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
                    <Plus size={16} /> {L(activeLang, 'addLang')}
                  </summary>
                  <div className="absolute z-10 mt-2 w-44 rounded-lg border bg-white shadow">
                    {canAddLocales.map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => addLocaleTab(l.code)}
                        className="block w-full text-left px-3 py-2 hover:bg-gray-50"
                      >
                        {l.label} ({l.code.toUpperCase()})
                      </button>
                    ))}
                  </div>
                </details>
              </div>
            )}
          </div>

          {/* Khối chung: full-width một cột */}
          <div className="space-y-6">
            {/* Form: full-width */}
            <div className="space-y-4">
              {/* Keyword + Tạo nội dung */}
              <div>
                <label className="block text-sm font-medium mb-1">{L(activeLang, 'keyword')}</label>
                <div className="flex gap-2">
                  <input
                    name="keyword"
                    value={shared.keyword}
                    onChange={(e) => setShared(prev => ({ ...prev, keyword: e.target.value }))}
                    placeholder={L(activeLang, 'keyword_ph')}
                    className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-purple-500"
                    disabled={isGenerating || isUploading}
                  />
                  <button
                    type="button"
                    onClick={handleGenerateClick}
                    disabled={isGenerating || isUploading || !shared.keyword.trim()}
                    className="cursor-pointer px-3 py-2 bg-purple-600 text-white rounded flex items-center gap-1 disabled:opacity-50 hover:bg-purple-700"
                  >
                    <Sparkles size={16} /> {L(activeLang, 'gen_content', isGenerating)}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {L(activeLang, 'gen_content_hint', activeLang)}
                </p>
              </div>

              {/* Trường theo ngôn ngữ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium mb-1">
                      {L(activeLang, 'title', activeLang)} {activeLang === 'vi' ? '*' : ''}
                    </label>
                    {activeLang !== 'vi' && (
                      <button
                        type="button"
                        onClick={async () => {
                          const t = await translateText(translations.vi?.title || '', 'vi', activeLang)
                          if (t) handleTrChange(activeLang, 'title', t)
                        }}
                        disabled={isGenerating || isUploading || !translations.vi?.title}
                        className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
                        title={L(activeLang, 'from_vi')}
                      >
                        <Languages size={14} /> {L(activeLang, 'from_vi')}
                      </button>
                    )}
                  </div>
                  <input
                    name={`title-${activeLang}`}
                    value={translations[activeLang]?.title || ''}
                    onChange={(e) => handleTrChange(activeLang, 'title', e.target.value)}
                    required={activeLang === 'vi'}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                    disabled={isGenerating || isUploading}
                    maxLength={120}
                    placeholder={L(activeLang, 'title', activeLang)}
                  />
                  <p className="text-xs text-gray-500 mt-1">{(translations[activeLang]?.title || '').length}/60–120</p>
                </div>

                {/* Slug */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium mb-1">{L(activeLang, 'slug', activeLang)}</label>
                    <button
                      type="button"
                      onClick={() => {
                        const s = slugify(translations[activeLang]?.title || '')
                        handleTrChange(activeLang, 'slug', s)
                      }}
                      disabled={isGenerating || isUploading}
                      className="text-sm inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
                      title={L(activeLang, 'make_from_title')}
                    >
                      <Wand2 size={16} /> {L(activeLang, 'make_from_title')}
                    </button>
                  </div>
                  <input
                    name={`slug-${activeLang}`}
                    value={translations[activeLang]?.slug || ''}
                    onChange={(e) => handleTrChange(activeLang, 'slug', e.target.value)}
                    onBlur={() => handleSlugBlurLC(activeLang)}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                    disabled={isGenerating || isUploading}
                    placeholder="url-seo-than-thien"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {translations[activeLang]?.slug && !isValidSlug(translations[activeLang].slug)
                      ? <span className="text-red-600">{L(activeLang, 'slug_hint_bad')}</span>
                      : L(activeLang, 'slug_hint_ok')
                    }
                  </p>
                </div>

                {/* Meta */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium mb-1">{L(activeLang, 'meta', activeLang)}</label>
                    {activeLang !== 'vi' && (
                      <button
                        type="button"
                        onClick={async () => {
                          const t = await translateText(translations.vi?.meta || '', 'vi', activeLang)
                          if (t) handleTrChange(activeLang, 'meta', t)
                        }}
                        disabled={isGenerating || isUploading || !translations.vi?.meta}
                        className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
                        title={L(activeLang, 'from_vi')}
                      >
                        <Languages size={14} /> {L(activeLang, 'from_vi')}
                      </button>
                    )}
                  </div>
                  <input
                    name={`meta-${activeLang}`}
                    value={translations[activeLang]?.meta || ''}
                    onChange={(e) => handleTrChange(activeLang, 'meta', e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                    disabled={isGenerating || isUploading}
                    maxLength={160}
                    placeholder={L(activeLang, 'meta_ph', activeLang)}
                  />
                  <div className="text-xs text-gray-500 mt-1">{(translations[activeLang]?.meta || '').length}/160</div>
                </div>

                {/* Keywords */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium mb-1">{L(activeLang, 'keywords', activeLang)}</label>
                    {activeLang !== 'vi' && (
                      <button
                        type="button"
                        onClick={async () => {
                          const t = await translateText(translations.vi?.keywords || '', 'vi', activeLang)
                          if (t) handleTrChange(activeLang, 'keywords', t)
                        }}
                        disabled={isGenerating || isUploading || !translations.vi?.keywords}
                        className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
                        title={L(activeLang, 'from_vi')}
                      >
                        <Languages size={14} /> {L(activeLang, 'from_vi')}
                      </button>
                    )}
                  </div>
                  <input
                    name={`keywords-${activeLang}`}
                    value={translations[activeLang]?.keywords || ''}
                    onChange={(e) => handleTrChange(activeLang, 'keywords', e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                    disabled={isGenerating || isUploading}
                    placeholder={L(activeLang, 'keywords_ph')}
                  />
                </div>
              </div>

              {/* Content + chèn ảnh + Tạo SEO */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium mb-1">
                    {L(activeLang, 'content', activeLang)} {activeLang === 'vi' ? '*' : ''}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      ref={(el) => (filePickerRefs.current[activeLang] = el)}
                      onChange={(e) => pickInlineImage(activeLang, e)}
                      hidden
                    />
                    <button
                      type="button"
                      onClick={() => filePickerRefs.current[activeLang]?.click()}
                      className="cursor-pointer px-2 py-1 border rounded text-sm flex items-center gap-1 hover:bg-gray-50"
                      disabled={isGenerating || isUploading}
                    >
                      <ImagePlus size={16} /> {L(activeLang, 'insert_image')}
                    </button>

                    {activeLang !== 'vi' && (
                      <button
                        type="button"
                        onClick={async () => {
                          const t = await translateMarkdown(mdByLocale.vi || '', 'vi', activeLang)
                          if (!t) return
                          setMdByLocale(prev => ({ ...prev, [activeLang]: t }))
                          setTranslations(prev => ({ ...prev, [activeLang]: { ...(prev[activeLang] || emptyLocaleBlock), content: t } }))
                          setTimeout(() => editorRefs.current[activeLang]?.cm?.refresh?.(), 0)
                        }}
                        disabled={isGenerating || isUploading || !(mdByLocale.vi || '').trim()}
                        className="cursor-pointer px-2 py-1 border rounded text-sm flex items-center gap-1 hover:bg-gray-50"
                        title={L(activeLang, 'translate_content')}
                      >
                        <Languages size={16} /> {L(activeLang, 'translate_content')}
                      </button>
                    )}
                  </div>
                </div>

                <EditorMd
                  ref={(r) => (editorRefs.current[activeLang] = r)}
                  value={mdByLocale[activeLang] || translations[activeLang]?.content || ''}
                  onReady={(inst) => {
                    requestAnimationFrame(() => inst.cm.refresh())
                  }}
                  onChangeMarkdown={(val) => {
                    setMdByLocale(prev => ({ ...prev, [activeLang]: val }))
                    setTranslations(prev => ({ ...prev, [activeLang]: { ...(prev[activeLang] || emptyLocaleBlock), content: val } }))
                  }}
                />

                <div className="flex justify-between items-center mt-2">
                  <div className="text-xs text-gray-500">{wordCount} words</div>
                  <button
                    type="button"
                    onClick={handleGenerateSEOClick}
                    disabled={isGenerating || isUploading || !(mdByLocale[activeLang] || '').trim()}
                    className="cursor-pointer px-3 py-2 bg-blue-600 text-white rounded flex items-center gap-1 disabled:opacity-50 hover:bg-blue-700"
                  >
                    <Sparkles size={16} /> {L(activeLang, 'gen_seo', isGenerating)}
                  </button>
                </div>
                {isTranslating && (
                  <div className="mt-2 text-xs text-gray-500 inline-flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" /> {L(activeLang, 'translating')}
                  </div>
                )}
              </div>
            </div>

            {/* Cover: Drag & Drop style, full-width & nằm cuối */}
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-1">{L(activeLang, 'cover')}</label>

              <label
                htmlFor="cover-upload"
                className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-40 rounded-md object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null)
                        setImagePreview('')
                        setShared((p) => ({ ...p, image_url: '' }))
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                      disabled={isGenerating || isUploading}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-upload text-gray-400" aria-hidden="true"><path d="M12 3v12"></path><path d="m17 8-5-5-5 5"></path><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path></svg>
                    <p className="mb-1 text-sm">Chọn ảnh từ máy tính</p>
                    <p className="text-xs">PNG, JPG, GIF tối đa 5MB</p>
                  </div>
                )}

                <input
                  id="cover-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isGenerating || isUploading}
                />
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="cursor-pointer px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              disabled={isGenerating || isUploading}
            >
              {L(activeLang, 'cancel')}
            </button>
            <button
              type="submit"
              disabled={isUploading || isGenerating}
              className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 inline-flex items-center gap-2"
            >
              {(isUploading || isGenerating) && <Loader2 size={16} className="animate-spin" />}
              {isEditing ? L(activeLang, 'submit_update') : L(activeLang, 'submit_add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
