// routes/meetings.js
import express from "express";
import CABMeeting from "../models/CABMeeting.js";

const router = express.Router();

// Get all meetings
router.get("/", async (req, res) => {
  try {
    const meetings = await CABMeeting.find().sort({ date: 1 });
    res.json(meetings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new meeting
router.post("/", async (req, res) => {
  try {
    const meeting = new CABMeeting(req.body);
    await meeting.save();
    res.json(meeting);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update meeting (reschedule or sign‑off)
router.put("/:id", async (req, res) => {
  try {
    const meeting = await CABMeeting.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(meeting);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete meeting
router.delete("/:id", async (req, res) => {
  try {
    await CABMeeting.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
