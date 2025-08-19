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

  // —— Khởi tạo: ưu tiên translations.[lc]; chỉ VI mới fallback base —— //
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
        // VI fallback base when missing
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

    // Fill VI + others
    nextTr.vi = pickLocaleBlock('vi')
    LANGUAGES.map(l => l.code).filter(lc => lc !== 'vi').forEach(lc => {
      nextTr[lc] = pickLocaleBlock(lc)
    })

    // Tabs mở mặc định: vi + en + các locale có data thật
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

    // Chuẩn hoá markdown
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

    // Nếu EN có dữ liệu → mở EN, không thì VI
    const enHas = haveData(nextTr.en || empty)
    setActiveLang(enHas ? 'en' : 'vi')

    // Refresh editors
    setTimeout(() => {
      Object.values(editorRefs.current).forEach(ref => ref?.cm?.refresh?.())
    }, 0)

    // Ghi dấu nguồn VI cho auto-translate
    lastSourceVI.current = {
      title: nextTr.vi.title || '',
      meta: nextTr.vi.meta || '',
      keywords: nextTr.vi.keywords || '',
      content: nextMd.vi || ''
    }
  }, [isOpen, rawData])

  // —— Lazy load bản dịch từng locale từ API /api/news/:id/translation?locale=xx —— //
  useEffect(() => {
    if (!isOpen || !rawData?.id) return
    const controller = new AbortController()

      ; (async () => {
        // Tải cho các tab đang mở (trừ VI) nếu thiếu dữ liệu
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
            // Kỳ vọng: { id, locale, title, slug, content, meta_description, keywords, updated_at }
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
  }, [isOpen, rawData?.id, openLocales]) // cố tình không include translations để tránh vòng lặp

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
          <h3 className="text-lg font-semibold">{isEditing ? 'Chỉnh sửa tin tức (đa ngôn ngữ)' : 'Thêm tin tức mới (đa ngôn ngữ)'}</h3>
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoTranslate}
                onChange={(e) => setAutoTranslate(e.target.checked)}
                disabled={isGenerating || isUploading}
              />
              <span className="inline-flex items-center gap-1">
                <Sparkles size={16} /> Tự dịch từ VI
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
                    <Plus size={16} /> Thêm ngôn ngữ
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

          {/* Khối chung (keyword + ảnh cover) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cột trái */}
            <div className="lg:col-span-2 space-y-4">
              {/* Keyword + Tạo nội dung */}
              <div>
                <label className="block text-sm font-medium mb-1">Từ khóa</label>
                <div className="flex gap-2">
                  <input
                    name="keyword"
                    value={shared.keyword}
                    onChange={(e) => setShared(prev => ({ ...prev, keyword: e.target.value }))}
                    placeholder="Nhập từ khóa..."
                    className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-purple-500"
                    disabled={isGenerating || isUploading}
                  />
                  <button
                    type="button"
                    onClick={handleGenerateClick}
                    disabled={isGenerating || isUploading || !shared.keyword.trim()}
                    className="cursor-pointer px-3 py-2 bg-purple-600 text-white rounded flex items-center gap-1 disabled:opacity-50 hover:bg-purple-700"
                  >
                    <Sparkles size={16} /> {isGenerating ? 'Đang tạo...' : 'Tạo nội dung'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Tạo nội dung cho ngôn ngữ đang chọn: <b>{activeLang.toUpperCase()}</b>
                </p>
              </div>

              {/* Trường theo ngôn ngữ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium mb-1">Tiêu đề ({activeLang.toUpperCase()}) {activeLang === 'vi' ? '*' : ''}</label>
                    {activeLang !== 'vi' && (
                      <button
                        type="button"
                        onClick={async () => {
                          const t = await translateText(translations.vi?.title || '', 'vi', activeLang)
                          if (t) handleTrChange(activeLang, 'title', t)
                        }}
                        disabled={isGenerating || isUploading || !translations.vi?.title}
                        className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
                        title="Dịch từ VI"
                      >
                        <Languages size={14} /> Dịch từ VI
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
                    placeholder={`Tiêu đề (${activeLang.toUpperCase()})`}
                  />
                  <p className="text-xs text-gray-500 mt-1">{(translations[activeLang]?.title || '').length}/60–120 ký tự gợi ý</p>
                </div>

                {/* Slug */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium mb-1">Slug ({activeLang.toUpperCase()})</label>
                    <button
                      type="button"
                      onClick={() => {
                        const s = slugify(translations[activeLang]?.title || '')
                        handleTrChange(activeLang, 'slug', s)
                      }}
                      disabled={isGenerating || isUploading}
                      className="text-sm inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
                      title="Sinh slug từ tiêu đề"
                    >
                      <Wand2 size={16} /> Tạo từ tên
                    </button>
                  </div>
                  <input
                    name={`slug-${activeLang}`}
                    value={translations[activeLang]?.slug || ''}
                    onChange={(e) => handleTrChange(activeLang, 'slug', e.target.value)}
                    onBlur={() => handleSlugBlurLC(activeLang)}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                    disabled={isGenerating || isUploading}
                    placeholder="url-than-thien-seo"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {translations[activeLang]?.slug && !isValidSlug(translations[activeLang].slug)
                      ? <span className="text-red-600">Slug không hợp lệ.</span>
                      : 'Chỉ gồm a-z, 0-9 và dấu gạch nối (-).'
                    }
                  </p>
                </div>

                {/* Meta */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium mb-1">Meta description ({activeLang.toUpperCase()})</label>
                    {activeLang !== 'vi' && (
                      <button
                        type="button"
                        onClick={async () => {
                          const t = await translateText(translations.vi?.meta || '', 'vi', activeLang)
                          if (t) handleTrChange(activeLang, 'meta', t)
                        }}
                        disabled={isGenerating || isUploading || !translations.vi?.meta}
                        className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
                        title="Dịch từ VI"
                      >
                        <Languages size={14} /> Dịch từ VI
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
                    placeholder={`Meta (${activeLang.toUpperCase()})`}
                  />
                  <div className="text-xs text-gray-500 mt-1">{(translations[activeLang]?.meta || '').length}/160 ký tự</div>
                </div>

                {/* Keywords */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium mb-1">Từ khóa SEO ({activeLang.toUpperCase()})</label>
                    {activeLang !== 'vi' && (
                      <button
                        type="button"
                        onClick={async () => {
                          const t = await translateText(translations.vi?.keywords || '', 'vi', activeLang)
                          if (t) handleTrChange(activeLang, 'keywords', t)
                        }}
                        disabled={isGenerating || isUploading || !translations.vi?.keywords}
                        className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
                        title="Dịch từ VI"
                      >
                        <Languages size={14} /> Dịch từ VI
                      </button>
                    )}
                  </div>
                  <input
                    name={`keywords-${activeLang}`}
                    value={translations[activeLang]?.keywords || ''}
                    onChange={(e) => handleTrChange(activeLang, 'keywords', e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                    disabled={isGenerating || isUploading}
                    placeholder="keyword1, keyword2, keyword3..."
                  />
                </div>
              </div>

              {/* Content + chèn ảnh + Tạo SEO */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium mb-1">Nội dung ({activeLang.toUpperCase()}) {activeLang === 'vi' ? '*' : ''}</label>
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
                      <ImagePlus size={16} /> Chèn ảnh
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
                        title="Dịch nội dung từ VI"
                      >
                        <Languages size={16} /> Dịch nội dung từ VI
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
                  <div className="text-xs text-gray-500">{wordCount} từ</div>
                  <button
                    type="button"
                    onClick={handleGenerateSEOClick}
                    disabled={isGenerating || isUploading || !(mdByLocale[activeLang] || '').trim()}
                    className="cursor-pointer px-3 py-2 bg-blue-600 text-white rounded flex items-center gap-1 disabled:opacity-50 hover:bg-blue-700"
                  >
                    <Sparkles size={16} /> {isGenerating ? 'Đang tạo...' : 'Tạo SEO'}
                  </button>
                </div>
                {isTranslating && (
                  <div className="mt-2 text-xs text-gray-500 inline-flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" /> Đang tự dịch sang các ngôn ngữ khác…
                  </div>
                )}
              </div>
            </div>

            {/* Cột phải: Ảnh cover */}
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-1">Ảnh minh họa (cover)</label>
              {imagePreview && (
                <div className="mb-3 relative inline-block">
                  <img src={imagePreview} alt="Preview" className="cursor-pointer w-56 h-36 object-cover rounded-md border" />
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(''); setShared(p => ({ ...p, image_url: '' })) }}
                    className="cursor-pointer absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    disabled={isGenerating || isUploading}
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="cursor-pointer block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={isGenerating || isUploading}
              />
              <p className="text-xs text-gray-500">PNG/JPG/GIF tối đa 5MB.</p>
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
              Hủy
            </button>
            <button
              type="submit"
              disabled={isUploading || isGenerating}
              className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 inline-flex items-center gap-2"
            >
              {(isUploading || isGenerating) && <Loader2 size={16} className="animate-spin" />}
              {isEditing ? 'Cập nhật' : 'Thêm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}