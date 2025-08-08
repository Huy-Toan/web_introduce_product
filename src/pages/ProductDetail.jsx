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
        // Fallback data for testing
        setBookData({
          book: {
            id: bookId,
            title: "Sample Book Title",
            author: "Sample Author",
            description: "This is a sample book description...",
            image_url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            genre: "Fiction",
            isbn: "978-0000000000",
            published_year: 2023,
            available_copies: 5,
            total_copies: 10
          },
          relatedBooks: []
        });
      } finally {
        setLoading(false);
      }
    };

    if (bookId) {
      fetchBookDetail();
    }
  }, [bookId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNavigation />
        <div className="flex justify-center items-center py-20">
          <div className="h-10 w-10 border-2 border-blue-800 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!bookData || !bookData.book) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNavigation />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center text-gray-600">
            <h2 className="text-2xl font-semibold mb-4">Không tìm thấy sách</h2>
            <p>Sách với ID "{bookId}" không tồn tại hoặc đã bị xóa.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <BookDetail bookData={bookData} />
      </main>
      <Footer />
    </div>
  );
}

export default BookDetailPage;