import express from "express";
import DevOpsModel from "../models/DevOpsModel.js";

const router = express.Router();

// GET all models
router.get("/", async (req, res) => {
  try {
    const table = await DevOpsModel.findOne({ tenant: "default" });
    res.json(table ? table.models : []);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch models" });
  }
});

// POST new model
router.post("/", async (req, res) => {
  try {
    const { name, pipeline, status } = req.body;
    let table = await DevOpsModel.findOne({ tenant: "default" });
    if (!table) table = new DevOpsModel({ tenant: "default", models: [] });

    table.models.push({ name, pipeline, status });
    await table.save();
    res.json(table.models);
  } catch (err) {
    res.status(500).json({ error: "Failed to add model" });
  }
});

// PUT update model
router.put("/:id", async (req, res) => {
  try {
    const { name, pipeline, status } = req.body;
    const table = await DevOpsModel.findOne({ tenant: "default" });
    if (!table) return res.status(404).json({ error: "Table not found" });

    const model = table.models.id(req.params.id);
    if (!model) return res.status(404).json({ error: "Model not found" });

    if (name !== undefined) model.name = name;
    if (pipeline !== undefined) model.pipeline = pipeline;
    if (status !== undefined) model.status = status;

    await table.save();
    res.json(table.models);
  } catch (err) {
    res.status(500).json({ error: "Failed to update model" });
  }
});

// DELETE model
router.delete("/:id", async (req, res) => {
  try {
    const table = await DevOpsModel.findOne({ tenant: "default" });
    if (!table) return res.status(404).json({ error: "Table not found" });

    table.models.id(req.params.id).remove();
    await table.save();
    res.json(table.models);
  } catch (err) {
    res.status(500).json({ error: "Failed to delete model" });
  }
});

export default router;
