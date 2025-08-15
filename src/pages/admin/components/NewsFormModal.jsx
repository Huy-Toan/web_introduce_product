import { useEffect, useMemo, useRef, useState } from 'react'
import { X, Sparkles, ImagePlus } from 'lucide-react'
import EditorMd from './EditorMd'
import { marked } from 'marked'
import useNewsForm from '../hook/UseFormModal'
import TurndownService from 'turndown'

const slugify = (s = '') =>
  s.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')



export default function NewsFormModal({ isOpen, onClose, onSubmit, initialData = {} }) {
  const [form, setForm] = useState({
    keyword: '', title: '', meta: '', content: '', keywords: '', slug: '', image_url: ''
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  const { uploadImage, generateContentFromKeyword, generateSEOFromContent, isGenerating } =
    useNewsForm(form, setForm)

  // Markdown hiện có trong editor
  const [md, setMd] = useState('')
  const editorRef = useRef(null)
  const filePickerRef = useRef(null)
  const tempImages = useRef(new Map()) 

  // Nếu content cũ là HTML thì convert sang MD để nạp vào Editor.md
  const initialMarkdown = useMemo(() => {
    const src = (initialData.content || '').trim()
    if (!src) return ''
    const hasTags = /<\/?[a-z][\s\S]*>/i.test(src)
    return hasTags ? new TurndownService().turndown(src) : src
  }, [initialData.content, isOpen])

  // Khi mở modal: fill form + chuẩn bị editor + ảnh cover
  useEffect(() => {
    if (!isOpen) return
    setForm(prev => ({
      ...prev,
      keyword: '',
      title: initialData.title || '',
      meta: initialData.meta_description || '',
      content: initialData.content || '',
      keywords: initialData.keywords || '',
      slug: initialData.slug || '',
      image_url: initialData.image_url || ''
    }))
    setImagePreview(initialData.image_url || '')
    setMd(initialMarkdown)
    tempImages.current.clear()

    requestAnimationFrame(() => editorRef.current?.cm?.refresh())
  }, [initialData, isOpen, initialMarkdown])

  
  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'title') {
      setForm(prev => ({ ...prev, title: value, slug: prev.slug || slugify(value) }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
  }

  // Ảnh cover
  const handleImageChange = (e) => {
    const f = e.target.files?.[0]; if (!f) return
    if (!f.type.startsWith('image/')) return alert('Vui lòng chọn file ảnh!')
    if (f.size > 5 * 1024 * 1024) return alert('Ảnh không vượt 5MB!')
    setImageFile(f)
    const r = new FileReader()
    r.onload = ev => setImagePreview(ev.target.result)
    r.readAsDataURL(f)
  }

  // Chèn ảnh xem trước vào Markdown (blob:)
  const pickInlineImage = async (e) => {
    const f = e.target.files?.[0]; if (!f) return
    const blobUrl = URL.createObjectURL(f)
    tempImages.current.set(blobUrl, f)
    editorRef.current?.insertValue(`\n![](${blobUrl})\n`)
    e.target.value = ''
  }

  const handleGenerateClick = async () => {
    const out = await generateContentFromKeyword()
    const src = (typeof out === 'string' && out.trim()) ? out : (form.content || '')
    if (!src) return
    const hasTags = /<\/?[a-z][\s\S]*>/i.test(src)
    const newMd = hasTags ? new TurndownService().turndown(src) : src

    setMd(newMd)
    requestAnimationFrame(() => editorRef.current?.refresh());
  }

  // Upload ảnh tạm & thay URL trong MD trước khi lưu
  async function replaceTempImagesInMarkdown(markdown) {
    let out = markdown
    const re = /!\[[^\]]*]\(([^)]+)\)/g
    const jobs = []
    for (const m of markdown.matchAll(re)) {
      const url = m[1]
      if (url.startsWith('blob:')) {
        const file = tempImages.current.get(url)
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

const handleSubmit = async (e) => {
  e.preventDefault()
  setIsUploading(true)
  try {
    let finalForm = { ...form }

    if (!finalForm.slug && finalForm.title) finalForm.slug = slugify(finalForm.title)

    if (imageFile) finalForm.image_url = await uploadImage(imageFile)

    // Chuẩn bị mdClean từ md để dùng cho nhánh "sửa"
    let mdClean = md || ''
    if (/blob:|data:image\//.test(mdClean)) {
      mdClean = await replaceTempImagesInMarkdown(mdClean)
    }

    if (initialData.id) {
      finalForm.content = (mdClean || '').trim()
    } else {
      finalForm.content = (form.content || '').trim()
    }

    if (initialData.id) finalForm.id = initialData.id

    console.log('Submitting:', finalForm)
    onSubmit(finalForm)
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
    setForm({ keyword: '', title: '', meta: '', content: '', keywords: '', slug: '', image_url: '' })
    setImageFile(null)
    setImagePreview('')
    setMd('')
    tempImages.current.clear()
  }

  if (!isOpen) return null

  // Đếm từ từ HTML (loại thẻ)
  const wordCount = (md.replace(/<[^>]+>/g, ' ').trim().match(/\S+/g) || []).length

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[100vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{initialData.id ? 'Chỉnh sửa tin tức' : 'Thêm tin tức mới'}</h3>
          <button onClick={handleClose} disabled={isUploading || isGenerating} className="cursor-pointer text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Keyword */}
          <div>
            <label className="block text-sm font-medium mb-1">Từ khóa</label>
            <div className="flex gap-2">
              <input
                name="keyword"
                value={form.keyword}
                onChange={handleChange}
                placeholder="Nhập từ khóa..."
                className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-purple-500"
                disabled={isGenerating}
              />
              <button
                type="button"
                onClick={handleGenerateClick}
                disabled={isGenerating || !form.keyword.trim()}
                className="cursor-pointer px-3 py-2 bg-purple-600 text-white rounded flex items-center gap-1 disabled:opacity-50 hover:bg-purple-700"
              >
                <Sparkles size={16} /> {isGenerating ? 'Đang tạo...' : 'Tạo nội dung'}
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">Tiêu đề *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              disabled={isGenerating}
              maxLength={90}
            />
            <div className="text-xs text-gray-500 mt-1">{form.title.length}/60–90 ký tự gợi ý</div>
          </div>

          {/* Meta */}
          <div>
            <label className="block text-sm font-medium mb-1">Meta description</label>
            <input
              name="meta"
              value={form.meta}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              disabled={isGenerating}
              maxLength={160}
            />
            <div className="text-xs text-gray-500 mt-1">{form.meta.length}/160 ký tự</div>
          </div>

          {/* Content + chèn ảnh xem trước */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium mb-1">Nội dung *</label>
              <div className="flex items-center gap-2">
                <input type="file" accept="image/*" ref={filePickerRef} onChange={pickInlineImage} hidden />
                <button
                  type="button"
                  onClick={() => filePickerRef.current?.click()}
                  className="cursor-pointer px-2 py-1 border rounded text-sm flex items-center gap-1 hover:bg-gray-50"
                >
                  <ImagePlus size={16} /> Chèn ảnh
                </button>
              </div>
            </div>

            <EditorMd
              ref={editorRef}
              value={form.content || md}              
              onReady={(inst) => {
                requestAnimationFrame(() => inst.cm.refresh());
              }}
              onChangeMarkdown={(val) => {
                setMd(val)
                setForm(prev => ({ ...prev, content: val }))
              }}
            />

            <div className="flex justify-between items-center mt-2">
              <div className="text-xs text-gray-500">{wordCount} từ</div>
              <button
                type="button"
                onClick={generateSEOFromContent}
                disabled={isGenerating || !md.trim()}
                className="cursor-pointer px-3 py-2 bg-blue-600 text-white rounded flex items-center gap-1 disabled:opacity-50 hover:bg-blue-700"
              >
                <Sparkles size={16} /> {isGenerating ? 'Đang tạo...' : 'Tạo SEO'}
              </button>
            </div>
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-sm font-medium mb-1">Từ khóa SEO</label>
            <input
              name="keywords"
              value={form.keywords}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              disabled={isGenerating}
              placeholder="keyword1, keyword2, keyword3..."
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium mb-1">Slug</label>
            <input
              name="slug"
              value={form.slug}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              disabled={isGenerating}
              placeholder="url-slug-than-thien-seo"
            />
          </div>

          {/* Cover image */}
          <div>
            <label className="block text-sm font-medium mb-1">Ảnh minh họa</label>
            {imagePreview && (
              <div className="mb-3 relative inline-block">
                <img src={imagePreview} alt="Preview" className="cursor-pointer w-40 h-28 object-cover rounded-md border" />
                <button
                  type="button"
                  onClick={() => { setImageFile(null); setImagePreview(''); setForm(p => ({ ...p, image_url: '' })) }}
                  className="cursor-pointer absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
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
              disabled={isGenerating}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="cursor-pointer px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              disabled={isGenerating}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isUploading || isGenerating}
              className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isUploading ? 'Đang lưu...' : initialData.id ? 'Cập nhật' : 'Thêm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
