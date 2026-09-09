// backend/routes/recommendations.js
import express from "express";
import Recommendation from "../models/Recommendation.js";
import * as aiService from "../services/aiService.js";
const router = express.Router();

// list persisted recommendations (optionally unhandled only)
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.unhandled === "true") filter.handled = false;
    const rows = await Recommendation.find(filter).sort({ createdAt: -1 }).limit(200).lean();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// create snapshot from aiService (run on demand)
router.post("/snapshot", async (req, res) => {
  try {
    const recs = await aiService.getRecommendations(Number(req.body.limit) || 100);
    const docs = recs.map(r => ({ ...r, createdAt: new Date() }));
    const created = await Recommendation.insertMany(docs);
    res.json({ count: created.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// mark handled (approve/ignore)
router.post("/:id/handle", async (req, res) => {
  try {
    const id = req.params.id;
    const { action, handledBy } = req.body;
    const updated = await Recommendation.findByIdAndUpdate(id, { handled: true, handledAt: new Date(), handledBy, action }, { new: true }).lean();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
