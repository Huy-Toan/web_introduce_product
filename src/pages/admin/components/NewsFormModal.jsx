import React, { useEffect, useState } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';

const NewsFormModal = ({ isOpen, onClose, onSubmit, initialData = {} }) => {
  const [form, setForm] = useState({
    title: '',
    content: '',
    image_url: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (initialData && isOpen) {
      setForm({
        title: initialData.title || '',
        content: initialData.content || '',
        image_url: initialData.image_url || ''
      });
      setImagePreview(initialData.image_url || '');
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
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
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let finalForm = { ...form };

      if (imageFile) {
        const uploadedImageUrl = await uploadImage(imageFile);
        finalForm.image_url = uploadedImageUrl;
      }

      if (initialData.id) {
        finalForm.id = initialData.id;
      }

      onSubmit(finalForm);
      onClose();

      setForm({ title: '', content: '', image_url: '' });
      setImageFile(null);
      setImagePreview('');
    } catch (error) {
      alert('Có lỗi xảy ra khi upload ảnh. Vui lòng thử lại!');
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

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">
            {initialData.id ? 'Chỉnh sửa tin tức' : 'Thêm tin tức mới'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isUploading}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tiêu đề *
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Nhập tiêu đề tin tức"
              required
              disabled={isUploading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nội dung *
            </label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              rows={6}
              placeholder="Nhập nội dung bài viết"
              required
              disabled={isUploading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ảnh minh họa
            </label>

            {imagePreview && (
              <div className="mb-3 relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-40 h-28 object-cover rounded-md border"
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
                id="news-image-upload"
              />
              <label
                htmlFor="news-image-upload"
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
              className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUploading && <Loader2 className="animate-spin" size={16} />}
              {initialData.id ? 'Cập nhật' : 'Thêm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewsFormModal;
