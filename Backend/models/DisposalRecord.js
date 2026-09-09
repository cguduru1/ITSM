import mongoose from "mongoose";

const DisposalRecordSchema = new mongoose.Schema({
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: "Asset" },
  disposalType: { type: String, enum: ["Scrap", "Resell", "Recycle"] },
  disposalDate: Date,
  amountRecovered: Number,
  approvedBy: String,
}, { timestamps: true });

export default mongoose.model("DisposalRecord", DisposalRecordSchema);
