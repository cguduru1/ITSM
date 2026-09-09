// itsm-backend/models/CI.js
import mongoose from "mongoose";

const CISchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true }, // Server, Database, Application, Network, etc.

    owner: String,
    environment: { type: String, required: true, default: "Production" }, // Prod, QA, Dev

    status: { type: String, default: "Active" }, // Active, Retired, Maintenance

    location: String,
     ipAddress: String,
    serialNumber: String,

    // Relationships
    dependsOn: [{ type: mongoose.Schema.Types.ObjectId, ref: "CI" }],
    usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "CI" }],

    metrics: {
      cpuUsage: { type: Number, default: 0 },       // Threshold: > 85 = Warning, > 95 = Critical
      memoryUsage: { type: Number, default: 0 },
      status: { type: String, default: "Operational" } // Operational, Warning, Critical
    },

    // Health
    healthStatus: {
      type: String,
      default: "Healthy",
      enum: ["Healthy", "Warning", "Critical"]
    },

    lastErrorLog: { type: String, default: null } // FIXED: Added missing leading comma
  },
  { timestamps: true } // FIXED: Correctly closed schema definition object block
);

export default mongoose.model("CI", CISchema);
