import Asset from "../models/Asset.js";
import CMDB from "../models/CMDB.js";

export const syncCI = async (ciId) => {
  const ci = await CMDB.findById(ciId);
  const assets = await Asset.find({ "relationships.ciId": ciId });

  return {
    ci,
    assets,
    count: assets.length
  };
};
