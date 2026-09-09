import express from "express";
import FinancialLifecycle from "../models/FinancialLifecycle.js";

const router = express.Router();

// Create financial record
router.post("/", async (req, res) => {
  try {
    const doc = await FinancialLifecycle.create(req.body);
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get by asset
router.get("/asset/:assetId", async (req, res) => {
  const doc = await FinancialLifecycle.findOne({ assetId: req.params.assetId });
  if (!doc) return res.status(404).json({ error: "Not found" });
  res.json(doc);
});

// Update
router.put("/:financialId", async (req, res) => {
  const doc = await FinancialLifecycle.findOneAndUpdate({ financialId: req.params.financialId }, req.body, { new: true });
  res.json(doc);
});

export default router;
