import Asset from "../models/Asset.js";
import CMDB from "../models/CMDB.js";
import Change from "../models/Change.js";

export const getAssetGraph = async (req, res) => {
  const asset = await Asset.findById(req.params.id);

  const cis = await CMDB.find({ "related_assets": asset._id });
  const changes = await Change.find({ "related_assets": asset._id });

  res.json({
    asset,
    cis,
    changes
  });
};
