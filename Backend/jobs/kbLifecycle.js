import KnowledgeArticle from "../models/KnowledgeArticle.js";
import { logAudit } from "../utils/kbAudit.js";

export async function runKbLifecycle(systemReq) {
  const threshold = new Date(Date.now() - 180 * 86400000); // 180 days

  const stale = await KnowledgeArticle.find({
    status: "Published",
    updatedAt: { $lt: threshold }
  });

  for (const a of stale) {
    a.status = "InReview";
    await a.save();
    await logAudit(systemReq, "AUTO_REVIEW_TRIGGERED", a, {
      reason: "Stale > 180 days"
    });
  }
}
