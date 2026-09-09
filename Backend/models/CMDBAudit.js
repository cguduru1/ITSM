// models/CMDBAudit.js
import mongoose from "mongoose";

const CMDBAuditSchema = new mongoose.Schema({
  ciId: { type: mongoose.Schema.Types.ObjectId, ref: "CI" },
  ciName: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  userName: String,
  action: String, // "CREATE", "UPDATE", "DELETE", "APPROVE", "REJECT"
  timestamp: { type: Date, default: Date.now },
  details: mongoose.Schema.Types.Mixed
});

export default mongoose.model("CMDBAudit", CMDBAuditSchema);
