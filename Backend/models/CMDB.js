//models/CMDB.js
import mongoose from "mongoose";

const CMDBSchema = new mongoose.Schema(
  {
    // SECTION 1 — General Info
    name: { type: String, required: true },
    operational_status: { type: String, default: "Operational" },
    asset_tag: { type: String },
    location: { type: String },
    environment: { type: String }, // Prod / Test / Dev
    serial_number: { type: String },
    manufacturer: { type: String },
    model_id: { type: String },

    // SECTION 2 — Ownership & Governance
    managed_by: { type: String },
    assignment_group: { type: String },
    supported_by: { type: String },
    business_criticality: { type: String },

    // SECTION 3 — Manual Audit Trail
    maintenance_method: { type: String, default: "Manual Entry" },
    last_attested: { type: Date },
    attested_by: { type: String },
    associated_change: { type: String },
    justification_doc: { type: String },

    // RELATIONSHIP FIELDS (corrected)
    dependencies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CMDB"
      }
    ],

    dependents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CMDB"
      }
    ],

    related_assets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Asset"
      }
    ],

    related_changes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Change"
      }
    ],

    // Health Score
    health_score: {
      type: Number,
      default: 100
    },

    // System fields
    createdBy: { type: String },
    updatedBy: { type: String }
  },
  { timestamps: true }
);

// Delete existing compiled model cache if present to prevent picking up old schema bindings
if (mongoose.models.CMDB) {
  delete mongoose.models.CMDB;
}

// ✅ Check existing compiled models and explicitly bind to the "cmdbs" collection
const CMDB = mongoose.models.CMDB || mongoose.model("CMDB", CMDBSchema, "cmdbs");

export default CMDB;
