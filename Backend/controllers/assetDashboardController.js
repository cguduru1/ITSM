import Asset from "../models/Asset.js";

export const getAssetDashboard = async (req, res) => {
  const total = await Asset.countDocuments();
  const byStatus = await Asset.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);
  const byType = await Asset.aggregate([
    { $group: { _id: "$type", count: { $sum: 1 } } }
  ]);
  const expiringWarranty = await Asset.find({
    warrantyExpiry: { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
  }).countDocuments();

  res.json({
    total,
    byStatus,
    byType,
    expiringWarranty
  });
};
