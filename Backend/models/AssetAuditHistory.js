import mongoose from "mongoose";

const AssetAuditHistorySchema = new mongoose.Schema({
  auditId: { type: String, default: () => new mongoose.Types.ObjectId().toString(), unique: true },
  assetId: { type: String, ref: "AssetMaster" },
  actionType: { type: String, required: true }, // Status-Change, Assignment, Check-In
  oldValue: { type: String },
  newValue: { type: String },
  changedBy: { type: String },
  changedAt: { type: Date, default: Date.now }
});

AssetAuditHistorySchema.index({ assetId: 1 });
AssetAuditHistorySchema.index({ changedAt: -1 });

export default mongoose.model("AssetAuditHistory", AssetAuditHistorySchema);
