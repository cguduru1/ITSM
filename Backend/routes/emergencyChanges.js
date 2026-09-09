// routes/emergencyChanges.js
import express from "express";
import EmergencyChange from "../models/EmergencyChange.js";

const router = express.Router();

// GET all emergency changes
router.get("/", async (req, res) => {
  try {
    const table = await EmergencyChange.findOne({ tenant: "default" });
    res.json(table ? table.changes : []);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch emergency changes" });
  }
});

// POST new emergency change
router.post("/", async (req, res) => {
  try {
    const { title, approver, status, rollback } = req.body;
    let table = await EmergencyChange.findOne({ tenant: "default" });
    if (!table) table = new EmergencyChange({ tenant: "default", changes: [] });

    table.changes.push({ title, approver, status, rollback });
    await table.save();
    res.json(table.changes);
  } catch (err) {
    res.status(500).json({ error: "Failed to add emergency change" });
  }
});

// PUT update emergency change
router.put("/:id", async (req, res) => {
  try {
    const { title, approver, status, rollback } = req.body;
    const table = await EmergencyChange.findOne({ tenant: "default" });
    if (!table) return res.status(404).json({ error: "Table not found" });

    const change = table.changes.id(req.params.id);
    if (!change) return res.status(404).json({ error: "Change not found" });

    if (title !== undefined) change.title = title;
    if (approver !== undefined) change.approver = approver;
    if (status !== undefined) change.status = status;
    if (rollback !== undefined) change.rollback = rollback;

    await table.save();
    res.json(table.changes);
  } catch (err) {
    res.status(500).json({ error: "Failed to update emergency change" });
  }
});

// DELETE emergency change
router.delete("/:id", async (req, res) => {
  try {
    const table = await EmergencyChange.findOne({ tenant: "default" });
    if (!table) return res.status(404).json({ error: "Table not found" });

    table.changes.id(req.params.id).remove();
    await table.save();
    res.json(table.changes);
  } catch (err) {
    res.status(500).json({ error: "Failed to delete emergency change" });
  }
});

export default router;
