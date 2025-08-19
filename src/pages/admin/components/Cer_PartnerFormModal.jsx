// src/components/CertPartnerFormModal.jsx
import React, { useEffect, useState } from 'react';
import { X, Upload, Loader2, Image as ImageIcon, Tag } from 'lucide-react';

const TYPE_OPTIONS = [
  { value: 'certification', label: 'Certification' },
  { value: 'partner', label: 'Partner' },
  { value: 'award', label: 'Award' },
  { value: 'license', label: 'License' },
];

const typeColor = (t) => {
  switch (t) {
    case 'certification': return 'bg-blue-100 text-blue-700';
    case 'partner': return 'bg-green-100 text-green-700';
    case 'award': return 'bg-amber-100 text-amber-700';
    case 'license': return 'bg-purple-100 text-purple-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const CertPartnerFormModal = ({ isOpen, onClose, onSubmit, initialData = {} }) => {
  const [form, setForm] = useState({
    name: '',
    type: 'certification',
    content: '',
    image_url: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Nạp dữ liệu khi mở modal
  useEffect(() => {
    if (!isOpen) return;
    setForm({
      name: initialData.name || '',
      type: initialData.type || 'certification',
      content: initialData.content || '',
      image_url: initialData.image_url || '',
    });
    setImagePreview(initialData.image_url || '');
    setImageFile(null);
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh hợp lệ!');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      alert('Kích thước ảnh tối đa 8MB!');
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
    return data.url; // backend trả { url }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert('Vui lòng nhập Tên (name).');
      return;
    }
    if (!form.type) {
      alert('Vui lòng chọn Type.');
      return;
    }
    if (!form.content.trim()) {
      alert('Vui lòng nhập Nội dung.');
      return;
    }

    setIsUploading(true);
    try {
      let finalForm = { ...form };

      if (imageFile) {
        const uploadedImageUrl = await uploadImage(imageFile);
        finalForm.image_url = uploadedImageUrl;
      }

      if (initialData.id) {
        finalForm.id = initialData.id; // để backend biết là update
      }

      await onSubmit(finalForm);
      onClose();

      // reset
      setForm({ name: '', type: 'certification', content: '', image_url: '' });
      setImageFile(null);
      setImagePreview('');
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
    setForm((prev) => ({ ...prev, image_url: '' }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-xl font-semibold">
            {initialData.id ? 'Chỉnh sửa Certification/Partner' : 'Thêm Certification/Partner'}
          </h3>
          <button
            onClick={onClose}
            className="cursor-pointer text-gray-400 hover:text-gray-600"
            disabled={isUploading}
            aria-label="Đóng"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên (name) *
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Ví dụ: ISO 9001:2015 / ACME Inc."
              required
              disabled={isUploading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Tag size={16} /> Loại (type) *
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                required
                disabled={isUploading}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {/* Badge xem trước màu theo type */}
              <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${typeColor(form.type)}`}>
                {form.type}
              </span>
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nội dung (content) *
            </label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              rows={6}
              placeholder="Mô tả ngắn về chứng nhận/đối tác..."
              required
              disabled={isUploading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          {/* Image big preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ảnh (tùy chọn)
            </label>

            {imagePreview ? (
              <div className="mb-3 relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-h-[70vh] object-contain rounded-lg border bg-gray-50"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
                <button
                  type="button"
                  onClick={removeImage}
                  disabled={isUploading}
                  className="cursor-pointer absolute top-2 right-2 bg-red-500 text-white rounded px-2 py-1 text-xs hover:bg-red-600 disabled:bg-gray-400"
                >
                  Gỡ ảnh
                </button>
              </div>
            ) : (
              <div className="mb-3 w-full aspect-video rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400">
                <div className="flex items-center gap-2">
                  <ImageIcon /> Chưa có ảnh
                </div>
              </div>
            )}

            <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isUploading}
                className="hidden"
                id="certpartner-image-upload"
              />
              <label
                htmlFor="certpartner-image-upload"
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
                <span className="text-xs text-gray-400">PNG, JPG, WEBP tối đa 8MB</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="cursor-pointer px-5 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="cursor-pointer px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:bg-blue-400 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {isUploading && <Loader2 className="animate-spin" size={18} />}
              {initialData.id ? 'Cập nhật' : 'Thêm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CertPartnerFormModal;
