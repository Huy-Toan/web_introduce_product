// api/services/slug.js

export const slugify = (s = "") =>
  s
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export async function checkSlugUnique(db, slug, locale, cfg, excludeId = 0) {
  const {
    baseTable,
    baseIdField = "id",
    baseSlugField = "slug",
    trTable,
    trParentField = "parent_id",
    trLocaleField = "locale",
    trSlugField = "slug",
  } = cfg;

  const normalized = slugify(slug || "");
  if (!normalized) return { exists: false, normalized: "", suggestion: "" };

  const baseRow = await db
    .prepare(`SELECT 1 FROM ${baseTable} WHERE ${baseSlugField} = ? AND ${baseIdField} != ? LIMIT 1`)
    .bind(normalized, excludeId)
    .first();

  let trRow = null;
  if (trTable) {
    trRow = await db
      .prepare(
        `SELECT 1 FROM ${trTable}
         WHERE ${trLocaleField} = ? AND ${trSlugField} = ? AND ${trParentField} != ?
         LIMIT 1`
      )
      .bind((locale || "vi").toLowerCase(), normalized, excludeId)
      .first();
  }

  const exists = Boolean(baseRow || trRow);
  let suggestion = normalized;
  if (exists) {
    suggestion = `${normalized}-2`;
  }
  return { exists, normalized, suggestion };
}

export async function assertSlugUniqueOrThrow(c, slug, locale, cfg, excludeId = 0) {
  const { exists, normalized, suggestion } = await checkSlugUnique(
    c.env.DB, slug, locale, cfg, excludeId
  );
  if (exists) {
    // 409 Conflict cho hợp lý
    throw Object.assign(new Error("Slug already exists"), {
      status: 409,
      payload: { error: "Slug already exists", slug: normalized, suggestion }
    });
  }
  return normalized;
}
