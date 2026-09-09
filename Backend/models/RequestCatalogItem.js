// itsm-backend/models/RequestCatalogItem.js
import mongoose from "mongoose";

const RequestCatalogItemSchema = new mongoose.Schema({
  name: String,
  category: String,
  description: String,
  defaultGroup: String,
  defaultPriority: String, // e.g. "P3"
  defaultImpact: String,
  defaultUrgency: String,
  ciTemplateId: { type: mongoose.Schema.Types.ObjectId, ref: "CI" }
});

export default mongoose.model("RequestCatalogItem", RequestCatalogItemSchema);
