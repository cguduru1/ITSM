import Relationship from "../models/Relationship.js";

export async function getAssetRelationships(assetId) {
  try {
    return await Relationship.find({ source: assetId });
  } catch (err) {
    console.error("RELATIONSHIP ENGINE ERROR:", err);
    return [];
  }
}
