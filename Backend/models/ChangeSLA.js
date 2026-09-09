import mongoose from "mongoose";

const ChangeSLASchema = new mongoose.Schema({
  changeId: { type: mongoose.Schema.Types.ObjectId, ref: "Change", required: true },
  slaHours: Number,
  breached: { type: Boolean, default: false },
  evaluatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("ChangeSLA", ChangeSLASchema);
