import AssetLog from "../models/AssetLog.js";

export const getAssetTimeline = async (req, res) => {
  const logs = await AssetLog.find({ assetId: req.params.id })
    .sort({ createdAt: -1 });
  res.json(logs);
};
