import csv from "csvtojson";

export async function importCSV(filePath) {
  try {
    return await csv().fromFile(filePath);
  } catch (err) {
    console.error("CSV IMPORT ERROR:", err);
    return [];
  }
}
