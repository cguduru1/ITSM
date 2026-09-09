import QRCode from "qrcode";
import Asset from "../models/Asset.js";

export const getAssetQR = async (req, res) => {
  const asset = await Asset.findById(req.params.id);

  const qrData = {
    id: asset._id.toString(),
    name: asset.name,
    type: asset.type,
    status: asset.status
  };

  const qr = await QRCode.toDataURL(JSON.stringify(qrData));
  res.json({ qr });
};
