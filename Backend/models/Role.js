// models/Role.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const PermissionSchema = new Schema({
  resource: { type: String, required: true }, // e.g., "change_request"
  actions: [{ type: String, enum: ['create','read','update','delete'] }]
}, { _id: false });

const RoleSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  permissions: [
    {
      resource: String,
      action: String
    }
  ],    
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Role", RoleSchema);
