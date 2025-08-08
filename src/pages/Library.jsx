import { useEffect, useState } from "react";
import { Routes, Route, useParams, useNavigate, useLocation } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import BooksList from "../components/BooksList";
import BookDetail from "./ProductDetail";
import TopNavigation from "../components/Navigation";
import Footer from "../components/Footer";
import Banner from "../components/Banner";
import ProductCategories from "../components/Categori";
import { groupByGenre } from "../lib/utils";
import TakimexWebsite from "../components/Section";

export default function LibraryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const { genreId, bookId } = params;
  const activeGenre = genreId ? decodeURIComponent(genreId) : null;

  const [genres, setGenres] = useState([]);
  const [dataSource, setDataSource] = useState(null);
  const [bookDetail, setBookDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadGenres = async () => {
      try {
        const res = await fetch("/api/books");
        const data = await res.json();
        const booksArray = data.books || [];

        if (data.source) setDataSource(data.source);
        setGenres(groupByGenre(booksArray));
      } catch (err) {
        console.error("Failed to load genres:", err);
      }
    };

    loadGenres();
  }, []);

  useEffect(() => {
    if (!bookId) return;

    const fetchBookDetail = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/books/${bookId}`);
        const bookData = await res.json();

        const relatedRes = await fetch(`/api/books/${bookId}/related`);
        const relatedData = await relatedRes.json();

        setBookDetail({
          book: bookData.book,
          relatedBooks: relatedData.relatedBooks,
          recentRecommendations: relatedData.recentRecommendations,
          genreStats: relatedData.genreStats,
        });
      } catch (err) {
        console.error("Failed to load book detail:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetail();
  }, [bookId]);

  const handleSelectGenre = (genre) => {
    navigate(genre ? `/genre/${encodeURIComponent(genre)}` : "/");
  };

  const handleSelectBook = (bookId) => {
    navigate(`/book/${bookId}`);
  };

  const isBookDetailPage = location.pathname.startsWith("/book/");

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation
        genres={genres}
        activeGenre={activeGenre}
        onSelectGenre={handleSelectGenre}
      />

      <Banner />
      <ProductCategories />
      <TakimexWebsite />

      {/* <main className="container mx-auto px-4 py-6 mt-12 max-w-7xl">
        {isBookDetailPage ? (
          loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="h-10 w-10 border-2 border-blue-800 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : bookDetail ? (
            <BookDetail bookData={bookDetail} />
          ) : (
            <div className="text-center py-20 text-gray-600">
              Error loading book details
            </div>
          )
        ) : (
          <>
            <Breadcrumbs
              items={[
                { label: "All Books", value: null },
                ...(activeGenre ? [{ label: activeGenre, value: activeGenre }] : []),
              ]}
              onNavigate={handleSelectGenre}
            />
            <BooksList
              onSelectBook={handleSelectBook}
              filter={activeGenre}
            />
          </>
        )}
      </main> */}

      <Footer />
    </div>
  );
}
