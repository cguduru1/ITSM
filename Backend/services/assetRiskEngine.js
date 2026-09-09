import Asset from "../models/Asset.js";
import CMDB from "../models/CMDB.js";
import Change from "../models/Change.js";

export const calculateRiskScore = async (assetId) => {
  const asset = await Asset.findById(assetId);

  let score = 0;

  // Warranty expired
  if (asset.warrantyExpiry && asset.warrantyExpiry < new Date()) {
    score += 30;
  }

  // Old assets
  if (asset.purchaseDate) {
    const ageYears = (Date.now() - asset.purchaseDate.getTime()) / (365 * 24 * 60 * 60 * 1000);
    if (ageYears > 5) score += 20;
  }

  // Status risk
  if (asset.status === "In Repair") score += 15;
  if (asset.status === "Retired") score += 10;

  // CI relationships
  const cis = await CMDB.find({ related_assets: assetId });
  score += cis.length * 5;

  // Change history
  const changes = await Change.find({ related_assets: assetId });
  score += changes.length * 3;

  return { assetId, score };
};
