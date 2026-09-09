import mongoose from "mongoose";

const ChangeTimelineSchema = new mongoose.Schema({
  changeId: String,
  action: String,
  details: String,
  user: String,
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model("ChangeTimeline", ChangeTimelineSchema);
