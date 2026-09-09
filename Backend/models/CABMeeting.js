// models/CABMeeting.js
import mongoose from "mongoose";

const CABMeetingSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  status: { type: String, enum: ["Upcoming", "Completed"], default: "Upcoming" },
  agenda: { type: String, required: true },
  attendees: [{ type: String }],
  signedOff: { type: Boolean, default: false }
});

const CABMeeting = mongoose.model("CABMeeting", CABMeetingSchema);
export default CABMeeting;
