import express from "express";
import { runFailureModel } from "../controllers/failureController.js";

const router = express.Router();

router.post("/run", async (req, res) => {
  await runFailureModel();
  res.json({ message: "AI failure model executed" });
});

export default router;
