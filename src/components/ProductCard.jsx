function ProductCard({ product, onClick }) {
  return (
    <div
      className="cursor-pointer flex flex-col border border-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
      onClick={onClick}
    >
      <div className="w-full h-80">
        <img
          src={product.image_url || "/banner.jpg"}
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
