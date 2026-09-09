import mongoose from "mongoose";

const ChangeImpactSchema = new mongoose.Schema({
  changeId: { type: mongoose.Schema.Types.ObjectId, ref: "Change", required: true },
  affectedServices: [String],
  affectedCIs: [String],
  riskLevel: { type: String, enum: ["Low", "Medium", "High"], default: "Low" },
  impactScore: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("ChangeImpact", ChangeImpactSchema);
