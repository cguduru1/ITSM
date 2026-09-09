// models/FinancialLifecycle.js
import mongoose from "mongoose";
import softDeletePlugin from "../lib/plugins/softDelete.js";
import { attachAuditHooks } from "../lib/middleware/auditMiddleware.js";

const { Schema } = mongoose;

const FinancialLifecycleSchema = new Schema({
  financialId: { type: String, required: true, unique: true, trim: true },
  assetId: { type: String, required: true, ref: "AssetMaster" },
  financialType: { type: String, enum: ["purchase", "warranty", "disposal", "adjustment"], default: "purchase" },
  poNumber: { type: String, trim: true },
  invoiceNumber: { type: String, trim: true },
  vendorId: { type: String, trim: true },
  purchaseDate: { type: Date, required: true },
  warrantyExpiryDate: { type: Date, default: null },
  purchaseCost: { type: Number, required: true, min: 0 },
  depreciationMethod: { type: String, default: "Straight-Line", trim: true },
  residualValue: { type: Number, default: 0, min: 0 },
  depreciableLifeMonths: { type: Number, default: null, min: 0 },
  monthlyDepreciation: { type: Number, default: null },
  currentBookValue: { type: Number, default: null }
}, { timestamps: true });

// Compound index for asset history queries
FinancialLifecycleSchema.index({ assetId: 1, financialType: 1, createdAt: -1 });

// Soft delete plugin
FinancialLifecycleSchema.plugin(softDeletePlugin);

// Attach audit hooks if you use audit middleware
attachAuditHooks(FinancialLifecycleSchema);

// Pre-save validations and derived field computation
FinancialLifecycleSchema.pre("save", async function () {
  // Validate numeric fields
  if (this.depreciableLifeMonths != null && this.depreciableLifeMonths < 0) {
    throw new Error("depreciableLifeMonths must be non-negative");
  }

  if (this.purchaseCost != null && this.residualValue != null && this.residualValue > this.purchaseCost) {
    throw new Error("residualValue cannot exceed purchaseCost");
  }

  // Compute monthlyDepreciation for straight-line method when possible
  if (this.purchaseCost != null && this.depreciableLifeMonths != null && this.depreciableLifeMonths > 0) {
    const base = this.purchaseCost - (this.residualValue || 0);
    this.monthlyDepreciation = base / this.depreciableLifeMonths;
    // Ensure currentBookValue is set if not provided
    if (this.currentBookValue == null) this.currentBookValue = this.purchaseCost;
  } else {
    // If we cannot compute, clear monthlyDepreciation
    this.monthlyDepreciation = this.monthlyDepreciation ?? null;
  }
});

// Guarded model export to avoid OverwriteModelError on reloads
const FinancialLifecycle = mongoose.models?.FinancialLifecycle || mongoose.model("FinancialLifecycle", FinancialLifecycleSchema);
export default FinancialLifecycle;
