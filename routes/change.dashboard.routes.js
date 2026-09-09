import express from "express";
import Change from "../models/Change.js";
import CMDB from "../models/CMDB.js";

const router = express.Router();

router.get("/summary", async (req, res) => {
  const total = await Change.countDocuments();

  const byStatus = await Change.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);

  const byType = await Change.aggregate([
    { $group: { _id: "$type", count: { $sum: 1 } } }
  ]);

  const emergency = await Change.countDocuments({ type: "Emergency" });

  const prodImpact = await Change.aggregate([
    {
      $lookup: {
        from: "cmdbs",
        localField: "related_cis",
        foreignField: "_id",
        as: "cis"
      }
    },
    {
      $match: { "cis.environment": "Prod" }
    },
    { $count: "count" }
  ]);

  res.json({
    total,
    byStatus,
    byType,
    emergency,
    prodImpact: prodImpact[0]?.count || 0
  });
});

export default router;
