// backend/jobs/recommendationsJob.js
import cron from "node-cron";
import * as aiService from "../services/aiService.js";
import RecommendationSnapshot from "../models/RecommendationSnapshot.js";

/**
 * Compute recommendations using aiService and return the array.
 */
export async function computeRecommendations(limit = 200) {
  const recs = await aiService.getRecommendations(limit);
  return recs;
}

/**
 * Start a daily cron job that snapshots recommendations.
 * Schedule: daily at 02:00 UTC (adjust as needed).
 */
export function startRecommendationsJob() {
  const schedule = "0 2 * * *"; // minute hour day-of-month month day-of-week

  cron.schedule(schedule, async () => {
    console.log("[jobs] recommendationsJob running");
    try {
      const recs = await computeRecommendations(200);
      await RecommendationSnapshot.create({
        createdAt: new Date(),
        count: recs.length,
        recommendations: recs
      });
      console.log("[jobs] recommendationsJob completed, saved", recs.length);
    } catch (err) {
      console.error("[jobs] recommendationsJob error", err);
    }
  }, { timezone: "UTC" });
}
