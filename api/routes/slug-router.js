// src/routes/utils/slugRouter.js
import { Hono } from "hono";
import { checkSlugUnique } from "../../services/slug.js";

export const slugRouter = new Hono();

const ENTITY_MAP = {

  category: { baseTable: "categories", baseSlugField: "slug" },

  product: {
    baseTable: "products",
    baseSlugField: "slug",
    trTable: "products_translations",
    trParentField: "product_id",
    trLocaleField: "locale",
    trSlugField: "slug",
  },

  parent: {
    baseTable: "parent_categories",
    baseSlugField: "slug",
    trTable: "parent_categories_translations",
    trParentField: "parent_id",
    trLocaleField: "locale",
    trSlugField: "slug",
  },

  subcat: {
    baseTable: "subcategories",
    baseSlugField: "slug",
    trTable: "subcategories_translations",
    trParentField: "sub_id",
    trLocaleField: "locale",
    trSlugField: "slug",
  },

  news: {
    baseTable: "news",          
    baseSlugField: "slug",       
    trTable: "news_translations",
    trParentField: "news_id",
    trLocaleField: "locale",
    trSlugField: "slug",
  },
};

slugRouter.get("/slug-check", async (c) => {
  try {
    if (!c.env?.DB) return c.json({ ok: false, error: "Database not available" }, 503);

    const entity = (c.req.query("entity") || "").toLowerCase();
    const cfg = ENTITY_MAP[entity];
    if (!cfg) return c.json({ ok: false, error: "Unsupported entity" }, 400);

    const slug = c.req.query("slug") || "";
    const locale = (c.req.query("locale") || "vi").toLowerCase();
    const excludeId = Number(c.req.query("exclude_id") || 0);

    const rs = await checkSlugUnique(c.env.DB, slug, locale, cfg, excludeId);
    return c.json({ ok: true, entity, ...rs });
  } catch (e) {
    console.error("utils/slug-check error:", e);
    return c.json({ ok: false, error: "Failed to check slug" }, 500);
  }
});

export default slugRouter;
