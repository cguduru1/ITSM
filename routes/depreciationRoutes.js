import express from "express";
import { runDepreciation } from "../controllers/depreciationController.js";

const router = express.Router();

router.post("/run", async (req, res) => {
  await runDepreciation();
  res.json({ message: "Depreciation executed" });
});

export default router;
