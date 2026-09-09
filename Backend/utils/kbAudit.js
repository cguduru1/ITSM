// utils/kbAudit.js
import KnowledgeAudit from "../models/KnowledgeAudit.js";

export async function logAudit(req, action, article = {}, details = {}) {
  try {
    // Defensive extraction to prevent null pointer exceptions
    const userId = req?.user?._id || req?.user?.id || null;
    const userName = req?.user?.name || req?.user?.email || "System/Anonymous";

    await KnowledgeAudit.create({
      userId,
      userName,
      action,
      articleId: article?._id || null,
      articleTitle: article?.title || "N/A",
      timestamp: new Date(),
      details
    });
  } catch (err) {
    // Log error without breaking the calling flow
    console.error("Audit log failed:", err.message);
  }
}