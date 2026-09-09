// services/searchService.js
import KBArticle from "../models/KBArticle.js";
import ProductCatalog from "../models/ProductCatalog.js";

/**
 * Search KB articles using text index, fallback to regex on title.
 */
export async function searchKBArticles(query, { limit = 20, skip = 0 } = {}) {
  if (!query || !query.trim()) return { total: 0, results: [] };

  // Prefer text search
  const textResults = await KBArticle.find(
    { $text: { $search: query }, isDeleted: { $ne: true } },
    { score: { $meta: "textScore" } }
  ).sort({ score: { $meta: "textScore" } }).skip(skip).limit(limit).lean();

  if (textResults.length) {
    const total = await KBArticle.countDocuments({ $text: { $search: query }, isDeleted: { $ne: true } });
    return { total, results: textResults };
  }

  // Fallback: case-insensitive regex on title and summary
  const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  const results = await KBArticle.find({
    $or: [{ title: regex }, { summary: regex }, { content: regex }],
    isDeleted: { $ne: true }
  }).skip(skip).limit(limit).lean();

  const total = await KBArticle.countDocuments({
    $or: [{ title: regex }, { summary: regex }, { content: regex }],
    isDeleted: { $ne: true }
  });

  return { total, results };
}

/**
 * Lightweight product search using indexed fields and text fallback.
 */
export async function searchProducts(query, { limit = 20, skip = 0 } = {}) {
  const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  const results = await ProductCatalog.find({
    $or: [{ modelName: regex }, { modelNumber: regex }, { manufacturer: regex }]
  }).skip(skip).limit(limit).lean();
  const total = await ProductCatalog.countDocuments({
    $or: [{ modelName: regex }, { modelNumber: regex }, { manufacturer: regex }]
  });
  return { total, results };
}
