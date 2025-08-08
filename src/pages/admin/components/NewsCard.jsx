import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

const Newscard = ({ news, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <img
        src={news.image_url}
        alt={news.title}
        className="w-full h-48 object-cover"
        onError={(e) => {
          e.target.src = 'fallback_url.jpg';
        }}
      />
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{news.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {news.content || 'Chưa có mô tả'}
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(news)}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded flex items-center justify-center gap-1"
          >
            <Edit2 size={16} />
            Sửa
          </button>
          <button
            onClick={() => onDelete(news.id)}
            className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 px-3 rounded flex items-center justify-center gap-1"
          >
            <Trash2 size={16} />
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

export default Newscard;
