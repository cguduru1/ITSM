import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema({
  userId: String,
  sessionId: String,
  messages: [
    {
      sender: String,
      text: String,
      time: Number
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Chat", ChatSchema);
