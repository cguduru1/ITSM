import AssetAudit from "../models/AssetAudit.js";

export const getAssetAudit = async (req, res) => {
  const logs = await AssetAudit.find({ assetId: req.params.id }).sort({ createdAt: -1 });
  res.json(logs);
};
