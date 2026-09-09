// models/ProductCatalog.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const ProductCatalogSchema = new Schema({
  modelId: { type: String, required: true, unique: true, trim: true },
  manufacturer: { type: String, required: true, trim: true },
  modelName: { type: String, required: true, trim: true },
  modelNumber: { type: String, trim: true },
  assetCategory: { type: String, required: true, trim: true }, // Laptop, Server, Network
  specifications: { type: Schema.Types.Mixed },
  supportEndDate: { type: Date }
}, { timestamps: true });

// Compound index for common lookups by category and manufacturer
ProductCatalogSchema.index({ assetCategory: 1, manufacturer: 1, modelName: 1 });

const ProductCatalog = mongoose.models?.ProductCatalog || mongoose.model("ProductCatalog", ProductCatalogSchema);
export default ProductCatalog;
