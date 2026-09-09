import express from "express";
import { evaluateSLA } from "../controllers/changeSlaController.js";

const router = express.Router();

router.post("/", evaluateSLA);

export default router;
