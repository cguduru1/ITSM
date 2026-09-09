import mongoose from "mongoose";

const LicenseSchema = new mongoose.Schema({
  software: String,
  totalSeats: Number,
  usedSeats: Number,
  expiryDate: Date,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("License", LicenseSchema);
