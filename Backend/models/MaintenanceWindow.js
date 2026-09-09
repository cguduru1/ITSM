// itsm-backend/models/MaintenanceWindow.js
import mongoose from "mongoose";

const MaintenanceWindowSchema = new mongoose.Schema({
  name: { type: String, required: true },

  description: String,

  // e.g., "Database", "Network", "Application"
  ciType: String,

  // Which CIs this window applies to
  cis: [{ type: mongoose.Schema.Types.ObjectId, ref: "CI" }],

  // Allowed time window
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },

  // Recurrence (optional)
  recurrence: {
    type: String,
    enum: ["None", "Daily", "Weekly", "Monthly"],
    default: "None"
  },

  createdById: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdByName: String,

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("MaintenanceWindow", MaintenanceWindowSchema);
