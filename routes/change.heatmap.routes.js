import express from "express";
import Change from "../models/Change.js";
import { getHeatmap } from "../controllers/changeHeatmapController.js";

const router = express.Router();

// Heatmap data: count changes per day
router.get("/heatmap", async (req, res) => {
  try {
    const changes = await Change.find();

    const map = {};

    changes.forEach(c => {
      const day = new Date(c.plannedStart).toISOString().split("T")[0];
      map[day] = map[day] ? [...map[day], c] : [c];
    });

    const heatmap = Object.keys(map).map(day => ({
      date: day,
      count: map[day].length,
      changes: map[day]
    }));

    res.json(heatmap);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
