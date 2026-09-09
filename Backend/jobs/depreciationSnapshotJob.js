// backend/jobs/depreciationSnapshotJob.js
import cron from "node-cron";
import FinancialLifecycle from "../models/FinancialLifecycle.js";
import DepreciationSnapshot from "../models/DepreciationSnapshot.js";

/**
 * Compute depreciation rows for all financial records.
 */
export async function computeDepreciationForAll() {
  const financials = await FinancialLifecycle.find({}).lean();
  const now = Date.now();

  return financials.map(f => {
    const purchaseCost = f.purchaseCost || 0;
    const residual = f.residualValue || 0;
    const lifeMonths = f.depreciableLifeMonths || 60;
    const monthlyDep = lifeMonths > 0 ? (purchaseCost - residual) / lifeMonths : 0;
    const monthsElapsed = f.purchaseDate ? Math.floor((now - new Date(f.purchaseDate)) / (1000 * 60 * 60 * 24 * 30)) : 0;
    const accumulated = Math.min(monthsElapsed * monthlyDep, Math.max(purchaseCost - residual, 0));
    const currentBookValue = Math.max(purchaseCost - accumulated, residual);

    return {
      assetId: f.assetId,
      purchaseCost,
      residual,
      monthlyDep,
      monthsElapsed,
      currentBookValue
    };
  });
}

/**
 * Start a monthly cron job that snapshots depreciation for all assets.
 */
export function startDepreciationSnapshotJob() {
  const schedule = "0 3 1 * *"; // 1st of month at 03:00 UTC

  cron.schedule(schedule, async () => {
    console.log("[jobs] depreciationSnapshotJob running");
    try {
      const rows = await computeDepreciationForAll();
      await DepreciationSnapshot.create({ createdAt: new Date(), rows });
      console.log("[jobs] depreciationSnapshotJob completed, rows:", rows.length);
    } catch (err) {
      console.error("[jobs] depreciationSnapshotJob error", err);
    }
  }, { timezone: "UTC" });
}
