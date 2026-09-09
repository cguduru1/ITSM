import mongoose from "mongoose";

const ChangeReportSchema = new mongoose.Schema({
  changeId: { type: mongoose.Schema.Types.ObjectId, ref: "Change", required: true },
  summary: String,
  riskLevel: String,
  impactScore: Number,
  slaBreached: Boolean,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("ChangeReport", ChangeReportSchema);
