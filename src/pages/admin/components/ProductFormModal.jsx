import React, { useEffect, useMemo, useState, useRef } from 'react';
import { X, Upload, Loader2, Wand2 } from 'lucide-react';
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

const ProductFormModal = ({ isOpen, onClose, onSubmit, initialData = {} }) => {
  const isEditing = Boolean(initialData?.id);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',      // <-- Markdown từ EditorMd sẽ nằm ở đây
    image_url: '',
    category_id: null,
  });

  // (tuỳ chọn) nếu muốn lưu thêm HTML đã render:
  const [contentHTML, setContentHTML] = useState('');

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [slugError, setSlugError] = useState('');

  // Categories
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(false);

  // Ref tới EditorMd để có thể refresh/đổi readOnly
  const editorRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        setCatLoading(true);
        const res = await fetch('/api/categories');
        const data = await res.json();
        setCategories(data?.categories || []);
      } catch (e) {
        console.error('Load categories error:', e);
        setCategories([]);
      } finally {
        setCatLoading(false);
      }
    })();
  }, [isOpen]);

  useEffect(() => {
    if (initialData && isOpen) {
      setForm({
        title: initialData.title || '',
        slug: initialData.slug || '',
        description: initialData.description || '',
        content: initialData.content || '',
        image_url: initialData.image_url || '',
        category_id:
          typeof initialData.category_id === 'number'
            ? initialData.category_id
            : null,
      });
      setImagePreview(initialData.image_url || '');
      setSlugError('');
      // làm mới editor khi mở modal
      setTimeout(() => editorRef.current?.refresh?.(), 0);
    }
  }, [initialData, isOpen]);

  // Toggle readOnly khi đang upload
  useEffect(() => {
    if (!editorRef.current?.cm) return;
    editorRef.current.cm.setOption('readOnly', isUploading ? 'nocursor' : false);
  }, [isUploading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'category_id') {
      setForm((prev) => ({ ...prev, category_id: value ? Number(value) : null }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'slug') setSlugError('');
  };

  const handleSlugBlur = () => {
    if (!isEditing) return;
    const normalized = slugify(form.slug || '');
    setForm((prev) => ({ ...prev, slug: normalized }));
    if (normalized && !isValidSlug(normalized)) {
      setSlugError('Slug chỉ gồm a-z, 0-9 và dấu gạch nối (-), không bắt đầu/kết thúc bằng -.');
    }
  };

  const generateSlugFromTitle = () => {
    const s = slugify(form.title || '');
    setForm((prev) => ({ ...prev, slug: s }));
    setSlugError(s && !isValidSlug(s) ? 'Slug không hợp lệ.' : '');
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh hợp lệ!');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước ảnh không được vượt quá 5MB!');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (evt) => setImagePreview(evt.target.result);
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

    // Validate bắt buộc theo schema: title, content
    if (!form.title?.trim()) {
      alert('Vui lòng nhập Tên sản phẩm');
      return;
    }
    if (!form.content?.trim()) {
      alert('Vui lòng nhập Nội dung sản phẩm');
      return;
    }
    if (isEditing) {
      if (!form.slug) {
        setSlugError('Vui lòng nhập slug hoặc dùng “Tạo từ tên”.');
        return;
      }
      if (!isValidSlug(form.slug)) {
        setSlugError('Slug không hợp lệ.');
        return;
      }
    }

    setIsUploading(true);
    try {
      let finalForm = { ...form };

      if (imageFile) {
        const uploadedImageUrl = await uploadImage(imageFile);
        finalForm.image_url = uploadedImageUrl;
      }

      // Thêm mới: không gửi slug để backend tự sinh
      if (!isEditing) {
        const { slug, ...rest } = finalForm;
        finalForm = rest;
      } else {
        // Edit: chuẩn hóa slug lần cuối
        finalForm.slug = slugify(finalForm.slug || '');
      }

      if (initialData.id) finalForm.id = initialData.id;

      // (tuỳ chọn) nếu muốn gửi luôn HTML:
      // finalForm.content_html = contentHTML;

      onSubmit(finalForm);
      onClose();

      // Reset form
      setForm({
        title: '',
        slug: '',
        description: '',
        content: '',
        image_url: '',
        category_id: null,
      });
      setContentHTML('');
      setImageFile(null);
      setImagePreview('');
      setSlugError('');
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
    setForm((prev) => ({ ...prev, image_url: '' }));
  };

  if (!isOpen) return null;

  const siteURL = import.meta?.env?.VITE_SITE_URL || '';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">
            {isEditing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 cursor-pointer hover:text-gray-600"
            disabled={isUploading}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên sản phẩm *
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Nhập tên sản phẩm"
              required
              disabled={isUploading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          {/* Slug chỉ hiển thị khi EDIT */}
          {isEditing && (
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug (URL)
                </label>
                <button
                  type="button"
                  onClick={generateSlugFromTitle}
                  disabled={isUploading}
                  className="cursor-pointer text-sm inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
                  title="Sinh slug từ tên sản phẩm"
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
                placeholder="vd: ao-thun-basic"
                disabled={isUploading}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 disabled:bg-gray-100 ${
                  slugError ? 'border-red-400 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {slugError ? (
                <p className="text-sm text-red-600 mt-1">{slugError}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  {siteURL
                    ? <>URL xem trước: <span className="font-mono">{siteURL}/products/{form.slug || '<slug>'}</span></>
                    : <>Slug dùng trong đường dẫn: <span className="font-mono">/products/{form.slug || '<slug>'}</span></>
                  }
                </p>
              )}
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Danh mục
            </label>
            <select
              name="category_id"
              value={form.category_id ?? ''}
              onChange={handleChange}
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
            <p className="text-xs text-gray-500 mt-1">
              Chọn danh mục để gán cho sản phẩm (có thể bỏ trống).
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả ngắn
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Mô tả ngắn về sản phẩm"
              disabled={isUploading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          {/* Content (bắt buộc theo schema) — EditorMd */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nội dung chi tiết *
            </label>

            <div className="relative">
              <EditorMd
                ref={editorRef}
                value={form.content}
                height={500}
                onChangeMarkdown={(md) => setForm((f) => ({ ...f, content: md }))}
                onChangeHTML={(html) => setContentHTML(html)} // tuỳ chọn
                onReady={() => {
                  editorRef.current?.refresh?.();
                }}
              />
              {isUploading && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] cursor-not-allowed flex items-center justify-center rounded-md">
                  <span className="text-sm text-gray-600">Đang tải lên…</span>
                </div>
              )}
            </div>

          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hình ảnh sản phẩm
            </label>

            {imagePreview && (
              <div className="mb-3 relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-40 h-40 object-cover rounded-md border"
                />
                <button
                  type="button"
                  onClick={removeImage}
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
                onChange={handleImageChange}
                disabled={isUploading}
                className="hidden"
                id="product-image-upload"
              />
              <label
                htmlFor="product-image-upload"
                className={`cursor-pointer flex flex-col items-center space-y-2 ${isUploading ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                {isUploading ? (
                  <Loader2 className="animate-spin text-blue-500" size={24} />
                ) : (
                  <Upload className="text-gray-400" size={24} />
                )}
                <span className="text-sm text-gray-600">
                  {isUploading ? 'Đang upload...' : 'Chọn ảnh từ máy tính'}
                </span>
                <span className="text-xs text-gray-400">
                  PNG, JPG, GIF tối đa 5MB
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="cursor-pointer px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
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

export default ProductFormModal;
