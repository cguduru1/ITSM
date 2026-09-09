import mongoose from "mongoose";

const AssetAuditSchema = new mongoose.Schema({
  assetId: mongoose.Schema.Types.ObjectId,
  field: String,
  oldValue: String,
  newValue: String,
  updatedBy: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("AssetAudit", AssetAuditSchema);
