import mongoose from "mongoose";

const AssetSchema = new mongoose.Schema({
  assetTag: { type: String, required: [true, "Asset Tag is required"], unique: true, trim: true },
  category: { type: String, required: [true, "Category is required"], trim: true }, // Laptop, Server, Network
  modelId: { type: String, required: true, ref: "ProductCatalog" },
  status: { type: String, default: "In-Stock", enum: ["In-Stock", "Active", "Deployed", "Retired", "Maintenance"] },

  name: { type: String, trim: true },
  owner: { type: String, trim: true },
  description: { type: String, trim: true },
  serialNumber: { type: String, trim: true },
  vendor: { type: String, trim: true },
  location: { type: String, trim: true },
  purchaseDate: { type: Date },
  warrantyExpiry: { type: Date },
  cost: { type: Number },
  tags: [{ type: String, trim: true }],
  relationships: [
    {
      ciId: { type: mongoose.Schema.Types.ObjectId, ref: "CMDB" },
      relation: { type: String, trim: true }
    }
  ],
}, { timestamps: true });

// Export guarded model
// const Asset = mongoose.models?.Asset || mongoose.model("Asset", AssetSchema);
const Asset = mongoose.model("Asset", AssetSchema, "assets");
export default Asset;
