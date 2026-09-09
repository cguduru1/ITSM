import express from "express";
import ProductCatalog from "../models/ProductCatalog.js";

const router = express.Router();

// Create catalog entry
router.post("/", async (req, res) => {
  try {
    const doc = await ProductCatalog.create(req.body);
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List catalog
router.get("/", async (req, res) => {
  const docs = await ProductCatalog.find().sort({ manufacturer: 1, modelName: 1 });
  res.json(docs);
});

// Get single
router.get("/:modelId", async (req, res) => {
  const doc = await ProductCatalog.findOne({ modelId: req.params.modelId });
  if (!doc) return res.status(404).json({ error: "Not found" });
  res.json(doc);
});

// Update
router.put("/:modelId", async (req, res) => {
  const doc = await ProductCatalog.findOneAndUpdate({ modelId: req.params.modelId }, req.body, { new: true });
  res.json(doc);
});

// Delete
router.delete("/:modelId", async (req, res) => {
  await ProductCatalog.deleteOne({ modelId: req.params.modelId });
  res.status(204).end();
});

export default router;
