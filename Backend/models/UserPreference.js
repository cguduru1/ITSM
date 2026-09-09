import mongoose from "mongoose";

const UserPreferenceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  theme: { type: String, default: "quantum" },
  language: { type: String, default: "en" },
  timezone: { type: String, default: "IST" },

  notificationsEnabled: { type: Boolean, default: true },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("UserPreference", UserPreferenceSchema);
