import { Hono } from "hono";

// Create books router
const booksRouter = new Hono();

// Sample fallback data (nếu database không có)
const fallbackBooks = [
  {
    id: 1,
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    genre: "Fiction",
    description: "A classic American novel about racial injustice and moral growth.",
    image_url: "/images/books/mockingbird.jpg", // Changed to image_url
    published_year: 1960
  },
  {
    id: 2,
    title: "1984",
    author: "George Orwell",
    genre: "Dystopian",
    description: "A dystopian social science fiction novel about totalitarian control.",
    image_url: "/images/books/1984.jpg",
    published_year: 1949
  },
  {
    id: 3,
    title: "Pride and Prejudice",
    author: "Jane Austen",
    genre: "Romance",
    description: "A romantic novel about manners, upbringing, morality, education, and marriage.",
    image_url: "/images/books/pride.jpg",
    published_year: 1813
  }
];

// Books list endpoint with filtering and sorting
booksRouter.get("/", async (c) => {
  const { genre, sort } = c.req.query();
  console.log("Query params:", { genre, sort }); // Debug

  try {
    if (c.env.DB_AVAILABLE) {
      // Database logic with D1 - FIXED VERSION
      let query = "SELECT * FROM books";
      let params = [];

      // Apply genre filter if provided
      if (genre) {
        query += " WHERE genre = ?";
        params.push(genre);
      }

      // Apply sorting if provided
      if (sort) {
        switch (sort) {
          case "title_asc":
            query += " ORDER BY title ASC";
            break;
          case "title_desc":
            query += " ORDER BY title DESC";
            break;
          case "author_asc":
            query += " ORDER BY author ASC";
            break;
          case "author_desc":
            query += " ORDER BY author DESC";
            break;
          case "year_asc":
            query += " ORDER BY published_year ASC";
            break;
          case "year_desc":
            query += " ORDER BY published_year DESC";
            break;
          default:
            query += " ORDER BY id ASC";
            break;
        }
      }

      console.log("Executing query:", query, "with params:", params); // Debug

      // FIXED: Correct way to bind parameters
      let stmt = c.env.DB.prepare(query);
      if (params.length > 0) {
        stmt = stmt.bind(...params); // Use spread operator, not forEach
      }
      
      const result = await stmt.all();
      const books = result.results || [];

      console.log("Database results:", books.length); // Debug

      return c.json({
        books: books,
        source: "database",
        count: books.length,
        debug: { query, params } // Remove this in production
      });

    } else {
      console.log("Using fallback data"); // Debug
      
      // Fallback logic - FIXED VERSION
      let books = [...fallbackBooks];

      // Apply genre filter
      if (genre) {
        console.log("Filtering by genre:", genre); // Debug
        books = books.filter(book => 
          book.genre.toLowerCase() === genre.toLowerCase()
        );
        console.log("After genre filter:", books.length); // Debug
      }

      // Apply sorting
      if (sort) {
        console.log("Sorting by:", sort); // Debug
        switch (sort) {
          case "title_asc":
            books.sort((a, b) => a.title.localeCompare(b.title));
            break;
          case "title_desc":
            books.sort((a, b) => b.title.localeCompare(a.title));
            break;
          case "author_asc":
            books.sort((a, b) => a.author.localeCompare(b.author));
            break;
          case "author_desc":
            books.sort((a, b) => b.author.localeCompare(a.author));
            break;
          case "year_asc":
            books.sort((a, b) => a.published_year - b.published_year);
            break;
          case "year_desc":
            books.sort((a, b) => b.published_year - a.published_year);
            break;
        }
      }

      return c.json({
        books: books,
        source: "fallback",
        count: books.length,
        debug: { genre, sort, originalCount: fallbackBooks.length } // Remove this in production
      });
    }

  } catch (error) {
    console.error("Error fetching books:", error);
    return c.json({ 
      error: "Failed to fetch books",
      books: fallbackBooks,
      source: "error_fallback" 
    }, 500);
  }
});

