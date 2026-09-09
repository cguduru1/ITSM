import Asset from "../models/Asset.js";
import WarrantyClaim from "../models/WarrantyClaim.js";

export const autoCreateWarrantyClaim = async () => {
  const assets = await Asset.find({ warrantyExpiry: { $exists: true } });

  for (const a of assets) {
    if (new Date(a.warrantyExpiry) < Date.now()) continue;

    if (a.healthScore < 40) {
      await WarrantyClaim.create({
        assetId: a._id,
        vendor: a.vendor,
        issue: "Auto-detected failure risk",
        claimDate: new Date(),
        status: "Submitted"
      });
    }
  }

  console.log("Auto warranty claims created");
};
