import mongoose from "mongoose";

const AssetUsageSchema = new mongoose.Schema({
  assetId: mongoose.Schema.Types.ObjectId,
  user: String,
  hoursUsed: Number,
  lastUsed: Date,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("AssetUsage", AssetUsageSchema);
