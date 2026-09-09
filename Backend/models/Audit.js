import mongoose from "mongoose";

const AuditSchema = new mongoose.Schema({
  assetId: String,
  oldValue: Object,
  newValue: Object,
  changedBy: String,
  changedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Audit", AuditSchema);
