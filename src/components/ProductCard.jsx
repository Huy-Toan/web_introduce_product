function productCard({ product, onClick }) {
  return (
    <div className="book-card cursor-pointer" onClick={onClick}>
      <div className="book-card-image">
        <img
          src={product.image_url}
          alt={product.title}
          className="w-full h-full object-contain transition-transform hover:scale-[1.03] duration-300"
        />
      </div>
      <div className="book-card-content">
        <h3 className="text-lg font-serif mb-1 line-clamp-1">{product.title}</h3>
      </div>
    </div>
  );
}

export default productCard;
