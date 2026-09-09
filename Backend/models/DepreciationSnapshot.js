// backend/models/DepreciationSnapshot.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const DepreciationSnapshotSchema = new Schema({
  createdAt: { type: Date, default: Date.now },
  rows: { type: Array, default: [] }
}, { timestamps: false });

// Guard against OverwriteModelError when modules are reloaded
const DepreciationSnapshot = mongoose.models?.DepreciationSnapshot || mongoose.model("DepreciationSnapshot", DepreciationSnapshotSchema);

export default DepreciationSnapshot;
