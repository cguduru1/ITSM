// ./models/ApproverMapping.js
// ESM Mongoose model for approver mapping used by the service layer
import mongoose from 'mongoose';
const { Schema } = mongoose;

const ApproverMappingSchema = new Schema({
  changeType: { type: String, default: '' },   // e.g., "Database", "Network", "All"
  category: { type: String, default: '' },     // optional category
  requiredGroup: { type: String, required: true }, // e.g., "Security", "CloudOps"
  minApprovals: { type: Number, default: 1 },  // how many approvals required from the group
  createdAt: { type: Date, default: Date.now }
});

ApproverMappingSchema.index({ changeType: 1, category: 1, requiredGroup: 1 }, { unique: false });

const ApproverMapping = mongoose.models?.ApproverMapping || mongoose.model('ApproverMapping', ApproverMappingSchema);
export default ApproverMapping;
