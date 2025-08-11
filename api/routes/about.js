import { Hono } from "hono";

const aboutRouter = new Hono();

const fallbackAbout = [
  {
    id: 1,
    title: "About Our Library",
    content: "We are a community-driven library offering a wide range of books to readers of all ages.",
    image_url: "/images/about/library.jpg"
  }
];

aboutRouter.get("/", async (c) => {
  try {
    if (c.env.DB_AVAILABLE) {
      const result = await c.env.DB.prepare("SELECT * FROM about_us").all();
      return c.json({ about: result.results, source: "database" });
    } else {
      return c.json({ about: fallbackAbout, source: "fallback" });
    }
  } catch (error) {
    return c.json({ error: "Failed to fetch about us" }, 500);
  }
});

aboutRouter.get("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  try {
    const item = await c.env.DB.prepare("SELECT * FROM about_us WHERE id = ?").bind(id).first();
    if (!item) return c.json({ error: "Not found" }, 404);
    return c.json({ about: item });
  } catch (e) {
    return c.json({ error: "Failed to fetch about" }, 500);
  }
});

aboutRouter.post("/", async (c) => {
  try {
    const { title, content, image_url } = await c.req.json();
    const result = await c.env.DB.prepare(`
      INSERT INTO about_us (title, content, image_url)
      VALUES (?, ?, ?)
    `).bind(title, content, image_url || null).run();

    const newItem = await c.env.DB.prepare("SELECT * FROM about_us WHERE id = ?")
      .bind(result.meta.last_row_id).first();

    return c.json({ about: newItem }, 201);
  } catch (e) {
    return c.json({ error: "Failed to create about" }, 500);
  }
});

aboutRouter.put("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const { title, content, image_url } = await c.req.json();
  try {
    await c.env.DB.prepare(`
      UPDATE about_us SET title = ?, content = ?, image_url = ? WHERE id = ?
    `).bind(title, content, image_url, id).run();

    const updated = await c.env.DB.prepare("SELECT * FROM about_us WHERE id = ?").bind(id).first();
    return c.json({ about: updated });
  } catch (e) {
    return c.json({ error: "Failed to update about" }, 500);
  }
});

aboutRouter.delete("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  try {
    await c.env.DB.prepare("DELETE FROM about_us WHERE id = ?").bind(id).run();
    return c.json({ success: true });
  } catch (e) {
    return c.json({ error: "Failed to delete about" }, 500);
  }
});

export default aboutRouter;
