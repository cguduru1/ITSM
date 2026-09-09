// backend/services/idHelpers.js
export function generateAssetId() {
  return `ASSET-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}
export function generateFinancialId() {
  return `FIN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}
export function generateAssetTag(assetId) {
  return `TAG-${assetId.split("-").slice(1).join("")}`;
}
