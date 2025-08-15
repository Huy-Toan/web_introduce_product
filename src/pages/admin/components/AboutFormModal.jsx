import React, { useEffect, useRef, useState } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import EditorMd from './EditorMd';

const AboutFormModal = ({ isOpen, onClose, onSubmit, initialData = {} }) => {
  const [form, setForm] = useState({
    title: '',
    content: '',       // Markdown từ EditorMd
    image_url: ''
  });

  // (tuỳ chọn) nếu muốn lưu thêm HTML đã render:
  const [contentHTML, setContentHTML] = useState('');

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Ref tới EditorMd để refresh / set readOnly
  const editorRef = useRef(null);

  useEffect(() => {
    if (initialData && isOpen) {
      setForm({
        title: initialData.title || '',
        content: initialData.content || '',
        image_url: initialData.image_url || ''
      });
      setImagePreview(initialData.image_url || '');
      setTimeout(() => editorRef.current?.refresh?.(), 0); // đảm bảo layout khi nằm trong modal
    }
  }, [initialData, isOpen]);

  // Toggle readOnly khi đang upload
  useEffect(() => {
    if (!editorRef.current?.cm) return;
    editorRef.current.cm.setOption('readOnly', isUploading ? 'nocursor' : false);
  }, [isUploading]);

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

    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Upload failed');
    const data = await response.json();
    return data.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate bắt buộc: title + content
    if (!form.title?.trim()) {
      alert('Vui lòng nhập Tiêu đề');
      return;
    }
    if (!form.content?.trim()) {
      alert('Vui lòng nhập Nội dung');
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
        finalForm.id = initialData.id;
      }

      // (tuỳ chọn) nếu muốn gửi luôn HTML:
      // finalForm.content_html = contentHTML;

      onSubmit(finalForm);
      onClose();

      // reset
      setForm({ title: '', content: '', image_url: '' });
      setContentHTML('');
      setImageFile(null);
      setImagePreview('');
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

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-xl font-semibold">
            {initialData.id ? 'Chỉnh sửa Giới thiệu' : 'Thêm Giới thiệu mới'}
          </h3>
          <button
            onClick={onClose}
            className="cursor-pointer text-gray-400 hover:text-gray-600"
            disabled={isUploading}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tiêu đề *
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Nhập tiêu đề phần Giới thiệu"
              required
              disabled={isUploading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          {/* Content — EditorMd */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nội dung *
            </label>
            <div className="relative">
              <EditorMd
                ref={editorRef}
                value={form.content}
                height={500}
                onChangeMarkdown={(md) => setForm((f) => ({ ...f, content: md }))}
                onChangeHTML={(html) => setContentHTML(html)} // tuỳ chọn
                onReady={() => {
                  // editorRef.current?.cm?.focus();
                  editorRef.current?.refresh?.();
                }}
              />
              {isUploading && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] cursor-not-allowed flex items-center justify-center rounded-md">
                  <span className="text-sm text-gray-600">Đang tải lên…</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Hỗ trợ Markdown
            </p>
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
                  {isUploading ? 'Đang upload...' : 'Chọn ảnh từ máy tính'}
                </span>
                <span className="text-xs text-gray-400">
                  PNG, JPG, GIF tối đa 5MB
                </span>
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
              className="cursor-pointer px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
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

export default AboutFormModal;
