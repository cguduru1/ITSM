import { calculateRiskScore } from "../services/assetRiskEngine.js";

export const getAssetRisk = async (req, res) => {
  const result = await calculateRiskScore(req.params.id);
  res.json(result);
};
