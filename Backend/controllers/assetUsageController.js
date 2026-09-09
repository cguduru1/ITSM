import Asset from "../models/Asset.js";

export const getAssetUsage = async (req, res) => {
  try {
    const assets = await Asset.find();

    const usage = assets.map(a => ({
      assetId: a._id,
      name: a.name,
      cpuUsage: a.cpuUsage || 0,
      memoryUsage: a.memoryUsage || 0,
      diskUsage: a.diskUsage || 0,
      networkUsage: a.networkUsage || 0,
      lastUpdated: a.updatedAt
    }));

    res.json(usage);
  } catch (err) {
    console.error("ASSET USAGE ERROR:", err);
    res.status(500).json({ error: "Failed to load asset usage" });
  }
};
