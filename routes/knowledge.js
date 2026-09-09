import express from "express";
import KnowledgeArticle from "../models/KnowledgeArticle.js";
import KnowledgeVersion from "../models/KnowledgeVersion.js";
import User from "../models/User.js";
import requirePermission from "../middleware/requirePermission.js";
import { logAudit } from "../utils/kbAudit.js";
import uploadMiddleware from "../middleware/uploadMiddleware.js";
import { notifySlack, notifyEmail } from "../utils/kbNotify.js";
import { getAttachments, getArticleById /* other handlers */ } from "../controllers/kbController.js";

const router = express.Router();

/* =========================================================
   1. STATIC ROUTES (MUST BE DECLARED BEFORE /:id ROUTES)
========================================================= */

// Attachment Manager Endpoint
router.get("/attachments", async (req, res) => {
  try {
    const articles = await KnowledgeArticle.find(
      { "attachments.0": { $exists: true } }, 
      { attachments: 1, title: 1 }
    );
    const allAttachments = articles.flatMap(art => 
      (art.attachments || []).map((att, idx) => ({
        id: att._id || `${art._id}-${idx}`,
        name: att.filename || att.name || "Attachment",
        size: att.size || "N/A",
        articleId: art._id,
        articleTitle: art.title
      }))
    );
    res.json(allAttachments);
  } catch (err) {
    res.status(500).json({ message: "Error fetching attachments", error: err.message });
  }
});

// GET KB analytics
router.get("/analytics", async (req, res) => {
  try {
    const stats = await KnowledgeArticle.aggregate([
      {
        $group: {
          _id: null,
          totalArticles: { $sum: 1 },
          totalViews: { $sum: { $ifNull: ["$views", 0] } },
          avgRating: { $avg: { $ifNull: ["$rating", 0] } },
          yesVotes: { $sum: { $ifNull: ["$helpfulYes", 0] } },
          noVotes: { $sum: { $ifNull: ["$helpfulNo", 0] } }
        }
      }
    ]);

    if (!stats.length) {
      return res.json({ totalViews: 0, avgRating: 0, helpfulPercent: 0, totalArticles: 0 });
    }

    const { totalArticles, totalViews, avgRating, yesVotes, noVotes } = stats[0];
    const totalVotes = yesVotes + noVotes;
    const helpfulPercent = totalVotes > 0 ? Math.round((yesVotes / totalVotes) * 100) : 0;

    res.json({
      totalArticles,
      totalViews,
      avgRating: Number((avgRating || 0).toFixed(2)),
      helpfulPercent
    });
  } catch (err) {
    res.status(500).json({ message: "Error generating analytics", error: err.message });
  }
});

// GET /api/kb/category-health
router.get("/category-health", async (req, res) => {
  try {
    const categories = await KnowledgeArticle.aggregate([
      {
        $group: {
          _id: { $ifNull: ["$category", "Uncategorized"] },
          count: { $sum: 1 },
          views: { $sum: { $ifNull: ["$views", 0] } },
          avgRating: { $avg: { $ifNull: ["$rating", 0] } },
          yesFeedback: { $sum: { $ifNull: ["$helpfulYes", 0] } },
          noFeedback: { $sum: { $ifNull: ["$helpfulNo", 0] } }
        }
      }
    ]);

    res.json({ byCategory: categories });
  } catch (err) {
    res.status(500).json({ message: "Error fetching category health", error: err.message });
  }
});

// GET /api/kb/ai-insights  
router.get(["/insights", "/ai-insights"], async (req, res) => {
  try {
    const insights = [];
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180);

    const staleCount = await KnowledgeArticle.countDocuments({ updatedAt: { $lt: sixMonthsAgo } });
    if (staleCount > 0) {
      insights.push({
        id: "stale-articles",
        title: "Outdated Content Warning",
        message: `${staleCount} article(s) haven't been updated in over 6 months and need review.`
      });
    }

    if (insights.length === 0) {
      insights.push({
        id: "all-good",
        title: "Optimal Knowledge Base Health",
        message: "All knowledge base articles are up to date and performing within acceptable metrics."
      });
    }

    res.json(insights);
  } catch (err) {
    res.status(500).json({ message: "Error generating insights", error: err.message });
  }
});

