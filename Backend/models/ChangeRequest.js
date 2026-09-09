import mongoose from "mongoose";

const ChangeRequestSchema = new mongoose.Schema(
  {
    number: String,
    title: { type: String, required: true },
    description: String,

    // Matches database fields (supports both 'model' and 'type' for compatibility)
    model: { type: String, default: "normal" },
    type: { type: String, default: "Normal" },

    status: { type: String, default: "Draft" },
    priority: { type: String, default: "Medium" },

    risk: { type: String, default: "Low" },
    riskLevel: { type: String, default: "Low" },
    riskScore: { type: Number, default: 0 },
    impact: { type: String, default: "Low" },
    urgency: { type: String, default: "Low" },

    tenant: { type: String, default: "default" },

    requesterId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    requesterName: String,

    assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assigneeName: String,
    group: String,

    relatedAssets: { type: Array, default: [] },
    relatedCIs: { type: Array, default: [] },
    timeline: { type: Array, default: [] },
    stateHistory: { type: Array, default: [] },

    plannedStart: Date,
    plannedEnd: Date
  },
  { 
    timestamps: true // Automatically handles createdAt and updatedAt
  }
);

// Explicitly pass "changes" as the 3rd argument to target your existing MongoDB collection
export default mongoose.models.ChangeRequest ||
  mongoose.model("ChangeRequest", ChangeRequestSchema, "changes");