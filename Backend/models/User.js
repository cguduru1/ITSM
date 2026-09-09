// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      trim: true 
    },

    password: { type: String, required: true },

    resetToken: { type: String, default: null },
    resetTokenExpiry: { type: Date, default: null },

    role: {
      type: String,
      default: "user", // 👈 FIX: Matches an allowed value in enum
      enum: ["admin", "agent", "user", "cmdb_viewer"]
    },

    permissions: { 
      type: Object, 
      default: { kb: ["read"] } // Default basic permissions
    },

    department: { type: String, default: "general" },
    tenant: { type: String, default: "default" },

    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "KnowledgeArticle" }],

    mfaEnabled: { type: Boolean, default: false },
    mfaCode: { type: Number, default: null },
    mfaExpires: { type: Date, default: null },

    googleId: { type: String, default: null },
    azureId: { type: String, default: null },

    lastLogin: { type: Date },
    lastIP: { type: String }
  },
  { timestamps: true }
);

// Prevent OverwriteModelError during hot reloading
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;