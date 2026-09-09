import express from "express";
import CMDB from "../models/CMDB.js";
import Asset from "../models/Asset.js";
import Change from "../models/Change.js";

const router = express.Router();

// GET /api/cmdb-rel
router.get("/", async (req, res) => {
  try {
    const rels = await CMDB.find()
      .select("name operational_status environment dependencies dependents")
      .populate("dependencies", "name operational_status environment")
      .populate("dependents", "name operational_status environment")
      .lean();

    // Map into a uniform format for the frontend
    const formatted = rels.map((item) => {
      const relations = [
        ...(item.dependencies || []).map((dep) => ({
          _id: dep._id,
          type: "Depends On",
          target: dep.name || "Unknown CI"
        })),
        ...(item.dependents || []).map((dep) => ({
          _id: dep._id,
          type: "Used By",
          target: dep.name || "Unknown CI"
        }))
      ];

      return {
        _id: item._id,
        name: item.name || "Unnamed CI",
        relations
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error("GET /api/cmdb-rel error:", err);
    res.status(500).json({ error: "Failed to fetch relationships", details: err.message });
  }
});

// Link CI ↔ Asset
router.post("/link-asset", async (req, res) => {
  try {
    const { ciId, assetId } = req.body;
    await CMDB.findByIdAndUpdate(ciId, { $addToSet: { related_assets: assetId } });
    await Asset.findByIdAndUpdate(assetId, { $addToSet: { related_cis: ciId } });
    res.json({ message: "CI ↔ Asset linked" });
  } catch (err) {
    res.status(500).json({ error: "Failed to link CI and Asset", details: err.message });
  }
});

// Link CI ↔ Change
router.post("/link-change", async (req, res) => {
  try {
    const { ciId, changeId } = req.body;
    await CMDB.findByIdAndUpdate(ciId, { $addToSet: { related_changes: changeId } });
    await Change.findByIdAndUpdate(changeId, { $addToSet: { related_cis: ciId } });
    res.json({ message: "CI ↔ Change linked" });
  } catch (err) {
    res.status(500).json({ error: "Failed to link CI and Change", details: err.message });
  }
});

export default router;
