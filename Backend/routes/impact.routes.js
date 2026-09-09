import express from "express";
import CI from "../models/CI.js";
import axios from "axios";

const router = express.Router();

// Get impact for a CI
router.get("/:ciId", async (req, res) => {
  try {
    const { ciId } = req.params;

    // Get full graph (CIs + relationships)
    const cis = await CI.find().populate("relationships.target");

    const aiRes = await axios.post("http://localhost:5004/impact", {
      ciId,
      cis
    });

    res.json(aiRes.data); // { impacted: [...], risk }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Impact analysis failed" });
  }
});

export default router;
