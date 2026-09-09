// models/SoftwareLicense.js
import mongoose from "mongoose";
import softDeletePlugin from "../lib/plugins/softDelete.js";
import { attachAuditHooks } from "../lib/middleware/auditMiddleware.js";

const { Schema } = mongoose;

const SoftwareLicenseSchema = new Schema({
  // Removed `unique: true` here so it doesn't collide with plugins or manual indexes
  licenseId: { type: String, required: true, trim: true },
  licenseName: { type: String, required: true, trim: true },
  vendor: { type: String, trim: true },
  totalSeats: { type: Number, default: 0, min: 0 },
  seatsInUse: { type: Number, default: 0, min: 0 },
  purchasedAt: { type: Date, default: null },
  expiryDate: { type: Date, default: null },
  metadata: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

// Useful indexes (DO NOT add licenseId here)
SoftwareLicenseSchema.index({ vendor: 1 });
SoftwareLicenseSchema.index({ expiryDate: 1 });

// Soft delete plugin
SoftwareLicenseSchema.plugin(softDeletePlugin);

// Attach audit hooks
attachAuditHooks(SoftwareLicenseSchema);

// Example pre-save validation
SoftwareLicenseSchema.pre("save", async function () {
  if (this.seatsInUse > this.totalSeats) {
    throw new Error("seatsInUse cannot exceed totalSeats");
  }
});

const SoftwareLicense = mongoose.models?.SoftwareLicense || mongoose.model("SoftwareLicense", SoftwareLicenseSchema);
export default SoftwareLicense;
