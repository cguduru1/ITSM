import mongoose from "mongoose";

const KnowledgeAuditSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  userName: String,
  action: String, // "APPROVED", "VERSION_CREATED", etc.
  articleId: { type: mongoose.Schema.Types.ObjectId, ref: "KnowledgeArticle" },
  articleTitle: String,
  timestamp: { type: Date, default: Date.now },
  details: mongoose.Schema.Types.Mixed
});

export default mongoose.model("KnowledgeAudit", KnowledgeAuditSchema);
