// models/EmergencyChange.js
import mongoose from "mongoose";

const emergencyChangeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    linkedIncident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Incident",
      required: true
    },
    approver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending"
    },
    rollbackPlan: { type: String, required: true },
    tenant: { type: String, default: "default" },

    // Self-referencing relationship using ObjectIds (Fixes ReferenceError)
    changes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EmergencyChange"
      }
    ],

    postImplementationReview: {
      completed: { type: Boolean, default: false },
      notes: { type: String, default: "" }
    }
  },
  { timestamps: true }
);

// Fixed variable case: emergencyChangeSchema (lowercase e)
export default mongoose.model("EmergencyChange", emergencyChangeSchema);