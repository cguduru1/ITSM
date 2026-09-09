import Usage from "../models/Usage.js";

export async function trackUsage(asset, user) {
  try {
    return await Usage.create({
      assetId: asset._id,
      user,
      lastUsed: new Date(),
      usageHours: Math.floor(Math.random() * 10)
    });
  } catch (err) {
    console.error("USAGE ENGINE ERROR:", err);
  }
}
