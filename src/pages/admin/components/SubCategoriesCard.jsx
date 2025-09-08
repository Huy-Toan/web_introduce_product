import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

const SubCategoriesCard = ({ subcategories, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow flex flex-col md:flex-row w-full overflow-hidden min-h-[180px]">

      {/* Ảnh bên trái */}
      <img
        src={subcategories.image_url || "/banner.jpg"}
        alt={subcategories.name}
        className="w-48 self-stretch object-cover bg-gray-100 flex-shrink-0"
        onError={(e) => {
          e.target.src = '/banner.jpg';
        }}
      />

      {/* Nội dung ở giữa */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">{subcategories.name}</h3>
          {/* hiển thị tên danh mục cha */}
          <p className="text-xl text-gray-500 mb-2">
            Thuộc danh mục cha:{" "}
            <span className="font-medium text-gray-700">
              {subcategories.parent_name || subcategories.parent?.name || '—'}
            </span>
          </p>
          <p className="text-gray-600 text-sm line-clamp-3">
            {subcategories.description || 'Chưa có mô tả'}
          </p>
        </div>
      </div>

      {/* Nút hành động bên phải */}
      <div className="flex flex-col gap-2 p-4">
        <button
          onClick={() => onEdit(subcategories)}
          className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded flex items-center justify-center gap-1"
        >
          <Edit2 size={16} />
          Sửa
        </button>
        <button
          onClick={() => onDelete(subcategories.id)}
          className="cursor-pointer bg-red-100 hover:bg-red-200 text-red-700 py-2 px-3 rounded flex items-center justify-center gap-1"
        >
          <Trash2 size={16} />
          Xóa
        </button>
      </div>
    </div>
  );
};

export default SubCategoriesCard;
