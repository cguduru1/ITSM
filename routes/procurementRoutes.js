import express from "express";
import ProcurementRequest from "../models/ProcurementRequest.js";
import { updateProcurementStatus } from "../controllers/procurementController.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const pr = await ProcurementRequest.create(req.body);
  res.json(pr);
});

router.put("/:id/status", async (req, res) => {
  const pr = await updateProcurementStatus(req.params.id, req.body.status);
  res.json(pr);
});

export default router;
