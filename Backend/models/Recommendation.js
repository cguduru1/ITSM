// backend/models/Recommendation.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const RecommendationSchema = new Schema({
  assetId: { type: String, required: true },
  score: Number,
  reasons: { type: [String], default: [] },
  severity: String,
  snapshot: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  handled: { type: Boolean, default: false },
  handledBy: { type: String, default: null },
  handledAt: { type: Date, default: null },
  action: { type: String, default: null } // e.g., "approved-replace", "ignored"
});

export default mongoose.model("Recommendation", RecommendationSchema);
