// backend/routes/ai.js
import express from "express";
import * as aiService from "../services/aiService.js";
const router = express.Router();

router.get("/assets/:assetId/summary", async (req, res) => {
  try {
    const features = await aiService.extractFeatures(req.params.assetId);
    const summary = aiService.summarizeFeatures(features);
    res.json({ summary, features });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/assets/recommendations", async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 50;
    const recs = await aiService.getRecommendations(limit);
    res.json(recs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/assets/anomalies", async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 100;
    const anomalies = await aiService.detectAnomalies(limit);
    res.json(anomalies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
