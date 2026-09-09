import mongoose from "mongoose";

const WarrantyClaimSchema = new mongoose.Schema({
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: "Asset", required: true },
  vendor: String,
  issue: String,
  status: { type: String, enum: ["Open", "Submitted", "Approved", "Rejected", "Closed"], default: "Open" },
  claimDate: Date,
  resolutionDate: Date,
}, { timestamps: true });

export default mongoose.model("WarrantyClaim", WarrantyClaimSchema);
