import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TopNavigation from "../components/Navigation";
import Footer from "../components/Footer";
import BookDetail from "../components/BookDetail";

function BookDetailPage() {
  const { bookId } = useParams();
  const [bookData, setBookData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookDetail = async () => {
      try {
        const bookRes = await fetch(`/api/books/${bookId}`);
        const book = await bookRes.json();

        const relatedRes = await fetch(`/api/books/${bookId}/related`);
        const related = await relatedRes.json();

        setBookData({
          book: book.book,
          relatedBooks: related.relatedBooks || [],
        });
      } catch (err) {
        console.error("Failed to load book data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetail();
  }, [bookId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="h-10 w-10 border-2 border-blue-800 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!bookData) {
    return (
      <div className="text-center py-20 text-gray-600">
        Không tìm thấy sách.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto max-w-8xl">
        <BookDetail bookData={bookData} />
      </main>
    </div>
  );
}

export default BookDetailPage;
