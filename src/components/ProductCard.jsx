function ProductCard({ product, onClick }) {
  return (
    <div
      className="cursor-pointer flex flex-col border border-gray-300 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
      onClick={onClick}
    >
      <div className="w-full h-60">
        <img
          src={product.image_url}
          alt={product.title}
          className="w-full h-full object-cover transition-transform hover:scale-[1.03] duration-300"
        />
      </div>

      <div className="p-2">
        <h3 className="text-sm font-medium line-clamp-1 text-center">
          {product.title}
        </h3>
      </div>
    </div>
  );
}

export default ProductCard;
