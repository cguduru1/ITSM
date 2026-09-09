import express from "express";
import multer from "multer";
import Article from "../models/KBArticle.js";

const router = express.Router();

/* -----------------------------
   MULTER CONFIG
------------------------------ */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({ storage });

/* -----------------------------
   GET ALL ARTICLES
------------------------------ */
router.get("/", async (req, res) => {
  try {
    const { category, q } = req.query;
    let filter = {};

    if (category) filter.category = category;

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { summary: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } }
      ];
    }

    const articles = await Article.find(filter).sort({ createdAt: -1 });
    res.json(articles);

  } catch (err) {
    console.error("KB GET ERROR:", err);
    res.status(500).json({ error: "Failed to load articles" });
  }
});

/* -----------------------------
   CREATE ARTICLE
------------------------------ */
router.post("/", async (req, res) => {
  try {
    const article = await Article.create(req.body);
    res.status(201).json(article);
  } catch (err) {
    console.error("KB CREATE ERROR:", err);
    res.status(500).json({ error: "Failed to create article" });
  }
});

/* -----------------------------
   READ ONE ARTICLE
------------------------------ */
router.get("/:id", async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.json({});
    res.json(article);
  } catch (err) {
    console.error("KB LOAD ERROR:", err);
    res.status(500).json({ error: "Failed to load article" });
  }
});

/* -----------------------------
   UPDATE ARTICLE
------------------------------ */
router.put("/:id", async (req, res) => {
  try {
    const updated = await Article.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error("KB UPDATE ERROR:", err);
    res.status(500).json({ error: "Failed to update article" });
  }
});

/* -----------------------------
   DELETE ARTICLE
------------------------------ */
router.delete("/:id", async (req, res) => {
  try {
    await Article.findByIdAndDelete(req.params.id);
    res.json({ message: "Article deleted" });
  } catch (err) {
    console.error("KB DELETE ERROR:", err);
    res.status(500).json({ error: "Failed to delete article" });
  }
});

/* -----------------------------
   HELPFUL VOTE
------------------------------ */
router.post("/:id/helpful", async (req, res) => {
  try {
    const updated = await Article.findByIdAndUpdate(
      req.params.id,
      { $inc: { helpfulVotes: 1 } },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error("KB HELPFUL ERROR:", err);
    res.status(500).json({ error: "Failed to update helpful vote" });
  }
});

/* -----------------------------
   ATTACHMENT UPLOAD
------------------------------ */
router.post("/:id/attachment/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const updated = await Article.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          attachments: {
            name: req.file.originalname,
            url: `/uploads/${req.file.filename}`
          }
        }
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    console.error("ATTACHMENT UPLOAD ERROR:", err);
    res.status(500).json({ error: "Failed to upload attachment" });
  }
});

/* -----------------------------
   DELETE ATTACHMENT
------------------------------ */
router.delete("/:id/attachment/:attId", async (req, res) => {
  try {
    const updated = await Article.findByIdAndUpdate(
      req.params.id,
      { $pull: { attachments: { _id: req.params.attId } } },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    console.error("ATTACHMENT DELETE ERROR:", err);
    res.status(500).json({ error: "Failed to delete attachment" });
  }
});

export default router;
