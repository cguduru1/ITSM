import Asset from "../models/Asset.js";

export async function lifecycleEngine(asset) {
  try {
    if (!asset) return;

    // Example lifecycle logic
    if (asset.status === "In Use") {
      asset.lastUsed = new Date();
    }

    await asset.save();
    return asset;
  } catch (err) {
    console.error("LIFECYCLE ENGINE ERROR:", err);
  }
}
