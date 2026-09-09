import { getUsageAnalytics } from "../services/assetUsageEngine.js";

export const getAssetUsage = async (req, res) => {
  const analytics = await getUsageAnalytics(req.params.id);
  res.json(analytics);
};
