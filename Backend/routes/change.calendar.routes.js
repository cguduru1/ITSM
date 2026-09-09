import express from "express";
import { addToCalendar, getCalendar } from "../controllers/changeCalendarController.js";

const router = express.Router();

router.post("/", addToCalendar);
router.get("/", getCalendar);

export default router;
