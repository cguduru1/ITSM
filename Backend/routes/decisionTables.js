// routes/decisionTables.js
import express from "express";
import DecisionTable from "../models/DecisionTable.js";

const router = express.Router();

// Get all rules
router.get("/", async (req, res) => {
  try {
    const table = await DecisionTable.findOne({ tenant: "default" });
    res.json(table ? table.rules : []);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch rules" });
  }
});

// Add a new rule
router.post("/", async (req, res) => {
  try {
    const { condition, action, outcome } = req.body;
    let table = await DecisionTable.findOne({ tenant: "default" });

    if (!table) {
      table = new DecisionTable({ tenant: "default", rules: [] });
    }

    table.rules.push({ condition, action, outcome });
    await table.save();

    res.json(table.rules);
  } catch (err) {
    res.status(500).json({ error: "Failed to add rule" });
  }
});

// Delete a rule
router.delete("/:id", async (req, res) => {
  try {
    const table = await DecisionTable.findOne({ tenant: "default" });
    if (!table) return res.status(404).json({ error: "Table not found" });

    table.rules.id(req.params.id).remove();
    await table.save();

    res.json(table.rules);
  } catch (err) {
    res.status(500).json({ error: "Failed to delete rule" });
  }
});

export default router;
