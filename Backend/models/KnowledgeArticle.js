// itsm-backend/models/KnowledgeArticle.js
import mongoose from "mongoose";

const AttachmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true }, // Set by req.file.storageUrl
  type: { type: String, default: "other" }, // pdf, image, video, other
  uploadedAt: { type: Date, default: Date.now }
});

const KnowledgeArticleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    category: { type: String, default: "General", index: true },
    tags: [{ type: String, index: true }],

    status: {
      type: String,
      enum: ["Draft", "Review", "Published", "Archived"],
      default: "Draft",
      index: true
    },
    version: { type: Number, default: 1 },
    expiryDate: { type: Date, default: null },

    // Author & User References
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdByEmail: { type: String },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    authorName: { type: String },

    // Attachments
    attachments: [AttachmentSchema],

    // Analytics & Feedback
    views: { type: Number, default: 0 },
    helpfulVotes: { type: Number, default: 0 },
    notHelpfulVotes: { type: Number, default: 0 },
    feedback: {
      yes: { type: Number, default: 0 },
      no: { type: Number, default: 0 }
    },
    ratings: {
      total: { type: Number, default: 0 },
      count: { type: Number, default: 0 }
    }
  },
  {
    timestamps: true // Automatically manages createdAt and updatedAt
  }
);

// Search Index for performant text queries
KnowledgeArticleSchema.index({ title: "text", content: "text", tags: "text" });

const KnowledgeArticle =
  mongoose.models.KnowledgeArticle ||
  mongoose.model("KnowledgeArticle", KnowledgeArticleSchema);

export default KnowledgeArticle;