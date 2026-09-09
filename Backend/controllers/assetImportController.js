import csv from "csvtojson";
import Asset from "../models/Asset.js";

export const importCSV = async (req, res) => {
  const json = await csv().fromString(req.body.csv);
  await Asset.insertMany(json);
  res.json({ message: "Imported" });
};
