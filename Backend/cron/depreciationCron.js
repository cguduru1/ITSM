import cron from "node-cron";
import { runDepreciation } from "../controllers/depreciationController.js";

cron.schedule("0 2 * * *", () => {  // Daily at 2 AM
  runDepreciation();
});
