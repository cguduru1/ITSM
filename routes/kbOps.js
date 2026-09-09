// itsm-backend/routes/kbOps.js
import express from "express";
import KnowledgeArticle from "../models/KnowledgeArticle.js";
import KnowledgeVersion from "../models/KnowledgeVersion.js";
import User from "../models/User.js";
import requirePermission from "../middleware/requirePermission.js";

const router = express.Router();

/* ---------------------------------------------------------
   1. ANALYTICS
--------------------------------------------------------- */
router.get("/analytics", requirePermission("kb", "admin"), async (req, res) => {
  const byCategory = await KnowledgeArticle.aggregate([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
        views: { $sum: "$views" },
        avgRating: {
          $avg: {
            $cond: [
              { $gt: ["$ratings.count", 0] },
              { $divide: ["$ratings.total", "$ratings.count"] },
              null
            ]
          }
        },
        yesFeedback: { $sum: "$feedback.yes" },
        noFeedback: { $sum: "$feedback.no" }
      }
    }
  ]);

  const totals = await KnowledgeArticle.aggregate([
    {
      $group: {
        _id: null,
        totalArticles: { $sum: 1 },
        totalViews: { $sum: "$views" },
        ratingsTotal: { $sum: "$ratings.total" },
        ratingsCount: { $sum: "$ratings.count" },
        yesFeedback: { $sum: "$feedback.yes" },
        noFeedback: { $sum: "$feedback.no" }
      }
    }
  ]);

  const t = totals[0] || {};
  const avgRating =
    t.ratingsCount > 0 ? t.ratingsTotal / t.ratingsCount : null;

  const helpfulPercent =
    t.yesFeedback + t.noFeedback > 0
      ? Math.round((t.yesFeedback / (t.yesFeedback + t.noFeedback)) * 100)
      : 0;

  res.json({
    byCategory,
    totalArticles: t.totalArticles || 0,
    totalViews: t.totalViews || 0,
    avgRating,
    helpfulPercent
  });
});

/* ---------------------------------------------------------
   2. WORKFLOW QUEUE
--------------------------------------------------------- */
router.get("/workflow", requirePermission("kb", "admin"), async (req, res) => {
  const items = await KnowledgeArticle.find({
    status: { $in: ["Draft", "InReview"] }
  })
    .select("title status createdAt updatedAt")
    .lean();

  res.json(items);
});

/* ---------------------------------------------------------
   3. AI INSIGHTS
--------------------------------------------------------- */
router.get("/insights", requirePermission("kb", "admin"), async (req, res) => {
  const lowHelpful = await KnowledgeArticle.find({
    "feedback.no": { $gt: 10 },
    "feedback.yes": { $lt: "feedback.no" }
  }).lean();

  const expiringHR = await KnowledgeArticle.find({
    category: "HR",
    expiryDate: { $gte: new Date(), $lte: new Date(Date.now() + 30 * 86400000) }
  }).lean();

  const insights = [];

  lowHelpful.forEach(a => {
    insights.push({
      id: `lh-${a._id}`,
      title: a.title,
      message:
        "This article has low helpful feedback. Consider revising content or structure."
    });
  });

  expiringHR.forEach(a => {
    insights.push({
      id: `hr-${a._id}`,
      title: a.title,
      message: `HR document expires on ${new Date(
        a.expiryDate
      ).toLocaleDateString()}. Consider updating or replacing.`
    });
  });

  res.json(insights);
});

/* ---------------------------------------------------------
   4. HR EXPIRY MONITOR
--------------------------------------------------------- */
router.get(
  "/expiry-monitor",
  requirePermission("kb", "admin"),
  async (req, res) => {
    const now = new Date();
    const soon = new Date(Date.now() + 30 * 86400000);

    const active = await KnowledgeArticle.countDocuments({
      category: "HR",
      expiryDate: { $gte: now }
    });

    const expired = await KnowledgeArticle.countDocuments({
      category: "HR",
      expiryDate: { $lt: now }
    });

    const expiringSoon = await KnowledgeArticle.countDocuments({
      category: "HR",
      expiryDate: { $gte: now, $lte: soon }
    });

    res.json({ active, expired, soon: expiringSoon });
  }
);

