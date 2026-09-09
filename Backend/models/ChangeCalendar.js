import mongoose from "mongoose";

const ChangeCalendarSchema = new mongoose.Schema({
  changeId: { type: mongoose.Schema.Types.ObjectId, ref: "Change", required: true },
  startDate: Date,
  endDate: Date,
  windowType: { type: String, enum: ["Maintenance", "Deployment", "Upgrade"] },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("ChangeCalendar", ChangeCalendarSchema);
