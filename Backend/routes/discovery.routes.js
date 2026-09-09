import express from "express";
import DiscoveryLog from "../models/DiscoveryLog.js";
import axios from "axios";
import CI from "../models/CI.js";
import { runDiscoveryScan } from "../utils/discovery/runDiscoveryScan.js";

const router = express.Router();

router.post("/run", async (req, res) => {
  try {
    // Step 1: Run discovery scan (mock for now)
    const rawDevices = await runDiscoveryScan();

    // Step 2: Send to AI classifier
    const aiRes = await axios.post("http://localhost:5001/classify", {
      devices: rawDevices
    });

    // Step 3: Save results
    const savedLogs = await DiscoveryLog.insertMany(aiRes.data);

    // Step 4: Create CMDB CI entries automatically
    for (const d of aiRes.data) {
    await CI.create({
    name: d.hostname || d.ip,
    ip: d.ip,
    os: d.os || "Unknown",
    type: d.classifiedType,
    services: d.services || [],
    anomaly: d.anomaly,
    source: "Auto-Discovery",
    createdAt: new Date()
  });
}
    res.json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Discovery failed" });
  }
});

export default router;
