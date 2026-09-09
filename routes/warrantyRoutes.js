import express from "express";
import { autoCreateWarrantyClaim } from "../controllers/warrantyController.js";

const router = express.Router();

router.post("/auto", async (req, res) => {
  await autoCreateWarrantyClaim();
  res.json({ message: "Auto warranty claims executed" });
});

export default router;
