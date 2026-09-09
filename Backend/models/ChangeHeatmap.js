import mongoose from "mongoose";

const ChangeHeatmapSchema = new mongoose.Schema({
  date: String,
  count: Number
});

export default mongoose.model("ChangeHeatmap", ChangeHeatmapSchema);
