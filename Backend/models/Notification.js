import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  userId: String,
  title: String,
  message: String,
  read: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model("Notification", NotificationSchema);