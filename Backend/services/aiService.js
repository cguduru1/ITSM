// backend/services/aiService.js
import AssetMaster from "../models/AssetMaster.js";
import FinancialLifecycle from "../models/FinancialLifecycle.js";
import SoftwareAllocation from "../models/SoftwareAllocation.js";

/**
 * Extract features for an asset used by rules and scoring.
 */
export async function extractFeatures(assetId) {
  const asset = await AssetMaster.findOne({ assetId }).lean();
  const financial = await FinancialLifecycle.findOne({ assetId }).lean();
  const allocations = await SoftwareAllocation.find({ assetId }).lean();

  if (!asset && !financial) return null;

  const now = new Date();
  const purchaseDate = financial?.purchaseDate ? new Date(financial.purchaseDate) : null;
  const ageMonths = purchaseDate ? Math.floor((now - purchaseDate) / (1000 * 60 * 60 * 24 * 30)) : null;
  const warrantyDaysLeft = financial?.warrantyExpiryDate ? Math.ceil((new Date(financial.warrantyExpiryDate) - now) / (1000 * 60 * 60 * 24)) : null;
  const residualRatio = financial && financial.purchaseCost ? (financial.residualValue || 0) / financial.purchaseCost : null;

  return {
    asset,
    financial,
    allocationsCount: allocations.length,
    ageMonths,
    warrantyDaysLeft,
    residualRatio
  };
}

/**
 * Rule-based recommendations.
 */
export async function getRecommendations(limit = 50) {
  const candidates = await FinancialLifecycle.find({}).lean().limit(2000);
  const recs = [];
  const now = new Date();

  for (const f of candidates) {
    const assetId = f.assetId;
    const purchaseDate = f.purchaseDate ? new Date(f.purchaseDate) : null;
    const ageMonths = purchaseDate ? Math.floor((now - purchaseDate) / (1000 * 60 * 60 * 24 * 30)) : 0;
    const residualRatio = f.purchaseCost ? (f.residualValue || 0) / f.purchaseCost : 0;
    const bookRatio = f.purchaseCost ? (f.currentBookValue || 0) / f.purchaseCost : 0;

    let score = 0;
    const reasons = [];

    if (ageMonths >= 48) { score += 30; reasons.push("Asset older than 48 months"); }
    if (bookRatio <= 0.25) { score += 30; reasons.push("Book value <= 25% of purchase cost"); }

    if (f.warrantyExpiryDate) {
      const daysLeft = Math.ceil((new Date(f.warrantyExpiryDate) - now) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 30) { score += 20; reasons.push(`Warranty expires in ${daysLeft} days`); }
      else if (daysLeft <= 90) { score += 8; reasons.push(`Warranty expires in ${daysLeft} days`); }
    }

    if (residualRatio >= 0.5) { score += 5; reasons.push("High residual ratio — consider redeploying"); }

    const allocCount = await SoftwareAllocation.countDocuments({ assetId });
    if (allocCount > 3) { score += 10; reasons.push(`${allocCount} software allocations — consider reclaim`); }

    if (f.currentBookValue < 0) { score += 50; reasons.push("Negative book value — data anomaly"); }

    if (score > 0) {
      recs.push({
        assetId,
        score,
        reasons,
        severity: score >= 60 ? "high" : score >= 30 ? "medium" : "low",
        snapshot: {
          purchaseCost: f.purchaseCost,
          currentBookValue: f.currentBookValue,
          purchaseDate: f.purchaseDate,
          poNumber: f.poNumber
        }
      });
    }
  }

  recs.sort((a, b) => b.score - a.score);
  return recs.slice(0, limit);
}

/**
 * Simple anomaly detection.
 */
export async function detectAnomalies(limit = 100) {
  const financials = await FinancialLifecycle.find({}).lean().limit(limit);
  const anomalies = [];
  for (const f of financials) {
    let score = 0;
    const reasons = [];
    if (f.currentBookValue < 0) { score += 80; reasons.push("Negative book value"); }
    if (f.purchaseCost && f.currentBookValue > f.purchaseCost * 1.2) { score += 60; reasons.push("Book value exceeds purchase cost by >20%"); }
    if (f.depreciationMethod === "Unknown") { score += 10; reasons.push("Unknown depreciation method"); }
    if (score > 0) anomalies.push({ assetId: f.assetId, anomalyScore: score, reasons });
  }
  anomalies.sort((a, b) => b.anomalyScore - a.anomalyScore);
  return anomalies;
}

/**
 * Template-based summary.
 */
export function summarizeFeatures(features) {
  if (!features || !features.asset) return "Asset not found.";

  const parts = [];
  const a = features.asset;
  const f = features.financial;

  parts.push(`${a.assetName || a.assetTag} (${a.assetId})`);
  if (features.ageMonths != null) parts.push(`Age: ${features.ageMonths} months`);
  if (f?.currentBookValue != null) parts.push(`Book value: ${f.currentBookValue}`);
  if (features.warrantyDaysLeft != null) {
    if (features.warrantyDaysLeft <= 0) parts.push("Warranty expired");
    else parts.push(`Warranty: ${features.warrantyDaysLeft} days left`);
  }
  if (features.allocationsCount > 0) parts.push(`${features.allocationsCount} software allocations`);

  const recs = [];
  if (features.ageMonths >= 60 && f && (f.currentBookValue / (f.purchaseCost || 1)) < 0.2) recs.push("Consider replacement");
  if (features.warrantyDaysLeft != null && features.warrantyDaysLeft <= 30) recs.push("Warranty expiring soon");
  if (features.allocationsCount > 3) recs.push("Review software allocations for reclaim");

  if (recs.length) parts.push(`Recommendations: ${recs.join("; ")}`);

  return parts.join(" • ");
}
