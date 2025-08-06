import { Hono } from "hono";

// Create book related router
const bookRelatedRouter = new Hono();

// Sample fallback data for related books
const fallbackRelatedData = {
  relatedBooks: [
    {
      id: 2,
      title: "1984",
      author: "George Orwell",
      genre: "Dystopian",
      image_url: "https://example.com/1984.jpg"
    },
    {
      id: 3,
      title: "Pride and Prejudice", 
      author: "Jane Austen",
      genre: "Romance",
      image_url: "https://example.com/pride.jpg"
    }
  ],
  recentRecommendations: [
    {
      id: 1,
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      genre: "Fiction",
      image_url: "https://example.com/mockingbird.jpg"
    }
  ],
  genreStats: [
    { genre: "Fiction", count: 5 },
    { genre: "Romance", count: 3 },
    { genre: "Dystopian", count: 2 }
  ]
};

// Related books endpoint
bookRelatedRouter.get("/", async (c) => {
  const bookId = parseInt(c.req.param("id"));
  console.log("Fetching related books for ID:", bookId); // Debug

  try {
    if (c.env.DB_AVAILABLE) {
      // Database logic with D1
      
      // First get the main book to know its genre
      const book = await c.env.DB.prepare("SELECT * FROM books WHERE id = ?")
        .bind(bookId)
        .first();

      if (!book) {
        return c.json({ error: "Book not found" }, 404);
      }

      const bookGenre = book.genre;
      let relatedBooks = [];
      let recentBooks = [];
      let genreCounts = [];

      // Get related books in same genre (excluding current book)
      const relatedResult = await c.env.DB.prepare(`
        SELECT * FROM books 
        WHERE genre = ? AND id != ? 
        LIMIT 5
      `).bind(bookGenre, bookId).all();
      
      relatedBooks = relatedResult.results || [];

      // Get genre statistics
      const genreStatsResult = await c.env.DB.prepare(`
        SELECT genre, COUNT(*) as count 
        FROM books 
        GROUP BY genre 
        ORDER BY count DESC
      `).all();
      
      genreCounts = genreStatsResult.results || [];

      // Get recent books (excluding current book)
      const recentResult = await c.env.DB.prepare(`
        SELECT * FROM books 
        WHERE id != ? 
        ORDER BY created_at DESC 
        LIMIT 3
      `).bind(bookId).all();
      
      recentBooks = recentResult.results || [];

      return c.json({
        bookId: bookId,
        bookGenre: bookGenre,
        relatedBooks: relatedBooks,
        recentRecommendations: recentBooks,
        genreStats: genreCounts,
        source: "database",
      });

    } else {
      // Fallback logic
      const book = { id: bookId, genre: "Fiction" }; // Mock book data
      
      return c.json({
        bookId: bookId,
        bookGenre: book.genre,
        relatedBooks: fallbackRelatedData.relatedBooks.filter(b => b.id !== bookId),
        recentRecommendations: fallbackRelatedData.recentRecommendations.filter(b => b.id !== bookId),
        genreStats: fallbackRelatedData.genreStats,
        source: "fallback",
      });
    }

  } catch (error) {
    console.error("Error fetching related book data:", error);
    return c.json({ 
      error: "Failed to fetch related books",
      bookId: bookId,
      relatedBooks: [],
      recentRecommendations: [],
      genreStats: [],
      source: "error_fallback"
    }, 500);
  }
});

export default bookRelatedRouter;