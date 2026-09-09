// models/AssetMaster.js
import mongoose from "mongoose";
import softDeletePlugin from "../lib/plugins/softDelete.js";
import { attachAuditHooks } from "../lib/middleware/auditMiddleware.js";

const { Schema } = mongoose;

const AssetMasterSchema = new Schema({
  assetId: { 
    type: String, 
    unique: true, 
    sparse: true // 👈 Ignores null/undefined keys in unique index checks
  },
  assetTag: { type: String, required: true, unique: true, trim: true },
  serialNumber: { type: String, index: true, trim: true },
  modelId: { type: String, required: true, index: true, ref: "ProductCatalog" },
   // ✅ FIX: Changed required to false (or add default) to align with PO Receive parameters
  category: { type: String, index: true, required: false, default: "Unassigned", trim: true }, // Laptop, Server, Network
  status: { type: String, index: true, required: true, trim: true, enum: ["Active", "In-Stock", "Deployed", "Maintenance", "Retired"],default: "In-Stock" }, // Active, Retired, InRepair
  location: { type: String, trim: true },
  description: { type: String, trim: true },
  assignedTo: { type: String, trim: true }
}, { timestamps: true });

// Compound index: filter by category + status and sort by assetTag
AssetMasterSchema.index({ category: 1, status: 1, assetTag: 1 });

// Soft delete plugin (adds isDeleted, deletedAt and query filters)
AssetMasterSchema.plugin(softDeletePlugin);

// Attach audit hooks (single call)
attachAuditHooks(AssetMasterSchema);

// Example pre-save lifecycle hook (compute derived fields or enforce constraints)
AssetMasterSchema.pre("save", function (next) {
  if (this.assetTag) this.assetTag = String(this.assetTag).toUpperCase();
  next();
});

// Export guarded model to avoid OverwriteModelError on reloads
const AssetMaster = mongoose.models?.AssetMaster || mongoose.model("AssetMaster", AssetMasterSchema);
export default AssetMaster;
