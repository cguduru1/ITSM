import Audit from "../models/Audit.js";

export async function logAssetChanges(oldAsset, newAsset, user) {
  try {
    await Audit.create({
      assetId: newAsset._id,
      oldValue: oldAsset,
      newValue: newAsset,
      changedBy: user || "System",
      changedAt: new Date()
    });
  } catch (err) {
    console.error("AUDIT LOGGER ERROR:", err);
  }
}
