// models/KBArticle.js
import mongoose from "mongoose";
import softDeletePlugin from "../lib/plugins/softDelete.js";
import { attachAuditHooks } from "../lib/middleware/auditMiddleware.js";

const { Schema } = mongoose;

const AttachmentSchema = new Schema({
  name: { type: String, trim: true },
  url: { type: String, trim: true }
}, { _id: true });

const KBArticleSchema = new Schema({
  title: { type: String, required: true, trim: true },
  summary: { type: String, trim: true },
  category: { type: String, trim: true },
  content: { type: String, required: true },
  author: { type: String, trim: true },
  tags: { type: [String], default: [] },
  attachments: { type: [AttachmentSchema], default: [] },
  helpfulVotes: { type: Number, default: 0 },
  views: { type: Number, default: 0 }
}, { timestamps: true });

// Text index for search
KBArticleSchema.index({ title: "text", summary: "text", content: "text" });

// Apply soft delete plugin to the correct schema variable
KBArticleSchema.plugin(softDeletePlugin);

// Attach audit hooks if you use the audit middleware
attachAuditHooks(KBArticleSchema);

// Example pre-save hook to generate a slug if needed (optional)
KBArticleSchema.pre("save", async function () {
  if (this.title && !this.slug) {
    this.slug = String(this.title).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");
  }
});

const KBArticle = mongoose.models?.KBArticle || mongoose.model("KBArticle", KBArticleSchema);
export default KBArticle;
