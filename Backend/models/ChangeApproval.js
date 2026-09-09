// itsm-backend/models/ChangeApproval.js
import mongoose from "mongoose";

const ChangeApprovalSchema = new mongoose.Schema(
  {
    changeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChangeRequest",
      required: true
    },

    approverGroup: { type: String },

    approverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    approverName: String,

    // Matches decision in routes/changes.js ("Approved", "Rejected", "Pending")
    decision: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Approved", "Rejected"]
    },

    // Matches comment in routes/changes.js
    comment: { type: String },

    metadata: {
      ip: String,
      userAgent: String
    },

    approvedAt: Date,
    rejectedAt: Date
  },
  { timestamps: true }
);

// FIX: Prevents OverwriteModelError during module re-imports/hot reloads
export default mongoose.models.ChangeApproval ||
  mongoose.model("ChangeApproval", ChangeApprovalSchema);