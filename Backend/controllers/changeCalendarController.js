import ChangeCalendar from "../models/ChangeCalendar.js";

export async function addToCalendar(req, res) {
  try {
    const entry = await ChangeCalendar.create(req.body);
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: "Failed to add change to calendar" });
  }
}

export async function getCalendar(req, res) {
  try {
    const calendar = await ChangeCalendar.find().populate("changeId");
    res.json(calendar);
  } catch (err) {
    res.status(500).json({ error: "Failed to load calendar" });
  }
}
