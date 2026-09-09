// models/AuditLog.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const AuditLogSchema = new Schema({
  collectionName: { type: String, required: true, index: true },
  documentId: { type: Schema.Types.Mixed, required: true, index: true },
  operation: { type: String, enum: ["create", "update", "softDelete", "restore", "delete"], required: true },
  user: { type: String, default: null },
  before: { type: Schema.Types.Mixed, default: null },
  after: { type: Schema.Types.Mixed, default: null },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: false });

const AuditLog = mongoose.models?.AuditLog || mongoose.model("AuditLog", AuditLogSchema);
export default AuditLog;
