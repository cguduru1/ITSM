import mongoose from "mongoose";

const ChangeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  status: { type: String, enum: ["Open", "In Progress", "Completed"], default: "Open" },
  requestedBy: { type: String, required: true },
  description: { type: String },
  related_cis: [String],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Change", ChangeSchema);
    