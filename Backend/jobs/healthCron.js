import cron from "node-cron";
import CI from "../models/CI.js";
import axios from "axios";

cron.schedule("*/5 * * * *", async () => {
  const cis = await CI.find();

  for (const ci of cis) {
    // Replace with real metrics later
    const cpu = Math.random() * 100;
    const memory = Math.random() * 100;
    const incidents = 0;

    await axios.post("http://localhost:4000/api/health/score", {
      ciId: ci._id,
      cpu,
      memory,
      incidents
    });
  }
});
