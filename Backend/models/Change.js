// models/Change.js
import mongoose from "mongoose";

const changeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },

    model: {
      type: String,
      enum: ["normal", "standard", "emergency", "devops"],
      default: "normal"
    },

    status: {
      type: String,
      enum: [
        "Draft",
        "Requested",
        "Authorize",   // Added so state transition logic doesn't fail validation
        "Scheduled",   // Added so state transition logic doesn't fail validation
        "Pending",
        "Approved",
        "Open",
        "In Progress",
        "Completed",
        "Closed",
        "Cancelled"
      ],
      default: "Draft"
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium"
    },

    requestedBy: { type: String },
    assignedTo: { type: String },

    plannedStart: { type: Date },
    plannedEnd: { type: Date },
    actualStart: { type: Date },
    actualEnd: { type: Date },

    relatedAssets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Asset" }],
    relatedCIs: [{ type: mongoose.Schema.Types.ObjectId, ref: "CMDB" }],

    riskScore: { type: Number, default: 0 },
    riskLevel: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Low"
    },

    tenant: { type: String, default: "default" },

    timeline: [
      {
        event: { type: String },
        timestamp: { type: Date, default: Date.now }
      }
    ],

    stateHistory: [
      {
        from: { type: String },
        to: { type: String },
        by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        reason: { type: String },
        at: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

const Change = mongoose.model("Change", changeSchema); 
export default Change;