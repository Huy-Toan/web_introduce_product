import { Edit2, Trash2 } from "lucide-react";

const typeColors = {
  certification: "bg-blue-100 text-blue-700",
  partner: "bg-green-100 text-green-700",
  default: "bg-gray-100 text-gray-700",
};

const Cer_PartnerCard = ({ cer_partner, onEdit, onDelete }) => {
  const typeClass = typeColors[cer_partner.type] || typeColors.default;

  return (
    <div className="bg-white rounded-lg shadow flex flex-col md:flex-row w-full overflow-hidden min-h-[180px]">
      {/* Ảnh bên trái */}
      <img
        src={cer_partner.image_url}
        alt={cer_partner.name}
        className="w-48 h-full object-contain bg-gray-50 flex-shrink-0"
        onError={(e) => {
          e.target.src = "/banner.jpg";
        }}
      />

      {/* Nội dung ở giữa */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-gray-900 text-lg mb-1">
            {cer_partner.name}
          </h3>
          <p className="text-gray-600 text-sm mb-3">{cer_partner.content}</p>
        </div>

        {/* Type hiển thị dạng badge */}
        <span
          className={`inline-block px-3 py-1 text-xl font-medium rounded-full ${typeClass}`}
        >
          {cer_partner.type}
        </span>
      </div>

      {/* Nút hành động bên phải */}
      <div className="flex flex-col gap-2 p-4">
        <button
          onClick={() => onEdit(cer_partner)}
          className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded flex items-center justify-center gap-1"
        >
          <Edit2 size={16} />
          Sửa
        </button>
        <button
          onClick={() => onDelete(cer_partner.id)}
          className="cursor-pointer bg-red-100 hover:bg-red-200 text-red-700 py-2 px-3 rounded flex items-center justify-center gap-1"
        >
          <Trash2 size={16} />
          Xóa
        </button>
      </div>
    </div>
  );
};

export default Cer_PartnerCard;
