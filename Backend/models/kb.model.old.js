import express from "express";
import auth from "../auth";
import { authorize } from "../authorize";
import Article from "../models/KBArticle";

import mongoose from "mongoose";

const router = express.Router();

const KBArticleSchema = new mongoose.Schema({
  title: String,
  summary: String,
  category: String,
  content: String,
  author: String,
  tags: [String],
attachments: {
  type: Array,
  default: []
},
helpfulVotes: {
  type: Number,
  default: 0
}

}, { timestamps: true });

module.exports = mongoose.model("KBArticle", KBArticleSchema);


router.get("/", auth, async (req, res) => {
  const { q, category } = req.query;
  const query = { tenant: req.user.tenant };

  if (category) query.category = category;
  if (q) query.$text = { $search: q };

  const articles = await Article.find(query).limit(20);
  res.json(articles);
});

router.post("/", auth, authorize("kb:manage"), async (req, res) => {
  const article = await new Article({
    ...req.body,
    tenant: req.user.tenant,
    createdBy: req.user.name
  }).save();
  res.status(201).json(article);
});

router.post("/:id/helpful", auth, async (req, res) => {
  const article = await Article.findByIdAndUpdate(
    req.params.id,
    { $inc: { helpfulVotes: 1 } },
    { new: true }
  );
  res.json(article);
});

router.post("/", async (req, res) => {
  try {
    const article = await KB.create(req.body);
    res.json(article);   // ⭐ MUST return article._id
  } catch (err) {
    res.status(500).json({ error: "Failed to create article" });
  }
});


export default router;
