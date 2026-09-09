import express from "express";
import axios from "axios";
import Change from "../models/Change.js";
import CI from "../models/CI.js";

const router = express.Router();

router.post("/predict", async (req, res) => {
  try {
    const { changeId } = req.body;

    const change = await Change.findById(changeId).populate("relatedCIs");

    if (!change) return res.status(404).json({ error: "Change not found" });

    const impacted = change.relatedCIs.length;
    const anomalies = change.relatedCIs.filter(ci => ci.isAnomaly).length;
    const avgHealth =
      change.relatedCIs.reduce((sum, ci) => sum + (ci.healthScore || 100), 0) /
      (impacted || 1);
    const relations =
      change.relatedCIs.reduce((sum, ci) => sum + (ci.relationships?.length || 0), 0);

    const aiRes = await axios.post("http://localhost:5006/risk", {
      impacted,
      anomalies,
      health: avgHealth,
      priority: change.priority,
      relations
    });

    const { riskScore, riskLevel } = aiRes.data;

    change.riskScore = riskScore;
    change.riskLevel = riskLevel;
    await change.save();

    res.json({ changeId, riskScore, riskLevel });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Risk prediction failed" });
  }
});

export default router;
