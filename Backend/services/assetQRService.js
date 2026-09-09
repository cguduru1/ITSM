import QRCode from "qrcode";

export async function generateQR(data) {
  try {
    return await QRCode.toDataURL(JSON.stringify(data));
  } catch (err) {
    console.error("QR GENERATION ERROR:", err);
  }
}
