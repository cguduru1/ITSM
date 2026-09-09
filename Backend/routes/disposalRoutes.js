import express from "express";
import { disposeAsset } from "../controllers/disposalController.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const rec = await disposeAsset(req.body);
  res.json(rec);
});

export default router;
