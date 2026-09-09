import Asset from "../models/Asset.js";

export const exportCSV = async (req, res) => {
  const assets = await Asset.find();

  let csv = "Name,Type,Status,Owner\n";
  assets.forEach(a => {
    csv += `${a.name},${a.type},${a.status},${a.owner}\n`;
  });

  res.setHeader("Content-Type", "text/csv");
  res.send(csv);
};
