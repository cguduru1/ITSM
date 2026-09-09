// models/AssetLog.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const AssetLogSchema = new Schema({
  assetId: { type: String, required: true, index: true },
  action: { type: String, required: true }, // Created, Updated, Deleted, SoftDeleted, Restored
  actor: { type: String, default: null },
  details: { type: Schema.Types.Mixed, default: null },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: false });

const AssetLog = mongoose.models?.AssetLog || mongoose.model("AssetLog", AssetLogSchema);
export default AssetLog;