// GET /api/kb/expiry
router.get(["/expiry-monitor", "/expiry"], async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    const active = await KnowledgeArticle.countDocuments({
      $or: [{ expiryDate: { $gt: thirtyDaysFromNow } }, { expiryDate: null }]
    });

    const soon = await KnowledgeArticle.countDocuments({
      expiryDate: { $gte: now, $lte: thirtyDaysFromNow }
    });

    const expired = await KnowledgeArticle.countDocuments({
      expiryDate: { $lt: now }
    });

    res.json({ active, soon, expired });
  } catch (err) {
    res.status(500).json({ message: "Error fetching expiry status", error: err.message });
  }
});

// GET /api/kb/workflow
router.get("/workflow", async (req, res) => {
  try {
    const queue = await KnowledgeArticle.find(
      { status: { $in: ["Draft", "InReview", "Pending"] } },
      { title: 1, status: 1, author: 1, updatedAt: 1 }
    ).sort({ updatedAt: -1 });

    res.json(queue);
  } catch (err) {
    res.status(500).json({ message: "Error fetching workflow queue", error: err.message });
  }
});

// // GET Expiry Monitor
// router.get("/expiry-monitor", requirePermission("kb", "read"), async (req, res) => {
//   try {
//     const expiringSoon = await KnowledgeArticle.find({
//       category: "HR",
//       expiryDate: { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
//     }).lean();
//     res.json(expiringSoon);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// FIXED: Removed "/api/kb" prefix
router.get("/my-contributions", async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const created = await KnowledgeArticle.find({ author: userId });
    const updated = await KnowledgeArticle.find({ lastUpdatedBy: userId });

    res.json({
      created: created || [],
      updated: updated || [],
      versions: [],
      approvals: []
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching contributions", error: err.message });
  }
});

