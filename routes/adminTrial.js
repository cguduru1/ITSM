import express from "express";
import auth from "../auth.js";
import { authorize } from "../authorize.js";
import Tenant from "../models/Tenant.js";

const router = express.Router();

// Enable trial
router.post("/on", auth, authorize("settings:update"), async (req, res) => {
  try {
    const tenant = await Tenant.findOne({ code: req.user.tenant });
    if (!tenant) return res.status(404).json({ error: "Tenant not found" });

    tenant.trial = true;
    tenant.trialExpiresOn = req.body.expiresOn || null;

    await tenant.save();
    res.json({ message: "Trial enabled", trial: tenant.trial });
  } catch (err) {
    console.error("Trial ON error:", err);
    res.status(500).json({ error: "Failed to enable trial" });
  }
});

// Disable trial
router.post("/off", auth, authorize("settings:update"), async (req, res) => {
  try {
    const tenant = await Tenant.findOne({ code: req.user.tenant });
    if (!tenant) return res.status(404).json({ error: "Tenant not found" });

    tenant.trial = false;
    await tenant.save();

    res.json({ message: "Trial disabled", trial: tenant.trial });
  } catch (err) {
    console.error("Trial OFF error:", err);
    res.status(500).json({ error: "Failed to disable trial" });
  }
});

export default router;
