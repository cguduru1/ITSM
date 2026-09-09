// models/UserRole.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const UserRoleSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  roleId: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
  scope: { type: Schema.Types.Mixed, default: {} },
  grantedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  grantedAt: { type: Date, default: Date.now }
});

export default mongoose.model("UserRole", UserRoleSchema);