/* ---------------------------------------------------------
   5. BOOKMARKS
--------------------------------------------------------- */
router.get("/bookmarks", requirePermission("kb", "read"), async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("bookmarks", "title category")
    .lean();

  res.json(user.bookmarks || []);
});

/* ---------------------------------------------------------
   6. Submit for Review
--------------------------------------------------------- */
router.post("/:id/submit", requirePermission("kb", "update"), async (req, res) => {
  const article = await KnowledgeArticle.findByIdAndUpdate(
    req.params.id,
    { status: "InReview" },
    { new: true }
  );

  await logAudit(req, "SUBMITTED_FOR_REVIEW", article);

  res.json(article);
});

/* ---------------------------------------------------------
   7. Approve
--------------------------------------------------------- */
router.post("/:id/approve", requirePermission("kb", "approve"), async (req, res) => {
  const article = await KnowledgeArticle.findByIdAndUpdate(
    req.params.id,
    {
      status: "Published",
      reviewer: req.user._id,
      approvedAt: new Date()
    },
    { new: true }
  );

  await logAudit(req, "APPROVED", article);

  res.json(article);
});

/* ---------------------------------------------------------
   7. Reject
--------------------------------------------------------- */
router.post("/:id/reject", requirePermission("kb", "approve"), async (req, res) => {
  const article = await KnowledgeArticle.findByIdAndUpdate(
    req.params.id,
    { status: "Draft" },
    { new: true }
  );

  await logAudit(req, "REJECTED", article);

  res.json(article);
});

/* ---------------------------------------------------------
   8. Audit Log
--------------------------------------------------------- */
router.get("/audit", requirePermission("kb", "admin"), async (req, res) => {
  const logs = await KnowledgeAudit.find()
    .sort({ timestamp: -1 })
    .limit(200)
    .lean();

  res.json(logs);
});

router.get("/quality-score", requirePermission("kb", "admin"), async (req, res) => {
  const articles = await KnowledgeArticle.find().lean();

  const scored = articles.map(a => {
    const ratingScore =
      a.ratings?.count > 0 ? (a.ratings.total / a.ratings.count) / 5 : 0.5;
    const feedbackTotal = (a.feedback?.yes || 0) + (a.feedback?.no || 0);
    const helpfulScore =
      feedbackTotal > 0 ? (a.feedback.yes / feedbackTotal) : 0.5;
    const freshnessScore =
      a.updatedAt
        ? Math.max(0.2, 1 - (Date.now() - new Date(a.updatedAt)) / (365 * 86400000))
        : 0.5;

    const quality =
      0.4 * ratingScore +
      0.3 * helpfulScore +
      0.3 * freshnessScore;

    return { ...a, qualityScore: Number(quality.toFixed(2)) };
  });

  res.json(scored);
});


router.get("/my-contributions", requirePermission("kb", "read"), async (req, res) => {
  const userId = req.user._id;

  const created = await KnowledgeArticle.find({ createdBy: userId })
    .select("title status updatedAt")
    .lean();

  const updated = await KnowledgeArticle.find({ updatedBy: userId })
    .select("title status updatedAt")
    .lean();

  const versions = await KnowledgeVersion.find({ createdBy: userId })
    .select("articleId version createdAt")
    .populate("articleId", "title")
    .lean();

  const approvals = await KnowledgeAudit.find({
    userId,
    action: "APPROVED"
  })
    .select("articleTitle timestamp")
    .lean();

  res.json({
    created,
    updated,
    versions,
    approvals
  });
});

router.get("/heatmap", requirePermission("kb", "admin"), async (req, res) => {
  const agg = await Ticket.aggregate([
    { $match: { kbArticleId: { $ne: null } } },
    {
      $group: {
        _id: { department: "$department", kbArticleId: "$kbArticleId" },
        count: { $sum: 1 }
      }
    }
  ]);

  res.json(agg);
});


export default router;
