import { useEffect, useState } from 'react'
import { X, Sparkles } from 'lucide-react'
import useNewsForm from '../hook/UseFormModal'

const NewsFormModal = ({ isOpen, onClose, onSubmit, initialData = {} }) => {
  const [form, setForm] = useState({
    keyword: '',
    title: '',
    meta: '',
    content: '',
    keywords: '',
    slug: '',
    image_url: ''
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const {
    uploadImage,
    generateContentFromKeyword,
    generateSEOFromContent,
    isGenerating
  } = useNewsForm(form, setForm)

  useEffect(() => {
    if (isOpen) {
      setForm({
        keyword: '',
        title: initialData.title || '',
        meta: initialData.meta || '',
        content: initialData.content || '',
        keywords: initialData.keywords || '',
        slug: initialData.slug || '',
        image_url: initialData.image_url || ''
      })
      setImagePreview(initialData.image_url || '')
    }
  }, [initialData, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return alert('Vui lòng chọn file ảnh hợp lệ!')
    if (file.size > 5 * 1024 * 1024) return alert('Ảnh không được vượt quá 5MB!')
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = ev => setImagePreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsUploading(true)
    try {
      let finalForm = { ...form }
      if (imageFile) {
        finalForm.image_url = await uploadImage(imageFile)
      }
      if (initialData.id) finalForm.id = initialData.id
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
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview('')
    setForm(prev => ({ ...prev, image_url: '' }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{initialData.id ? 'Chỉnh sửa tin tức' : 'Thêm tin tức mới'}</h3>
          <button onClick={handleClose} disabled={isUploading || isGenerating} className="text-gray-400 hover:text-gray-600">
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
                onClick={generateContentFromKeyword} 
                disabled={isGenerating || !form.keyword.trim()}
                className="px-3 py-2 bg-purple-600 text-white rounded flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700"
              >
                <Sparkles size={16} /> 
                {isGenerating ? 'Đang tạo...' : 'Tạo nội dung'}
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
            />
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

          {/* Content */}
          <div>
            <label className="block text-sm font-medium mb-1">Nội dung *</label>
            <textarea 
              name="content" 
              value={form.content} 
              onChange={handleChange} 
              rows={8} 
              required 
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" 
              disabled={isGenerating}
            />
            <div className="flex justify-between items-center mt-2">
              <div className="text-xs text-gray-500">{form.content.split(' ').filter(w => w.length > 0).length} từ</div>
              <button 
                type="button" 
                onClick={generateSEOFromContent} 
                disabled={isGenerating || !form.content.trim()}
                className="px-3 py-2 bg-blue-600 text-white rounded flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
              >
                <Sparkles size={16} /> 
                {isGenerating ? 'Đang tạo...' : 'Tạo SEO'}
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
              placeholder="url-slug-thien-thien"
            />
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium mb-1">Ảnh minh họa</label>
            {imagePreview && (
              <div className="mb-3 relative inline-block">
                <img src={imagePreview} alt="Preview" className="w-40 h-28 object-cover rounded-md border" />
                <button 
                  type="button" 
                  onClick={removeImage} 
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                >
                  <X size={12} />
                </button>
              </div>
            )}
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange} 
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
              disabled={isGenerating}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button 
              type="button" 
              onClick={handleClose} 
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              disabled={isGenerating}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              disabled={isUploading || isGenerating} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Đang lưu...' : initialData.id ? 'Cập nhật' : 'Thêm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NewsFormModal
