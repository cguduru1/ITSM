import Asset from "../models/Asset.js";
import DisposalRecord from "../models/DisposalRecord.js";

export const disposeAsset = async (payload) => {
  const record = await DisposalRecord.create(payload);

  await Asset.findByIdAndUpdate(payload.assetId, {
    status: "Disposed",
    disposalDate: payload.disposalDate
  });

  return record;
};
