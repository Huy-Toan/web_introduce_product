import { useEffect, useState } from "react";
import { Routes, Route, useParams, useNavigate, useLocation } from "react-router-dom";
import TopNavigation from "../components/Navigation";
import Footer from "../components/Footer";
import Banner from "../components/Banner";
import ProductCategories from "../components/Categori";
import { groupByGenre } from "../lib/utils";
import TakimexWebsite from "../components/Section";

export default function HomePage() {
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
      <Footer />
    </div>
  );
}
