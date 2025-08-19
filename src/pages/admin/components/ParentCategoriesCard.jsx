import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

const ParentCategoriesCard = ({ parentcategories, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow flex flex-col md:flex-row w-full overflow-hidden min-h-[180px]">

      {/* Ảnh bên trái */}
        <img
        src={parentcategories.image_url}
        alt={parentcategories.name}
        className="w-48 h-full object-contain bg-gray-100 flex-shrink-0"
        onError={(e) => {
            e.target.src = 'fallback_url.jpg';
        }}
        />
      {/* Nội dung ở giữa */}
      <div className="flex-1 p-4">
        <h3 className="font-semibold text-gray-900 mb-2">{parentcategories.name}</h3>
        <p className="text-gray-600 text-sm line-clamp-3">
          {parentcategories.description || 'Chưa có mô tả'}
        </p>
      </div>

      {/* Nút hành động bên phải */}
      <div className="flex flex-col gap-2 p-4">
        <button
          onClick={() => onEdit(parentcategories)}
          className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded flex items-center justify-center gap-1"
        >
          <Edit2 size={16} />
          Sửa
        </button>
        <button
          onClick={() => onDelete(categories.id)}
          className="cursor-pointer bg-red-100 hover:bg-red-200 text-red-700 py-2 px-3 rounded flex items-center justify-center gap-1"
        >
          <Trash2 size={16} />
          Xóa
        </button>
      </div>
    </div>
  );
};

export default ParentCategoriesCard;

