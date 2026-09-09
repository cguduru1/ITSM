import express from "express";
import CI from "../models/CI.js";
import axios from "axios";

const router = express.Router();

// Get full relationship graph
router.get("/graph", async (req, res) => {
  const cis = await CI.find().populate("relationships.target");
  res.json(cis);
});

router.post("/add", async (req, res) => {
  const { sourceId, targetId, type } = req.body;

  await CI.findByIdAndUpdate(sourceId, {
    $push: {
      relationships: { target: targetId, type }
    }
  });

  res.json({ message: "Relationship added" });
});

router.get("/suggest", async (req, res) => {
  const cis = await CI.find();
  const aiRes = await axios.post("http://localhost:5003/suggest", { cis });
  res.json(aiRes.data);
});

export default router;
