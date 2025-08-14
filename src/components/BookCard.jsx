function BookCard({ book, onClick }) {
  return (
    <div className="book-card cursor-pointer" onClick={onClick}>
      <div className="book-card-image">
        <img
          src={book.image_url}
          alt={book.title}
          className="w-full h-full object-contain transition-transform hover:scale-[1.03] duration-300"
        />
      </div>
      <div className="book-card-content">
        <h3 className="text-lg font-serif mb-1 line-clamp-1">{book.title}</h3>
      </div>
    </div>
  );
}

export default BookCard;
