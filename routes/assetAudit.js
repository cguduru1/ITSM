import express from "express";
import AssetAuditHistory from "../models/AssetAuditHistory.js";

const router = express.Router();

/**
 * Fetch the history timeline logs for a specific asset
 * ✅ Utilizes compound index: { assetId: 1, changedAt: -1 }
 */
router.get("/asset/:assetId", async (req, res) => {
  try {
    const { assetId } = req.params;

    if (!assetId) {
      return res.status(400).json({ error: "Asset ID parameter is required" });
    }

    const logs = await AssetAuditHistory.find({ assetId })
      .sort({ changedAt: -1 })
      .limit(200);

    return res.json(logs);
  } catch (err) {
    console.error(`Failed to fetch audit logs for asset ${req.params.assetId}:`, err);
    return res.status(500).json({ error: "Internal server error retrieving history logs" });
  }
});

export default router;
