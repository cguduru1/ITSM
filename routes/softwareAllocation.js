import express from "express";
import SoftwareAllocation from "../models/SoftwareAllocation.js";
import SoftwareLicense from "../models/SoftwareLicense.js";

const router = express.Router();

// Create allocation (validate target)
router.post("/", async (req, res) => {
  try {
    const { licenseId, assetId, assignedUserId } = req.body;
    if (!assetId && !assignedUserId) return res.status(400).json({ error: "assetId or assignedUserId required" });

    const alloc = await SoftwareAllocation.create(req.body);

    // Optionally return updated compliance counts
    const license = await SoftwareLicense.findOne({ licenseId });
    res.status(201).json({ allocation: alloc, license });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List allocations
router.get("/", async (req, res) => {
  const q = {};
  if (req.query.licenseId) q.licenseId = req.query.licenseId;
  const list = await SoftwareAllocation.find(q).limit(200).sort({ allocatedAt: -1 });
  res.json(list);
});

// Delete allocation (revoke)
router.delete("/:allocationId", async (req, res) => {
  await SoftwareAllocation.deleteOne({ allocationId: req.params.allocationId });
  res.status(204).end();
});

export default router;
