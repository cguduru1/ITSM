import PDFDocument from "pdfkit";
import Asset from "../models/Asset.js";

export const generateAssetPDF = async (req, res) => {
  const asset = await Asset.findById(req.params.id);

  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");

  doc.text(`Asset Report: ${asset.name}`);
  doc.text(`Type: ${asset.type}`);
  doc.text(`Status: ${asset.status}`);
  doc.text(`Owner: ${asset.owner}`);
  doc.text(`Description: ${asset.description}`);

  doc.end();
  doc.pipe(res);
};