// GET audit logs (FIX: Explicitly declared static route)
router.get("/audit", requirePermission("kb", "read"), async (req, res) => {
  try {
    const auditLogs = await KnowledgeArticle.find({})
      .select("title version updatedAt updatedBy authorName")
      .sort({ updatedAt: -1 })
      .limit(20)
      .lean();
    res.json(auditLogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// FIXED: Removed "/api/kb" prefix
router.get("/versions", requirePermission("kb", "read"), async (req, res) => {
  try {
    const versions = await KnowledgeVersion.find().limit(20).lean();
    res.json(versions || []);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch versions" });
  }
});

// GET user bookmarks
router.get("/bookmarks", requirePermission("kb", "read"), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("bookmarks").lean();
    res.json(user?.bookmarks || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Suggest articles for a ticket or query. AI Search Suggestion
router.get("/ai/suggest", requirePermission("kb", "read"), async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const regex = new RegExp(q, "i");
    const articles = await KnowledgeArticle.find({
      status: "Published",
      $or: [{ title: regex }, { content: regex }, { tags: regex }]
    }).limit(5).lean();

    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


//GET all articles (with search + category filter)
router.get("/", async (req, res) => {
  try {
    const { search = "", category = "", status = "" } = req.query;
    const query = {};

    // 1. Filter by Status (e.g. status=Published)
    if (status && status.trim() !== "") {
      query.status = status.trim();
    }

    // 2. Filter by Category
    if (category && category.trim() !== "" && category.toLowerCase() !== "all") {
      query.category = new RegExp(`^${category.trim()}$`, "i");
    }

    // 3. Filter by Search Query
    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { title: searchRegex },
        { content: searchRegex },
        { tags: { $in: [searchRegex] } }
      ];
    }

    const articles = await KnowledgeArticle.find(query)
      .sort({ updatedAt: -1 })
      .lean();

    return res.json(articles);
  } catch (err) {
    console.error("Error fetching articles:", err);
    return res.status(500).json({ error: err.message });
  }
});

// CREATE article
router.post("/", async (req, res) => {
  try {
    const { title, content, summary, category, status, tags } = req.body;

    const newArticle = new KnowledgeArticle({
      title,
      content,
      summary,
      // ✅ Ensures category isn't saved as an empty string
      category: category && category.trim() !== "" ? category.trim() : "IT", 
      status: status || "Published", // Ensures status defaults to Published
      tags: tags || [],
    });

    const savedArticle = await newArticle.save();
    return res.status(201).json(savedArticle);
  } catch (err) {
    console.error("Error creating article:", err);
    return res.status(500).json({ error: err.message });
  }
});

/* =========================================================
   2. PARAMETERIZED ROUTES (/:id)
========================================================= */

// GET single article
router.get("/:id", async (req, res) => {
  try {
    const article = await KnowledgeArticle.findById(req.params.id);
    return res.json(article);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// UPDATE article & snapshot version
router.put("/:id", requirePermission("kb", "update"), async (req, res) => {
  try {
    const current = await KnowledgeArticle.findById(req.params.id);
    if (!current) return res.status(404).json({ error: "Not found" });

    const lastVersion = await KnowledgeVersion.find({ articleId: current._id }).sort({ version: -1 }).limit(1);
    const nextVersion = (lastVersion[0]?.version || 0) + 1;

    const versionRecord = await KnowledgeVersion.create({
      articleId: current._id,
      version: nextVersion,
      title: current.title,
      content: current.content,
      category: current.category,
      tags: current.tags,
      createdBy: req.user._id
    });

    await logAudit(req, "VERSION_CREATED", current, { version: nextVersion, versionId: versionRecord._id });

    const updated = await KnowledgeArticle.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id, updatedAt: new Date() },
      { new: true }
    );

    await logAudit(req, "ARTICLE_UPDATED", updated);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE article
router.delete("/:id", async (req, res) => {
  try {
    await KnowledgeArticle.findByIdAndDelete(req.params.id);
    return res.json({ message: "Article deleted" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

//Versioning
router.get("/:id/versions", requirePermission("kb", "read"), async (req, res) => {
  try {
    const versions = await KnowledgeVersion.find({ articleId: req.params.id })
      .sort({ version: -1 })
      .lean();
    res.json(versions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// BOOKMARK & UNBOOKMARK
router.post("/:id/bookmark", requirePermission("kb", "read"), async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { bookmarks: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/unbookmark", requirePermission("kb", "read"), async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $pull: { bookmarks: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Feedback Permission
router.post("/:id/feedback", requirePermission("kb", "read"), async (req, res) => {
  try {
    const { helpful } = req.body;
    if (!["yes", "no"].includes(helpful)) {
      return res.status(400).json({ error: "Invalid feedback" });
    }

    const update = helpful === "yes" ? { $inc: { helpfulVotes: 1 } } : { $inc: { notHelpfulVotes: 1 } };
    await KnowledgeArticle.findByIdAndUpdate(req.params.id, update);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------------------------------------------------------
   ATTACHMENT UPLOAD
--------------------------------------------------------- */
router.post("/:id/attachments", requirePermission("kb", "update"), uploadMiddleware.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const article = await KnowledgeArticle.findById(req.params.id);
    if (!article) return res.status(404).json({ error: "Not found" });

    const type = file.mimetype.includes("pdf") ? "pdf" : file.mimetype.startsWith("image") ? "image" : "other";

    article.attachments.push({ name: file.originalname, url: file.storageUrl, type });
    await article.save();

    await logAudit(req, "ATTACHMENT_UPLOADED", article, { fileName: file.originalname });
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------------------------------------------------------
   DELETE ATTACHMENT
--------------------------------------------------------- */
router.delete(
  "/:id/attachments/:attId",
  requirePermission("kb", "update"),
      async (req, res) => {
    const article = await KnowledgeArticle.findById(req.params.id);
    if (!article) return res.status(404).json({ error: "Not found" });

    const attachment = article.attachments.id(req.params.attId);
    if (!attachment)
      return res.status(404).json({ error: "Attachment not found" });

    article.attachments.pull(req.params.attId);
    await article.save();

    // Audit log for attachment deletion
    await logAudit(req, "ATTACHMENT_DELETED", article, {
      fileName: attachment.name,
      url: attachment.url,
      type: attachment.type
    });

    res.json(article);
  }
);

//Require Permission
router.post("/:id/rate", requirePermission("kb", "read"), async (req, res) => {
    const { rating } = req.body; // 1–5

    if (rating < 1 || rating > 5)
      return res.status(400).json({ error: "Invalid rating" });

    await KnowledgeArticle.findByIdAndUpdate(req.params.id, {
      $inc: { "ratings.total": rating, "ratings.count": 1 }
    });

    res.json({ success: true });
  }
);

//Suggestion
router.get("/:id/suggested", requirePermission("kb", "read"), async (req, res) => {
    const article = await KnowledgeArticle.findById(req.params.id).lean();
    if (!article) return res.status(404).json({ error: "Not found" });

    const suggestions = await KnowledgeArticle.find({
      _id: { $ne: article._id },
      category: article.category,
      tags: { $in: article.tags }
    })
      .sort({ views: -1 })
      .limit(5)
      .lean();

    res.json(suggestions);
  }
);


// Move to Review
router.post("/:id/submit-review", requirePermission("knowledge", "update"), async (req, res) => {
    const article = await KnowledgeArticle.findByIdAndUpdate(
      req.params.id,
      { status: "Review" },
      { new: true }
    );
    if (!article) return res.status(404).json({ error: "Article not found" });
    res.json(article);
  }
);

// Approve & Publish
router.post("/:id/publish", requirePermission("knowledge", "publish"), async (req, res) => {
    const article = await KnowledgeArticle.findByIdAndUpdate(
      req.params.id,
      { status: "Published" },
      { new: true }
    );
    if (!article) return res.status(404).json({ error: "Article not found" });
    res.json(article);
  }
);

router.put("/:id/versioned", requirePermission("knowledge", "update"), async (req, res) => {
    const existing = await KnowledgeArticle.findById(req.params.id);
    if (!existing)
      return res.status(404).json({ error: "Article not found" });

    await KnowledgeVersion.create({
      articleId: existing._id,
      version: existing.version,
      title: existing.title,
      content: existing.content,
      tags: existing.tags,
      status: existing.status,
      updatedById: req.user._id,
      updatedByName: req.user.name
    });

    const updated = await KnowledgeArticle.findByIdAndUpdate(
      req.params.id,
      { ...req.body, version: existing.version + 1, updatedAt: new Date() },
      { new: true }
    );

    res.json(updated);
  }
);

// Similar
router.get("/:id/similar", requirePermission("knowledge", "view"), async (req, res) => {
    const article = await KnowledgeArticle.findById(req.params.id).lean();
    if (!article) return res.status(404).json({ error: "Article not found" });

    const tags = article.tags || [];
    if (!tags.length) return res.json([]);

    const similar = await KnowledgeArticle.find({
      _id: { $ne: article._id },
      status: "Published",
      tags: { $in: tags }
    })
      .limit(5)
      .lean();

    res.json(similar);
  }
);

// Mark helpful
router.post("/:id/feedback/helpful", requirePermission("knowledge", "view"), async (req, res) => {
    const article = await KnowledgeArticle.findByIdAndUpdate(
      req.params.id,
      { $inc: { helpfulVotes: 1 } },
      { new: true }
    );
    if (!article) return res.status(404).json({ error: "Article not found" });
    res.json(article);
  }
);

// Mark not helpful
router.post("/:id/feedback/not-helpful", requirePermission("knowledge", "view"), async (req, res) => {
    const article = await KnowledgeArticle.findByIdAndUpdate(
      req.params.id,
      { $inc: { notHelpfulVotes: 1 } },
      { new: true }
    );
    if (!article) return res.status(404).json({ error: "Article not found" });
    res.json(article);
  }
);

export default router;
