// backend/services/assetService.js
import AssetMaster from "../models/AssetMaster.js";

export async function createAsset(doc, session = null) {
  const options = session ? { session } : {};
  // Mongoose requires an array syntax when passing options to .create()
  const [createdAsset] = await AssetMaster.create([doc], options);
  return createdAsset;
}

export async function bulkCreateAssets(docs, session = null) {
  if (!Array.isArray(docs) || docs.length === 0) {
    return [];
  }
  const options = session ? { session } : {};
  return await AssetMaster.insertMany(docs, options);
}
