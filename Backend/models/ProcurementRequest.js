import mongoose from "mongoose";

const ProcurementRequestSchema = new mongoose.Schema({
  itemName: String,
  quantity: Number,
  requestedBy: String,
  status: { type: String, enum: ["Requested", "Approved", "Ordered", "Delivered"], default: "Requested" },
  vendor: String,
  poNumber: String,
}, { timestamps: true });

export default mongoose.model("ProcurementRequest", ProcurementRequestSchema);
