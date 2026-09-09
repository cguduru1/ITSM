import express from "express";
import CI from "../models/CI.js";
import axios from "axios";

const router = express.Router();

// Called when you want to update health for a CI
router.post("/score", async (req, res) => {
  try {
    const { ciId, cpu, memory, incidents } = req.body;

    const aiRes = await axios.post("http://localhost:5002/score", {
      cpu,
      memory,
      incidents
    });

    const { score, status } = aiRes.data;

    await CI.findByIdAndUpdate(ciId, {
      healthScore: score,
      healthStatus: status
    });

    res.json({ ciId, score, status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Health scoring failed" });
  }
});

export default router;
