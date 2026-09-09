import mongoose from "mongoose";

const DepreciationRuleSchema = new mongoose.Schema({
  assetType: { type: String, required: true },
  method: { type: String, enum: ["SLM", "DBM"], default: "SLM" }, // Straight Line / Declining Balance
  usefulLifeYears: { type: Number, required: true },
  salvageValue: { type: Number, default: 0 },
  rate: { type: Number }, // For DBM
}, { timestamps: true });

export default mongoose.model("DepreciationRule", DepreciationRuleSchema);
