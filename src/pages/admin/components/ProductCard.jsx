import { Edit2, Trash2 } from 'lucide-react';

const ProductCard = ({ product, onEdit, onDelete }) => {
  console.log("Rendering ProductCard for:", product);
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <img
        src={product.image_url}
        alt={product.title}
        className="w-full h-48 object-cover"
        onError={(e) => {
          e.target.src = 'fallback_url.jpg';
        }}
      />
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{product.title}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(product)}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded flex items-center justify-center gap-1"
          >
            <Edit2 size={16} />
            Sửa
          </button>
          <button
            onClick={() => onDelete(product.id)}
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

export default ProductCard;
