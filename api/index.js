import { Hono } from "hono";
import booksRouter from "./routes/books";
import bookRelatedRouter from "./routes/book-related";
import uploadImageRouter from "./routes/upload-image";
import editorUploadRouter from "./routes/editor-upload";
import aboutRouter from "./routes/about";
import newsRouter from "./routes/news";
import seoApp from "./routes/seo";
import categoriesRouter from "./routes/categories";
import authRouter from "./routes/auth";
import productsRouter from "./routes/products";
import contactRouter from "./routes/contact";
import userRouter from "./routes/user";

const app = new Hono();

// Setup D1 database middleware
app.use("*", async (c, next) => {
  // Check if D1 binding is available
  if (c.env.DB) {
    try {
      // Test database connection
      const testQuery = await c.env.DB.prepare("SELECT 1").first();
      c.env.DB_AVAILABLE = true;
      console.log("D1 Database connected successfully");
    } catch (error) {
      console.error("D1 Database connection error:", error);
      c.env.DB_AVAILABLE = false;
    }
  } else {
    // No D1 binding available
    console.log("No D1 database binding available");
    c.env.DB_AVAILABLE = false;
  }
  
  await next();
});

app.route("/api/auth", authRouter);
app.route("/api/users", userRouter);
app.route("/api/contacts", contactRouter);
app.route("/api/books", booksRouter);
app.route("/api/about", aboutRouter);
app.route("/api/news", newsRouter);
app.route("/api/seo", seoApp);
app.route("/api/products", productsRouter);
app.route("/api/categories", categoriesRouter);
app.route("/api/books/:id/related", bookRelatedRouter);
app.route("/api/upload-image", uploadImageRouter);
app.route("/api/editor-upload", editorUploadRouter);


// Health check endpoint
app.get("/api/health", async (c) => {
  return c.json({
    status: "ok",
    database: c.env.DB_AVAILABLE ? "connected" : "disconnected",
    timestamp: new Date().toISOString()
  });
});

// Catch-all route for static assets
app.all("*", async (c) => {
  return c.env.ASSETS.fetch(c.req.raw);
});

export default {
  fetch: app.fetch,
};