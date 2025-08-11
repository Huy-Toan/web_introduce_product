import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import TopNavigation from "../components/Navigation";
import Footer from "../components/Footer";
import BookCard from "../components/BookCard";
import SidebarGenres from "../components/Sidebar";
import ProductHeaderBanner from "../components/ProductBanner";
import { groupByGenre } from "../lib/utils";


function useBooks(filter, sortBy) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const params = new URLSearchParams();
        if (filter) params.append("genre", filter);
        if (sortBy) params.append("sort", sortBy);

        const url = `/api/books${params.toString() ? `?${params.toString()}` : ""}`;
        const response = await fetch(url);
        const data = await response.json();
        setBooks(data.books || []);
      } catch (error) {
        console.error("Error loading books:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [filter, sortBy]);

  return { books, loading };
}

function Products() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "");
  const [filter, setFilter] = useState(searchParams.get("genre") || null);
  const [genres, setGenres] = useState([]);
  const { books, loading } = useBooks(filter, sortBy);

  // Sync URL params with state
  useEffect(() => {
    const genreParam = searchParams.get("genre");
    const sortParam = searchParams.get("sort");
    
    setFilter(genreParam);
    setSortBy(sortParam || "");
  }, [searchParams]);

  useEffect(() => {
    const fetchAllBooks = async () => {
      try {
        const res = await fetch("/api/books");
        const data = await res.json();
        const booksArray = data.books || [];

        const groupedGenres = groupByGenre(booksArray);

        // const genreList = Object.entries(groupedGenres).map(([name, books]) => ({
        //   name,
        //   books,
        //   count: books.length
        // }));

        // setGenres(genreList);
        setGenres(groupedGenres);
      } catch (err) {
        console.error("Failed to fetch genres:", err);
      }
    };
    fetchAllBooks();
  }, []);

  const handleBookSelect = (bookId) => {
    navigate(`/product/product-detail/${bookId}`);
  };

  const handleSortChange = (e) => {
    const newSortBy = e.target.value;
    setSortBy(newSortBy);
    updateURLParams({ sort: newSortBy });
  };

  const handleSelectGenre = (genreName) => {
    setFilter(genreName || null);
    updateURLParams({ genre: genreName });
  };

  const updateURLParams = (newParams) => {
    const params = new URLSearchParams(searchParams);
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />
      <ProductHeaderBanner />
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex flex-col md:flex-row gap-6">
          <SidebarGenres
            genres={genres}
            activeGenre={filter}
            onSelectGenre={handleSelectGenre}
          />

          <div className="flex-1 space-y-6">
            <div className="flex justify-end">
              <select
                className="py-2 px-4 border border-gray-300 rounded-md bg-white"
                value={sortBy}
                onChange={handleSortChange}
              >
                <option value="">Sort by...</option>
                <option value="title_asc">Title (A-Z)</option>
                <option value="title_desc">Title (Z-A)</option>
                <option value="author_asc">Author (A-Z)</option>
                <option value="author_desc">Author (Z-A)</option>
              </select>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="h-10 w-10 border-2 border-blue-800 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {books.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onClick={() => handleBookSelect(book.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Products;