import mongoose from "mongoose";

const DiscoveryLogSchema = new mongoose.Schema({
  ip: String,
  hostname: String,
  os: String,
  services: [String],
  classifiedType: String,
  anomaly: Boolean,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("DiscoveryLog", DiscoveryLogSchema);
