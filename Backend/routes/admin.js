import express from "express";
import auth from "../auth.js";
import { authorize } from "../authorize.js";
import User from "../models/User.js";

const router = express.Router();

router.get("/users", auth, authorize("user:manage"), async (req, res) => {
  const users = await User.find({ tenant: req.user.tenant });
  res.json(users);
});

router.put("/users/:id", auth, authorize("user:manage"), async (req, res) => {
  const { role, department } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role: req.body.role, department },
    { new: true }
  );

  res.json(user);
});

router.get("/settings", auth, authorize("settings:update"), async (req, res) => {
  res.json({ slaDefaults: {}, branding: {}, features: {} });
});

export default router;
