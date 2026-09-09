import express from "express";
import Tenant from "../models/Tenant.js";
import auth from "../auth.js";
import { authorize } from "../authorize.js";

const router = express.Router();

router.get("/", auth, authorize("settings:update"), async (req, res) => {
  try {
    const tenant = await Tenant.findOne({ code: req.user.tenant });
    if (!tenant) return res.status(404).json({ error: "Tenant not found" });

    res.json({
      name: tenant.name,
      code: tenant.code,
      trial: tenant.trial,
      trialExpiresOn: tenant.trialExpiresOn,
      features: tenant.features,
      branding: tenant.branding,
      slaDefaults: tenant.slaDefaults
    });
  } catch (e) {
    res.status(500).json({ error: "Failed to load settings" });
  }
});

export default router;