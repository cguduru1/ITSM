import mongoose from "mongoose";

const UsageSchema = new mongoose.Schema({
  assetId: String,
  user: String,
  lastUsed: Date,
  usageHours: Number,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Usage", UsageSchema);
