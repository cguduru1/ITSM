import cron from "node-cron";
import pLimit from "p-limit"; // Run: npm install p-limit
import CI from "../models/CI.js";
import { processAnomalyDetection } from "../routes/anomaly.routes.js";

// Set a safe maximum number of concurrent requests to the Python service
const CONCURRENCY_LIMIT = 5; 

cron.schedule("*/3 * * * *", async () => {
  try {
    console.log("[NODE-CRON] Starting scheduled anomaly check...");

    const cis = await CI.find({}, "_id").lean();
    if (!cis.length) {
      console.log("[NODE-CRON] No CIs found to evaluate.");
      return;
    }

    const limit = pLimit(CONCURRENCY_LIMIT);

    // Map tasks using the rate limiter
    const tasks = cis.map((ci) => {
      const cpu = Math.random() * 100;
      const memory = Math.random() * 100;
      const errors = Math.floor(Math.random() * 100);

      return limit(async () => {
        try {
          return await processAnomalyDetection({
            ciId: ci._id,
            cpu,
            memory,
            errors,
          });
        } catch (error) {
          // Catch individual errors so one bad request doesn't halt the pipeline
          console.error(`[NODE-CRON] Error on CI ${ci._id}:`, error.message);
          throw error; 
        }
      });
    });

    const results = await Promise.allSettled(tasks);

    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    console.log(`[NODE-CRON] Completed: ${succeeded} succeeded, ${failed} failed.`);
  } catch (err) {
    console.error("[NODE-CRON] Anomaly execution error:", err.message);
  }
});
