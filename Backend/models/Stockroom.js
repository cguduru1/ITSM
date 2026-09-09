import mongoose from "mongoose";

const StockroomSchema = new mongoose.Schema({
  item: String,
  quantity: Number,
  location: String,
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Stockroom", StockroomSchema);
