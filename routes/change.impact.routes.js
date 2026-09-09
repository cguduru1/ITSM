import express from "express";
import { calculateImpact } from "../controllers/changeImpactController.js";

const router = express.Router();

router.post("/", calculateImpact);

export default router;
