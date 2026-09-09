import mongoose from "mongoose";

const RelationshipSchema = new mongoose.Schema({
  source: String,
  target: String,
  type: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Relationship", RelationshipSchema);
