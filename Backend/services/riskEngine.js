import Risk from "../models/Risk.js";

export async function calculateRisk(asset) {
  try {
    const riskLevel = asset.status === "Critical" ? "High" : "Low";

    return await Risk.create({
      assetId: asset._id,
      riskLevel,
      description: `Auto risk evaluation for ${asset.name}`
    });
  } catch (err) {
    console.error("RISK ENGINE ERROR:", err);
  }
}
