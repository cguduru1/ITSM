import mongoose from "mongoose";

const SoftwareLicenseSchema = new mongoose.Schema({
  licenseId: { type: String, required: true, unique: true },
  softwareName: { type: String, required: true },
  publisher: { type: String, required: true },
  licenseType: { type: String, required: true }, // Per-User, Per-Core, SaaS, Concurrent
  totalSeatsPurchased: { type: Number, default: 0 },
  allocationType: { type: String }, // Device-bound or User-bound
  renewalDate: { type: Date },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// SoftwareLicenseSchema.index({ licenseId: 1 });
SoftwareLicenseSchema.index({ isActive: 1 });

export default mongoose.model("SoftwareLicense", SoftwareLicenseSchema);
