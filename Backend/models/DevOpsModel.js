// models/DevOpsModel.js
import mongoose from "mongoose";

const devOpsModelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  pipeline: { type: String, required: true },
  status: {
    type: String,
    enum: ["Active", "Inactive", "Deprecated"],
    default: "Active"
  }
});

const devOpsSchema = new mongoose.Schema(
  {
    tenant: { type: String, default: "default" },
    models: [devOpsModelSchema]
  },
  { timestamps: true }
);

const DevOpsModel = mongoose.model("DevOpsModel", devOpsSchema);
export default DevOpsModel;
