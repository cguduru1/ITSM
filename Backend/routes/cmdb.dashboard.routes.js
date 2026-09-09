import express from "express";
import CMDB from "../models/CMDB.js";

const router = express.Router();

// Dashboard Summary
router.get("/summary", async (req, res) => {
  try {
    const total = await CMDB.countDocuments();

    const byStatus = await CMDB.aggregate([
      { $group: { _id: "$operational_status", count: { $sum: 1 } } }
    ]);

    const byEnvironment = await CMDB.aggregate([
      { $group: { _id: "$environment", count: { $sum: 1 } } }
    ]);

    const byMaintenance = await CMDB.aggregate([
      { $group: { _id: "$maintenance_method", count: { $sum: 1 } } }
    ]);

    const attestationAging = await CMDB.aggregate([
      {
        $project: {
          name: 1,
          last_attested: 1,
          days: {
            $divide: [
              { $subtract: [new Date(), "$last_attested"] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      }
    ]);

    res.json({
      total,
      byStatus,
      byEnvironment,
      byMaintenance,
      attestationAging
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
