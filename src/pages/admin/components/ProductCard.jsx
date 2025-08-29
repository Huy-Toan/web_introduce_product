import { Edit2, Trash2 } from 'lucide-react';

const ProductCard = ({ product, onEdit, onDelete }) => {
  // Ưu tiên dùng image_url nếu có (BE trả về cover)
  // fallback: lấy từ images_json (mảng URL hoặc object {url})
  let cover = product.image_url || "";
  if (!cover && product.images_json) {
    try {
      const arr = Array.isArray(product.images_json)
        ? product.images_json
        : JSON.parse(product.images_json);
      if (Array.isArray(arr) && arr.length) {
        const primary = arr.find(it => it.is_primary === 1) || arr[0];
        cover = primary?.url || "";
      }
    } catch {
      // ignore parse error
    }
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {cover ? (
        <img
          src={cover}
          alt={product.title}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
          Không có ảnh
        </div>
      )}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
          {product.title}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(product)}
            className="cursor-pointer flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded flex items-center justify-center gap-1"
          >
            <Edit2 size={16} />
            Sửa
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="cursor-pointer flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 px-3 rounded flex items-center justify-center gap-1"
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
