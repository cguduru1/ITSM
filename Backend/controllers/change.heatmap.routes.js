import express from "express";
import { getHeatmap } from "../controllers/changeHeatmapController.js";

const router = express.Router();

router.get("/", getHeatmap);

module.exports = router;
