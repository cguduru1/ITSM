// backend/models/RecommendationSnapshot.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const RecommendationSnapshotSchema = new Schema({
  createdAt: { type: Date, default: Date.now },
  count: { type: Number, default: 0 },
  recommendations: { type: Array, default: [] }
}, { timestamps: false });

const RecommendationSnapshot = mongoose.models?.RecommendationSnapshot || mongoose.model("RecommendationSnapshot", RecommendationSnapshotSchema);

export default RecommendationSnapshot;
