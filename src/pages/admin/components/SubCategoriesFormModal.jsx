import React, { useEffect, useMemo, useState } from 'react';
import { X, Upload, Loader2, Wand2 } from 'lucide-react';

const slugify = (s = '') =>
  s
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const isValidSlug = (s = '') => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s);

const SubCategoriesFormModal = ({ isOpen, onClose, onSubmit, initialData = {} }) => {
  const isEditing = Boolean(initialData?.id);

  const [form, setForm] = useState({
    parent_id: '',
    name: '',
    slug: '',
    description: '',
    image_url: ''
  });

  const [parents, setParents] = useState([]); // [{id,name,slug,...}]
  const [parentsLoading, setParentsLoading] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [slugError, setSlugError] = useState('');

  const selectedParent = useMemo(
    () => parents.find(p => String(p.id) === String(form.parent_id)),
    [parents, form.parent_id]
  );

  // nạp dữ liệu khi mở modal
  useEffect(() => {
    if (!isOpen) return;

    // load parents
    const fetchParents = async () => {
      try {
        setParentsLoading(true);
        // Đổi endpoint ở đây nếu bạn dùng /api/parents
        const res = await fetch('/api/parent_categories');
        const data = await res.json();
        const list = data.parents || data.parent_categories || data.items || [];
        setParents(list);
      } catch (e) {
        console.error('fetch parents error:', e);
        setParents([]);
      } finally {
        setParentsLoading(false);
      }
    };

    fetchParents();

    // set form
    setForm({
      parent_id: initialData.parent_id ?? '',
      name: initialData.name || '',
      slug: initialData.slug || '',
      description: initialData.description || '',
      image_url: initialData.image_url || ''
    });
    setImagePreview(initialData.image_url || '');
    setImageFile(null);
    setSlugError('');
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'slug') setSlugError('');
  };

  const handleSlugBlur = () => {
    if (!isEditing) return;
    const normalized = slugify(form.slug || '');
    setForm(prev => ({ ...prev, slug: normalized }));
    if (normalized && !isValidSlug(normalized)) {
      setSlugError('Slug chỉ gồm a-z, 0-9 và dấu gạch nối (-), không bắt đầu/kết thúc bằng -.');
    }
  };

  const generateSlugFromName = () => {
    const s = slugify(form.name || '');
    setForm(prev => ({ ...prev, slug: s }));
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

    // validate bắt buộc
    if (!form.parent_id) {
      alert('Vui lòng chọn Danh mục cha.');
      return;
    }
    if (!form.name?.trim()) {
      alert('Vui lòng nhập Tên danh mục con.');
      return;
    }

    // validate slug khi EDIT
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
      let finalForm = { ...form, parent_id: Number(form.parent_id) };

      if (imageFile) {
        const uploadedImageUrl = await uploadImage(imageFile);
        finalForm.image_url = uploadedImageUrl;
      }

      // thêm mới: không gửi slug → backend tự sinh
      if (!isEditing) {
        const { slug, ...rest } = finalForm;
        finalForm = rest;
      } else {
        finalForm.slug = slugify(finalForm.slug || '');
      }

      if (initialData.id) finalForm.id = initialData.id;

      await onSubmit(finalForm);
      onClose();

      // reset
      setForm({ parent_id: '', name: '', slug: '', description: '', image_url: '' });
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
    setForm(prev => ({ ...prev, image_url: '' }));
  };

  if (!isOpen) return null;

  const siteURL = import.meta?.env?.VITE_SITE_URL || '';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-xl font-semibold">
            {isEditing ? 'Chỉnh sửa Danh mục con' : 'Thêm Danh mục con mới'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isUploading}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Parent Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Danh mục cha *
            </label>
            <div className="relative">
              <select
                name="parent_id"
                value={form.parent_id}
                onChange={handleChange}
                disabled={isUploading || parentsLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">— Chọn danh mục cha —</option>
                {parents.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {parentsLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="animate-spin text-gray-400" size={18} />
                </div>
              )}
            </div>
            {selectedParent && (
              <p className="text-xs text-gray-500 mt-1">
                Đã chọn: <span className="font-medium">{selectedParent.name}</span> ({selectedParent.slug})
              </p>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên danh mục con *
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nhập tên danh mục con"
              required
              disabled={isUploading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          {/* Slug (chỉ hiện khi edit) */}
          {isEditing && (
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug (URL)
                </label>
                <button
                  type="button"
                  onClick={generateSlugFromName}
                  disabled={isUploading}
                  className="text-sm inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
                  title="Sinh slug từ tên danh mục"
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
                placeholder="vd: dien-thoai-phu-kien"
                disabled={isUploading}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 disabled:bg-gray-100 ${
                  slugError ? 'border-red-400 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {slugError ? (
                <p className="text-sm text-red-600 mt-1">{slugError}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  {siteURL ? (
                    <>
                      URL xem trước:{' '}
                      <span className="font-mono">
                        {siteURL}/categories/{selectedParent?.slug || '<parent>'}/{form.slug || '<slug>'}
                      </span>
                    </>
                  ) : (
                    <>
                      Slug dùng trong đường dẫn:{' '}
                      <span className="font-mono">
                        /categories/{selectedParent?.slug || '<parent>'}/{form.slug || '<slug>'}
                      </span>
                    </>
                  )}
                </p>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nội dung *
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={8}
              placeholder="Nhập mô tả danh mục con"
              required
              disabled={isUploading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ảnh minh họa
            </label>

            {imagePreview && (
              <div className="mb-3 relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-64 h-40 object-cover rounded-md border"
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

            <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isUploading}
                className="hidden"
                id="subcat-image-upload"
              />
              <label
                htmlFor="subcat-image-upload"
                className={`cursor-pointer flex flex-col items-center space-y-2 ${isUploading ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                {isUploading ? (
                  <Loader2 className="animate-spin text-blue-500" size={28} />
                ) : (
                  <Upload className="text-gray-400" size={28} />
                )}
                <span className="text-sm text-gray-600">
                  {isUploading ? 'Đang upload...' : 'Chọn ảnh từ máy tính'}
                </span>
                <span className="text-xs text-gray-400">PNG, JPG, GIF tối đa 5MB</span>
              </label>
            </div>
          </div>

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

export default SubCategoriesFormModal;
