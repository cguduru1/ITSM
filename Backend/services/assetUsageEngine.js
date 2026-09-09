import AssetUsage from "../models/AssetUsage.js";

export const getUsageAnalytics = async (assetId) => {
  const logs = await AssetUsage.find({ assetId });

  const totalHours = logs.reduce((sum, l) => sum + l.hoursUsed, 0);
  const lastUsed = logs.sort((a, b) => b.lastUsed - a.lastUsed)[0]?.lastUsed;

  return {
    assetId,
    totalHours,
    lastUsed,
    usageCount: logs.length
  };
};
