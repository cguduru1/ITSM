import Asset from "../models/Asset.js";
import { calculateFailureRisk } from "../utils/failureModel.js";

export const runFailureModel = async () => {
  const assets = await Asset.find();

  for (const a of assets) {
    a.failureRisk = calculateFailureRisk(a);
    await a.save();
  }

  console.log("Failure risk updated");
};
