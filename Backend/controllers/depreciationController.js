import Asset from "../models/Asset.js";
import DepreciationRule from "../models/DepreciationRule.js";

export const runDepreciation = async () => {
  const assets = await Asset.find({ purchaseDate: { $exists: true } });

  for (const a of assets) {
    const rule = await DepreciationRule.findOne({ assetType: a.type });
    if (!rule) continue;

    const yearsUsed = (Date.now() - new Date(a.purchaseDate)) / (1000 * 60 * 60 * 24 * 365);
    let depreciation = 0;

    if (rule.method === "SLM") {
      depreciation = ((a.cost - rule.salvageValue) / rule.usefulLifeYears) * yearsUsed;
    } else {
      depreciation = a.cost * Math.pow((1 - rule.rate), yearsUsed);
    }

    a.depreciationValue = Math.min(depreciation, a.cost);
    await a.save();
  }

  console.log("Depreciation updated for all assets");
};