// Book details endpoint
booksRouter.get("/:id", async (c) => {
  const bookId = parseInt(c.req.param("id"));
  console.log("Fetching book with ID:", bookId); // Debug

  try {
    if (c.env.DB_AVAILABLE) {
      // Database logic with D1
      const result = await c.env.DB.prepare("SELECT * FROM books WHERE id = ?")
        .bind(bookId)
        .first();

      if (!result) {
        return c.json({ error: "Book not found" }, 404);
      }

      return c.json({
        book: result,
        source: "database"
      });

    } else {
      // Fallback logic
      const book = fallbackBooks.find(b => b.id === bookId);

      if (!book) {
        return c.json({ error: "Book not found" }, 404);
      }

      return c.json({
        book: book,
        source: "fallback"
      });
    }

  } catch (error) {
    console.error("Error fetching book:", error);
    return c.json({ error: "Failed to fetch book" }, 500);
  }
});

// Add new book endpoint
booksRouter.post("/", async (c) => {
  try {
    if (!c.env.DB_AVAILABLE) {
      return c.json({ error: "Database not available" }, 503);
    }

    const { title, author, genre, description, image_url, published_year } = await c.req.json();

    // Validate required fields
    if (!title || !author || !genre) {
      return c.json({ error: "Missing required fields: title, author, genre" }, 400);
    }

    // Insert new book - FIXED: Use image_url instead of cover_url
    const result = await c.env.DB.prepare(`
      INSERT INTO books (title, author, genre, description, image_url, published_year)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(title, author, genre, description || null, image_url || null, published_year || null)
      .run();

    if (result.success) {
      // Get the inserted book
      const newBook = await c.env.DB.prepare("SELECT * FROM books WHERE id = ?")
        .bind(result.meta.last_row_id)
        .first();

      return c.json({
        book: newBook,
        source: "database"
      }, 201);
    } else {
      throw new Error("Failed to insert book");
    }

  } catch (error) {
    console.error("Error adding book:", error);
    return c.json({ error: "Failed to add book" }, 500);
  }
});

// Update book endpoint
booksRouter.put("/:id", async (c) => {
  const bookId = parseInt(c.req.param("id"));

  try {
    if (!c.env.DB_AVAILABLE) {
      return c.json({ error: "Database not available" }, 503);
    }

    const updates = await c.req.json();
    const { title, author, genre, description, image_url, published_year } = updates;

    // Update book - FIXED: Use image_url instead of cover_url
    const result = await c.env.DB.prepare(`
      UPDATE books 
      SET title = ?, author = ?, genre = ?, description = ?, image_url = ?, published_year = ?
      WHERE id = ?
    `).bind(title, author, genre, description, image_url, published_year, bookId)
      .run();

    if (result.changes > 0) {
      // Get updated book
      const updatedBook = await c.env.DB.prepare("SELECT * FROM books WHERE id = ?")
        .bind(bookId)
        .first();

      return c.json({
        book: updatedBook,
        source: "database"
      });
    } else {
      return c.json({ error: "Book not found" }, 404);
    }

  } catch (error) {
    console.error("Error updating book:", error);
    return c.json({ error: "Failed to update book" }, 500);
  }
});

// Delete book endpoint
booksRouter.delete("/:id", async (c) => {
  const bookId = parseInt(c.req.param("id"));

  try {
    if (!c.env.DB_AVAILABLE) {
      return c.json({ error: "Database not available" }, 503);
    }

    const result = await c.env.DB.prepare("DELETE FROM books WHERE id = ?")
      .bind(bookId)
      .run();

    if (result.changes > 0) {
      return c.json({ message: "Book deleted successfully" });
    } else {
      return c.json({ error: "Book not found" }, 404);
    }

  } catch (error) {
    console.error("Error deleting book:", error);
    return c.json({ error: "Failed to delete book" }, 500);
  }
});

export default booksRouter;