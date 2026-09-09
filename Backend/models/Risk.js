import mongoose from "mongoose";

const RiskSchema = new mongoose.Schema({
  assetId: String,
  riskLevel: String,
  description: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Risk", RiskSchema);
