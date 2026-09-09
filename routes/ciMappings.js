// routes/ciMappings.js
import express from "express";
import CIMapping from "../models/CIMapping.js";

const router = express.Router();

// Get all mappings
router.get("/", async (req, res) => {
  try {
    const table = await CIMapping.findOne({ tenant: "default" });
    res.json(table ? table.mappings : []);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch mappings" });
  }
});

// Add a new mapping
router.post("/", async (req, res) => {
  try {
    const { ci, service, risk } = req.body;
    let table = await CIMapping.findOne({ tenant: "default" });

    if (!table) {
      table = new CIMapping({ tenant: "default", mappings: [] });
    }

    table.mappings.push({ ci, service, risk });
    await table.save();

    res.json(table.mappings);
  } catch (err) {
    res.status(500).json({ error: "Failed to add mapping" });
  }
});

// Delete a mapping
router.delete("/:id", async (req, res) => {
  try {
    const table = await CIMapping.findOne({ tenant: "default" });
    if (!table) return res.status(404).json({ error: "Table not found" });

    table.mappings.id(req.params.id).remove();
    await table.save();

    res.json(table.mappings);
  } catch (err) {
    res.status(500).json({ error: "Failed to delete mapping" });
  }
});

// Update a mapping
router.put("/:id", async (req, res) => {
  try {
    const { ci, service, risk } = req.body;
    const table = await CIMapping.findOne({ tenant: "default" });
    if (!table) return res.status(404).json({ error: "Table not found" });

    const mapping = table.mappings.id(req.params.id);
    if (!mapping) return res.status(404).json({ error: "Mapping not found" });

    if (ci !== undefined) mapping.ci = ci;
    if (service !== undefined) mapping.service = service;
    if (risk !== undefined) mapping.risk = risk;

    await table.save();
    res.json(table.mappings);
  } catch (err) {
    res.status(500).json({ error: "Failed to update mapping" });
  }
});


export default router;
