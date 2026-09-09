import cron from "node-cron";
import mongoose from "mongoose";
import AssetMaster from "../models/AssetMaster.js";
import FinancialLifecycle from "../models/FinancialLifecycle.js";
import DepreciationSnapshot from "../models/DepreciationSnapshot.js";

const schedule = "0 3 1 * *"; // monthly on 1st at 03:00 UTC

export async function computeDepreciationForAll() {
  const financials = await FinancialLifecycle.find({}).lean();
  return financials.map(f => {
    const purchaseCost = f.purchaseCost || 0;
    const residual = f.residualValue || 0;
    const lifeMonths = f.depreciableLifeMonths || 60;
    const monthlyDep = lifeMonths > 0 ? (purchaseCost - residual) / lifeMonths : 0;
    const monthsElapsed = f.purchaseDate ? Math.floor((Date.now() - new Date(f.purchaseDate)) / (1000*60*60*24*30)) : 0;
    const accumulated = Math.min(monthsElapsed * monthlyDep, purchaseCost - residual);
    const currentBookValue = Math.max(purchaseCost - accumulated, residual);
    return { assetId: f.assetId, purchaseCost, residual, monthlyDep, monthsElapsed, currentBookValue };
  });
}

export function startDepreciationSnapshotJob() {
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

export default async function runDepreciationJob() {
  // Recalculate currentBookValue for all financial records using straight-line 36 months
  const cursor = FinancialLifecycle.find({}).cursor();
  for await (const fl of cursor) {
    const months = 36;
    const purchase = fl.purchaseDate;
    const ageMonths = Math.max(0, Math.floor((Date.now() - purchase.getTime()) / (1000 * 60 * 60 * 24 * 30)));
    let newValue;
    if (ageMonths >= months) newValue = fl.residualValue;
    else {
      const monthly = (fl.purchaseCost - (fl.residualValue || 0)) / months;
      newValue = Math.round((fl.purchaseCost - monthly * ageMonths) * 100) / 100;
    }
    fl.currentBookValue = newValue;
    await fl.save();
  }
}
