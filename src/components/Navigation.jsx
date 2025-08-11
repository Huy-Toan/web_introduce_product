import { ChevronDown, Book, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { groupByGenre } from "../lib/utils";
import { useLocation } from "react-router-dom";


function TopNavigation() {
  const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [genres, setGenres] = useState([]);
  const navigate = useNavigate();
  const { genreId } = useParams();

  const activeGenre = genreId ? decodeURIComponent(genreId) : null;

  const location = useLocation();
    const pathname = location.pathname;

    const isActive = (targetPath) => {
    if (targetPath === "/") return pathname === "/";
    return pathname.startsWith(targetPath);
    };

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await fetch("/api/books");
        const data = await res.json();
        const booksArray = data.books || [];
        const grouped = groupByGenre(booksArray);
        setGenres(grouped);
      } catch (err) {
        console.error("Failed to load genres:", err);
      }
    };
    fetchGenres();
  }, []);

  const handleGenreClick = (genreName) => {
    setIsGenreDropdownOpen(false);
    setIsMobileMenuOpen(false);
    navigate(`/genre/${encodeURIComponent(genreName)}`);
  };

  const handlePageNavigation = (pageName) => {
    setIsMobileMenuOpen(false);
    if (pageName === "home") navigate("/");
    else navigate(`/${pageName}`);
  };

  const totalBooks = genres.reduce((sum, genre) => sum + genre.books.length, 0);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="container max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Book className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-semibold text-gray-900">BookLib</span>
          </div>

          {/* Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            {["home", "about","product", "news", "contact"].map((page) => {
            const path = page === "home" ? "/" : `/${page}`;
            return (
                <button
                key={page}
                onClick={() => handlePageNavigation(page)}
                className={`px-3 py-2 rounded-md text-lg font-medium transition- cursor-pointer ${
                    isActive(path)
                    ? "text-blue-700 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
                >
                {page === "home" ? "Home" : page === "about" ? "About Us" : page ==="contact" ? "Contact" : page === "news" ? "News" : "Products"}
                </button>
            );
            })}

            {/* Genres Dropdown */}
            {/* <div className="relative">
              <button
                onClick={() => setIsGenreDropdownOpen(!isGenreDropdownOpen)}
                className="flex items-center px-3 py-2 rounded-md text-lg font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                Genres
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>

              {isGenreDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-50 max-h-80 overflow-y-auto">
                  {genres.map((genre) => (
                    <button
                      key={genre.name}
                      onClick={() => handleGenreClick(genre.name)}
                      className={`w-full text-left px-4 py-2 text-base hover:bg-gray-50 flex items-center justify-between ${
                        activeGenre === genre.name
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700"
                      }`}
                    >
                      <span>{genre.name}</span>
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                        {genre.books.length}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div> */}
          </div>

          {/* Mobile Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-2">
            <div className="space-y-1">
              {["home", "about","product", "news", "contact"].map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageNavigation(page)}
                  className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:bg-gray-50"
                >
                  {page === "home" ? "Home" : page === "about" ? "About Us" : page ==="contact" ? "Contact" : page === "news" ? "News" : "Products"}
                </button>
              ))}
            </div>

            {/* <div className="border-t border-gray-100 mt-2 pt-2">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Genres
              </div>
              {genres.map((genre) => (
                <button
                  key={genre.name}
                  onClick={() => handleGenreClick(genre.name)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                    activeGenre === genre.name
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700"
                  }`}
                >
                  <span>{genre.name}</span>
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                    {genre.books.length}
                  </span>
                </button>
              ))}
            </div> */}
          </div>
        )}
      </div>

      {isGenreDropdownOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setIsGenreDropdownOpen(false)}
        />
      )}
    </nav>
  );
}

export default TopNavigation;
