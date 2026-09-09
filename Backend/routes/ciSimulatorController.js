// itsm-backend/controllers/ciSimulatorController.js
import CI from "../models/CI.js";

let simulatorInterval = null;

export const toggleSimulator = async (req, res) => {
  const { action } = req.body; // "start" or "stop"

  if (action === "stop") {
    if (simulatorInterval) {
      clearInterval(simulatorInterval);
      simulatorInterval = null;
      console.log("🛑 CMDB Metric Simulator has been stopped.");
      return res.status(200).json({ success: true, message: "Simulator stopped." });
    }
    return res.status(200).json({ success: true, message: "Simulator was not running." });
  }

  if (action === "start") {
    if (simulatorInterval) {
      return res.status(400).json({ success: false, message: "Simulator is already running." });
    }

    console.log("🚀 CMDB Metric Simulator has started!");

    // Run updates every 4 seconds
    simulatorInterval = setInterval(async () => {
      try {
        // 1. Fetch all CIs from the database
        const cis = await CI.find({});
        if (cis.length === 0) {
          console.log("⚠️ No CIs found in database to simulate metrics for.");
          return;
        }

        // 2. Pick one random CI to mutate during this cycle
        const randomCi = cis[Math.floor(Math.random() * cis.length)];

        // 3. Generate randomized load metrics
        const cpuUsage = Math.floor(Math.random() * 100); // 0 to 99%
        const memoryUsage = Math.floor(Math.random() * 40) + 40; // 40% to 80%

        // 4. Map the numeric value to your threshold enum properties
        let healthStatus = "Healthy";
        let metricStatus = "Operational";
        let lastErrorLog = null;

        if (cpuUsage >= 95) {
          healthStatus = "Critical";
          metricStatus = "Critical";
          lastErrorLog = "ERR_HIGH_COMPUTE: Core threshold safety exception triggered.";
        } else if (cpuUsage >= 85) {
          healthStatus = "Warning";
          metricStatus = "Warning";
          lastErrorLog = "WARN_DEGRADED: System executing high IO thread queues.";
        }

        // 5. Commit directly to MongoDB -> This fires the Change Stream!
        await CI.findByIdAndUpdate(randomCi._id, {
          $set: {
            "metrics.cpuUsage": cpuUsage,
            "metrics.memoryUsage": memoryUsage,
            "metrics.status": metricStatus,
            healthStatus: healthStatus,
            lastErrorLog: lastErrorLog
          }
        });

        console.log(`🎯 Simulated metrics push for [${randomCi.name}]: CPU ${cpuUsage}% | ${healthStatus}`);
      } catch (err) {
        console.error("Error executing simulation loop step:", err);
      }
    }, 4000);

    return res.status(200).json({ success: true, message: "Simulator loop initialized successfully." });
  }

  return res.status(400).json({ success: false, message: "Invalid action. Use 'start' or 'stop'." });
};
