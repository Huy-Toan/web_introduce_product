import { Hono } from "hono";

const newsRouter = new Hono();

// Fallback sample
const fallbackNews = [
  {
    id: 1,
    title: "Website Launch",
    slug: "website-launch",
    content: "We are excited to announce the launch of our new website!",
    meta_description: "Announcement of our new website",
    keywords: "launch,website",
    image_url: "/images/news/launch.jpg",
    published_at: "2025-08-01"
  }
];

newsRouter.get("/", async (c) => {
  try {
    if (c.env.DB_AVAILABLE) {
      const result = await c.env.DB.prepare("SELECT * FROM news ORDER BY published_at DESC").all();
      return c.json({ news: result.results, source: "database" });
    } else {
      return c.json({ news: fallbackNews, source: "fallback" });
    }
  } catch (error) {
    console.error(error);
    return c.json({ error: "Failed to fetch news" }, 500);
  }
});

newsRouter.get("/:slug", async (c) => {
  const id = c.req.param("slug");
  try {
    const news = await c.env.DB.prepare("SELECT * FROM news WHERE slug = ?").bind(id).first();
    if (!news) return c.json({ error: "News not found" }, 404);
    return c.json({ news });
  } catch (e) {
    console.error(error);
    return c.json({ error: "Failed to fetch news" }, 500);
  }
});

newsRouter.post("/", async (c) => {
  try {
      const {
        title,
        slug,
        content,
        meta,
        keywords,
        image_url,
        published_at
      } = await c.req.json();
    const result = await c.env.DB.prepare(`
       INSERT INTO news (title, slug, content, meta_description, keywords, image_url, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      title,
      slug,
      content,
      meta || null,
      keywords || null,
      image_url || null,
      published_at || null
    ).run();

    const newItem = await c.env.DB.prepare("SELECT * FROM news WHERE id = ?")
      .bind(result.meta.last_row_id).first();

    return c.json({ news: newItem }, 201);
  } catch (e) {
    console.error(e);
    return c.json({ error: "Failed to create news" }, 500);
  }
});

newsRouter.put("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const {
    title,
    slug,
    content,
    meta,
    keywords,
    image_url,
    published_at
  } = await c.req.json();

  try {
    await c.env.DB.prepare(`
      UPDATE news
      SET title = ?, slug = ?, content = ?, meta_description = ?, keywords = ?, image_url = ?, published_at = ?
      WHERE id = ?
    `).bind(
      title,
      slug,
      content,
      meta || null,
      keywords || null,
      image_url || null,
      published_at || null,
      id
    ).run();

    const updated = await c.env.DB.prepare("SELECT * FROM news WHERE id = ?").bind(id).first();
    return c.json({ news: updated });
  } catch (e) {
    console.error(e);
    return c.json({ error: "Failed to update news" }, 500);
  }
});

newsRouter.delete("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  try {
    await c.env.DB.prepare("DELETE FROM news WHERE id = ?").bind(id).run();
    return c.json({ success: true });
  } catch (e) {
    console.error(e);
    return c.json({ error: "Failed to delete news" }, 500);
  }
});

export default newsRouter;
