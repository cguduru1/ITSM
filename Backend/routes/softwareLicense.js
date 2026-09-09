import express from "express";
import SoftwareLicense from "../models/SoftwareLicense.js";

const router = express.Router();

// Create license
router.post("/", async (req, res) => {
  try {
    const doc = await SoftwareLicense.create(req.body);
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List licenses
router.get("/", async (req, res) => {
  const docs = await SoftwareLicense.find().sort({ softwareName: 1 });
  res.json(docs);
});

// Get single
router.get("/:licenseId", async (req, res) => {
  const doc = await SoftwareLicense.findOne({ licenseId: req.params.licenseId });
  if (!doc) return res.status(404).json({ error: "Not found" });
  res.json(doc);
});

// Update
router.put("/:licenseId", async (req, res) => {
  const doc = await SoftwareLicense.findOneAndUpdate({ licenseId: req.params.licenseId }, req.body, { new: true });
  res.json(doc);
});

export default router;
