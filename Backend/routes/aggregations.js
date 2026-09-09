// backend/routes/aggregations.js (ESM)
import express from "express";
import AssetMaster from "../models/AssetMaster.js";
import FinancialLifecycle from "../models/FinancialLifecycle.js";
import SoftwareLicense from "../models/SoftwareLicense.js"; // adjust if model name differs

const router = express.Router();

// Assets by status
router.get("/assets/status", async (req, res) => {
  try {
    const rows = await AssetMaster.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { status: "$_id", count: 1, _id: 0 } }
    ]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Monthly total book value
router.get("/assets/book-monthly", async (req, res) => {
  try {
    const rows = await FinancialLifecycle.aggregate([
      { $project: { month: { $dateToString: { format: "%Y-%m", date: "$purchaseDate" } }, currentBookValue: 1 } },
      { $group: { _id: "$month", totalBookValue: { $sum: "$currentBookValue" } } },
      { $sort: { _id: 1 } },
      { $project: { month: "$_id", totalBookValue: 1, _id: 0 } }
    ]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Warranty expiry buckets
router.get("/assets/warranty-buckets", async (req, res) => {
  try {
    const now = new Date();
    const rows = await FinancialLifecycle.aggregate([
      { $match: { warrantyExpiryDate: { $exists: true } } },
      { $project: { daysLeft: { $ceil: { $divide: [{ $subtract: ["$warrantyExpiryDate", now] }, 1000 * 60 * 60 * 24] } } } },
      {
        $bucket: {
          groupBy: "$daysLeft",
          boundaries: [ -10000, 0, 30, 60, 90, 180, 365, 10000 ],
          default: "Later",
          output: { count: { $sum: 1 } }
        }
      }
    ]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// License utilization
router.get("/licenses/utilization", async (req, res) => {
  try {
    const allocations = await SoftwareLicense.aggregate([
      {
        $lookup: {
          from: "softwareallocations",
          localField: "licenseId",
          foreignField: "licenseId",
          as: "allocs"
        }
      },
      {
        $project: {
          licenseId: 1,
          licenseName: 1,
          totalSeats: 1,
          allocated: { $size: "$allocs" }
        }
      }
    ]);
    res.json(allocations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
