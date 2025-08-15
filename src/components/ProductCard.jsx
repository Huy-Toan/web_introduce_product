function ProductCard({ product, onClick }) {
  return (
    <div
      className="cursor-pointer flex flex-col"
      onClick={onClick}
    >
      <div className="w-full h-60">
        <img
          src={product.image_url}
          alt={product.title}
          className="w-full h-full object-cover transition-transform hover:scale-[1.03] duration-300"
        />
      </div>

      <div className="mt-2">
        <h3 className="text-sm font-medium line-clamp-1">{product.title}</h3>
      </div>
    </div>
  );
}

export default ProductCard;
