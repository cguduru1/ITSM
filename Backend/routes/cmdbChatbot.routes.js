import express from "express";
import axios from "axios";
import CI from "../models/CI.js";
import Change from "../models/Change.js";

const router = express.Router();

router.post("/ask", async (req, res) => {
  try {
    const { query } = req.body;

    // Step 1: Ask AI for intent
    const ai = await axios.post("http://localhost:5007/nlp", { text: query });
    const intent = ai.data.intent;

    // Step 2: Execute intent
    if (intent === "list_critical_cis") {
      const cis = await CI.find({ healthStatus: "Critical" });
      return res.json({ intent, result: cis });
    }

    if (intent === "blast_radius") {
      const changeNumber = query.split(" ").pop().trim();
      const change = await Change.findOne({ number: changeNumber }).populate("relatedCIs");

      if (!change) return res.json({ intent, result: "Change not found" });

      const blast = [];

      for (const ci of change.relatedCIs) {
        blast.push({
          ci: ci.name,
          relationships: ci.relationships?.length || 0
        });
      }

      return res.json({ intent, result: blast });
    }

    if (intent === "explain_anomaly") {
      const ciName = query.split(" ")[2]; // “Why is CI-DB-PROD marked as anomaly?”
      const ci = await CI.findOne({ name: ciName });

      if (!ci) return res.json({ intent, result: "CI not found" });

      if (!ci.isAnomaly)
        return res.json({ intent, result: `${ciName} is not marked as anomaly.` });

      return res.json({
        intent,
        result: `CI ${ciName} is anomaly because healthScore=${ci.healthScore}, relationships=${ci.relationships?.length}, status=${ci.operational_status}`
      });
    }

    if (intent === "bulk_risk") {
      const changes = await Change.find({
        createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
      });

      const results = [];

      for (const change of changes) {
        const risk = await axios.post("http://localhost:4000/api/change-risk/predict", {
          changeId: change._id
        });

        results.push({
          change: change.number,
          riskScore: risk.data.riskScore,
          riskLevel: risk.data.riskLevel
        });
      }

      return res.json({ intent, result: results });
    }

    return res.json({ intent: "unknown", result: "I did not understand the query." });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Chatbot failed" });
  }
});

export default router;
