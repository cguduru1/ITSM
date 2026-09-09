// models/CIMapping.js
import mongoose from "mongoose";

const mappingSchema = new mongoose.Schema({
  ci: { type: String, required: true },
  service: { type: String, required: true },
  risk: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Low"
  }
});

const ciMappingSchema = new mongoose.Schema(
  {
    tenant: { type: String, default: "default" },
    mappings: [mappingSchema]
  },
  { timestamps: true }
);

const CIMapping = mongoose.model("CIMapping", ciMappingSchema);
export default CIMapping;
