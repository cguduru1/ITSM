import express from "express";
import CI from "../models/CI.js";
import axios from "axios";

const router = express.Router();

// Shared core function for anomaly detection
export const processAnomalyDetection = async ({ ciId, cpu, memory, errors }, token = null) => {
  try {
    // FIX 1: Use 127.0.0.1 instead of localhost to prevent IPv6 ::1 lookup failures
    const headers = {};
    if (token) {
      headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }

  const aiRes = await axios.post("http://localhost:5005/anomaly", {
    cpu,
    memory,
    errors,
  },
  { headers, timeout: 5000 }
);

  const { isAnomaly } = aiRes.data;// Update CI document in Mongo
    if (ciId) {
      await CI.findByIdAndUpdate(ciId, { isAnomaly });
    }

  return { ciId, isAnomaly };
} catch (err) {
    if (err.code === "ECONNREFUSED") {
      console.error("[ANOMALY ERROR] Python AI service on port 5005 is offline/unreachable.");
    } else if (err.response?.status === 401 || err.response?.status === 403) {
      console.error("[ANOMALY ERROR] Authentication failed with AI Microservice/Backend.");
    }
    throw err;
  }
};

// Route definition
router.post("/detect", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const result = await processAnomalyDetection(req.body, authHeader);
    res.json(result);
 } catch (err) {
    console.error("Anomaly Detection Route Error:", err.message);
    res.status(500).json({ 
      error: "Anomaly detection failed", 
      details: err.response?.data || err.message 
    });
  }
});

export default router;