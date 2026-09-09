// jobs/changeRiskCron.js
// import cron from "node-cron";
// import axios from "axios";
// import Change from "../models/Change.js";

// cron.schedule("*/5 * * * *", async () => {
//   const changes = await Change.find({ status: { $ne: "Closed" } });

//   for (const change of changes) {
//     await axios.post("http://localhost:4000/api/change-risk/predict", {
//       changeId: change._id
//     });
//   }
// });



import cron from "node-cron";
import Change from "../models/Change.js";
import CI from "../models/CI.js";
import { processAnomalyDetection } from "../routes/anomaly.routes.js";

// Internal helper to calculate/predict change risk directly
const predictChangeRisk = async (changeId) => {
  try {
    const change = await Change.findById(changeId);
    if (!change) return;

    // Simple risk calculation logic (or call your Python AI model port here if applicable)
    let riskLevel = "Low";
    if (change.impact === "High" || change.urgency === "High") {
      riskLevel = "High";
    } else if (change.impact === "Medium" || change.urgency === "Medium") {
      riskLevel = "Medium";
    }

    // Update Change record in DB
    await Change.findByIdAndUpdate(changeId, { riskLevel });
    return { changeId, riskLevel };
  } catch (err) {
    console.error(`[RISK ERROR] Failed to evaluate Change ID ${changeId}:`, err.message);
  }
};

cron.schedule("*/5 * * * *", async () => {
  try {
    console.log("[NODE-CRON] Starting scheduled tasks...");

    // 1. Process Open Changes (Risk Prediction)
    const openChanges = await Change.find({ status: { $ne: "Closed" } }, "_id").lean();
    
    if (openChanges.length > 0) {
      const riskTasks = openChanges.map((change) => predictChangeRisk(change._id));
      await Promise.allSettled(riskTasks);
      console.log(`[NODE-CRON] Processed risk analysis for ${openChanges.length} changes.`);
    }

    // 2. Process CIs for Anomaly Detection (Dynamically fetched, no hardcoded IDs)
    const targetCIs = await CI.find({}, "_id").lean();

    if (targetCIs.length > 0) {
      const anomalyTasks = targetCIs.map((ci) =>
        processAnomalyDetection({
          ciId: ci._id,
          cpu: Math.random() * 100,
          memory: Math.random() * 100,
          errors: Math.floor(Math.random() * 20),
        })
      );
      await Promise.allSettled(anomalyTasks);
      console.log(`[NODE-CRON] Processed anomaly checks for ${targetCIs.length} CIs.`);
    }

    console.log("[NODE-CRON] All scheduled tasks completed successfully.");
  } catch (err) {
    console.error("[NODE-CRON ERROR] Scheduled job failed:", err.message);
  }
});