import PDFDocument from "pdfkit";

export function generateAssetPDF(asset) {
  const doc = new PDFDocument();
  doc.text(`Asset Report for ${asset.name}`);
  doc.text(`Type: ${asset.type}`);
  doc.text(`Status: ${asset.status}`);
  doc.text(`Owner: ${asset.owner}`);
  return doc;
}
