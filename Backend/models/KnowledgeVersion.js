// itsm-backend/models/KnowledgeVersion.js
import mongoose from "mongoose";

const KnowledgeVersionSchema = new mongoose.Schema(
  {
    articleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "KnowledgeArticle",
      required: true,
      index: true
    },

    version: { type: Number, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, default: "General" },
    tags: [{ type: String }],

    status: { type: String, default: "Published" },

    // Supports both 'createdBy' and 'updatedById' fields used across routes
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedById: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedByName: { type: String }
  },
  {
    timestamps: { createdAt: true, updatedAt: false } // Automatically manages createdAt
  }
);

// Compound index for ultra-fast version history queries per article
KnowledgeVersionSchema.index({ articleId: 1, version: -1 });

const KnowledgeVersion =
  mongoose.models.KnowledgeVersion ||
  mongoose.model("KnowledgeVersion", KnowledgeVersionSchema);

export default KnowledgeVersion;