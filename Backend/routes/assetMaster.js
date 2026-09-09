import express from "express";
import AssetMaster from "../models/AssetMaster.js";
import FinancialLifecycle from "../models/FinancialLifecycle.js";
import * as assetController from "../controllers/assetController.js";

const router = express.Router();

// Create asset (single)
router.post("/", async (req, res) => {
  try {
    const asset = await AssetMaster.create(req.body);
    res.status(201).json(asset);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Bulk create assets (used by PO receive)
router.post("/bulk", async (req, res) => {
  try {
    const docs = await AssetMaster.insertMany(req.body.assets);
    res.status(201).json(docs);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List with filters
router.get("/", async (req, res) => {
  const q = {};
  if (req.query.status) q.status = req.query.status;
  if (req.query.assignedUserId) q.assignedUserId = req.query.assignedUserId;
  const list = await AssetMaster.find(q).limit(100).sort({ createdAt: -1 });
  res.json(list);
});

// Get detail (includes financial)
router.get("/:assetId", async (req, res) => {
  const asset = await AssetMaster.findOne({ assetId: req.params.assetId }).lean();
  if (!asset) return res.status(404).json({ error: "Not found" });
  const finance = await FinancialLifecycle.findOne({ assetId: asset.assetId }).lean();
  res.json({ asset, finance });
});

// Update asset (status transitions should be validated)
router.put("/:assetId", async (req, res) => {
  const updated = await AssetMaster.findOneAndUpdate({ assetId: req.params.assetId }, req.body, { new: true });
  res.json(updated);
});

// Delete
router.delete("/:assetId", async (req, res) => {
  await AssetMaster.deleteOne({ assetId: req.params.assetId });
  res.status(204).end();
});

router.get("/:assetId/workspace", assetController.getWorkspace);

export default router;
