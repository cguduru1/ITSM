//routes/cmdb.routes.js
import express, { Router } from "express";
import multer from "multer";
import mongoose from "mongoose";
import {
  getCMDB,
  getCIById,
  createCMDB,
  updateCMDB,
  deleteCMDB,
  getGraph,
  getRelationships,
  getAuditTimeline,
  calculateImpact
} from "../controllers/cmdb.controller.js";
import { streamCiHealth } from "../controllers/ciStreamController.js";
import { toggleSimulator } from "../routes/ciSimulatorController.js";

import CMDB from "../models/CMDB.js";
import Asset from "../models/Asset.js";
import CMDBAudit from "../models/CMDBAudit.js";
import requirePermission from "../middleware/requirePermission.js";
import { pingHost } from "../utils/discovery/ping.js";
import { scanPorts } from "../utils/discovery/ports.js";
import { getMac } from "../utils/discovery/arp.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// ------------------------------------------------------------
// 1. STATIC & SPECIFIC UTILITY ROUTES (MUST come before /:id)
// ------------------------------------------------------------

// Analytics & Stats
router.get("/stats", async (req, res) => {
  try {
    const totalCis = await CMDB.countDocuments();
    const activeCis = await CMDB.countDocuments({ operational_status: "Operational" });
    const inMaintenance = await CMDB.countDocuments({ operational_status: "Maintenance" });
    const cis = await CMDB.find().limit(10).lean();
    
    res.json({ total: totalCis, active: activeCis, inMaintenance, cis });
  } catch (err) {
    res.status(500).json({ message: "Error fetching stats", error: err.message });
  }
});

/* CMDB Dashboard analytics */
router.get("/analytics", requirePermission("cmdb", "admin"), async (req, res) => {
  try {
  const byType = await CMDB.aggregate([{ $group: { _id: "$type", count: { $sum: 1 } } }]);
  const byEnv = await CMDB.aggregate([{ $group: { _id: "$environment", count: { $sum: 1 } } }]);
  const stale = await CMDB.countDocuments({ updatedAt: { $lt: new Date(Date.now() - 180 * 86400000) } });
  const byDept = await CMDB.aggregate([{ $group: { _id: "$department", count: { $sum: 1 } } }]);
  
  res.json({ byType, byEnv, stale, byDept});
  } catch (err) {
    res.status(500).json({ message: "Failed to load analytics", error: err.message });
  }
});

router.get("/graph", getGraph);
router.get("/stream", streamCiHealth);
router.post("/simulate", toggleSimulator);
router.post("/impact", calculateImpact);

/* Service Maps & Assets */
router.get("/service-map", requirePermission("cmdb", "read"), async (req, res) => {
  try {
    const services = await CMDB.find({ type: "Service" }).lean();
    const all = await CMDB.find().lean();
    res.json({ services: services || [], all: all || [] });
  } catch (err) {
    res.status(500).json({ message: "Error fetching service map", error: err.message });
  }
});

// GET /api/cmdb/services
router.get("/services", async (req, res) => {
  try {
    const services = await CMDB .find({ type: "Service" }).lean();
    res.json(services || []);
  } catch (err) {
    res.status(500).json({ message: "Error fetching services", error: err.message });
  }
});

router.get("/data-quality", requirePermission("cmdb", "analytics"), async (req, res) => {
  try {
    const cis = await CMDB.find().lean();

    const scored = cis.map(ci => {

      const missingOwner = !ci.managed_by;
      const missingDept = !ci.department;
      const missingRelationships = !ci.dependencies?.length && !ci.dependents?.length;
      const stale = ci.updatedAt < new Date(Date.now() - 180 * 86400000);

      const issues = [
        missingOwner && "Missing owner",
        missingDept && "Missing department",
        missingRelationships && "No relationships",
        stale && "Stale (>180 days)"
      ].filter(Boolean);

      const score = Math.max(0, 100 - issues.length * 20);

      return {
        _id: ci._id,
        name: ci.name,
        type: ci.type,
        score,
        issues
      };
    });

    res.json(scored);
  } catch (err) {
    res.status(500).json({ message: "Error fetching data quality metrics", error: err.message });
  }
});

// Assets Integration Route
router.get("/assets", requirePermission("asset", "read"), async (req, res) => {
  try {
    const assets = await Asset.find({}, "name type tags dependsOn").lean();
    return res.json(assets);
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to fetch assets" });
  }
});

// GET /api/cmdb/permissions
router.get("/permissions", requirePermission("cmdb", "admin"), async (req, res) => {
    // Return custom permission mappings or system role rules
    res.json([
    { role: "admin", permissions: ["read", "create", "update", "delete", "admin"] },
    { role: "cmdb_manager", permissions: ["read", "create", "update"] },
    { role: "cmdb_viewer", permissions: ["read"] }
  ]);
});

router.get("/discovery/status", async (req, res) => {
  res.json({status: "Idle", lastRun: null, newItems: []});
});

// POST run discovery
router.post("/discovery/run", async (req, res) => {
try {

  // setResults(res.data.results || []);

  const targets = ["192.168.1.10", "192.168.1.20"];
  const discovered = [];

  for (const ip of targets) {
    const pingResult = await pingHost(ip);
    if (!pingResult.alive) continue;

    const ports = await scanPorts(ip);
    const mac = await getMac(ip);

    const ci = new CMDB({
        name: `Device-${ip}`,
        environment: "Production",
        operational_status: "Operational",
        discovered_at: new Date(),
        ports
      });

        await ci.save();
        discovered.push(ci);
}

    res.json({ status: "Completed", lastRun: new Date(), results: discovered });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/discovery/history", async (req, res) => {
  try {
    const history = await CMDB.find({ discovered_at: { $exists: true } })
      .sort({ discovered_at: -1 })
      .limit(50);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/lifecycle", async (req, res) => {
  try {
    const lifecycleData = [
      { _id: "Procurement", count: 12 },
      { _id: "Deployment", count: 28 },
      { _id: "In Use", count: 45 },
      { _id: "Maintenance", count: 8 },
      { _id: "Retired", count: 5 }
    ];
    
    res.json(lifecycleData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch asset lifecycle data" });
  }
});

router.post("/chatbot/query", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== "string") {
      return res.status(400).json({ reply: "Please provide a valid search query." });
    }

    const cleanQuery = query.toLowerCase().trim();
    let reply = "";
    let data = null;

    // 1. Query: Count total Configuration Items
    if (cleanQuery.includes("how many") || cleanQuery.includes("total ci")) {
      const totalCIs = await CMDB.countDocuments();
      reply = `There are currently **${totalCIs}** Configuration Items registered in the CMDB.`;
    } 
    
    // 2. Query: Search by Environment (e.g., "prod", "production", "staging", "dev")
    else if (cleanQuery.includes("environment") || cleanQuery.includes("prod") || cleanQuery.includes("staging") || cleanQuery.includes("dev")) {
      let env = "Production";
      if (cleanQuery.includes("staging")) env = "Staging";
      if (cleanQuery.includes("dev") || cleanQuery.includes("development")) env = "Development";
      if (cleanQuery.includes("test")) env = "Test";

      const items = await CMDB.find({ environment: new RegExp(env, "i") }).limit(5);
      const count = await CMDB.countDocuments({ environment: new RegExp(env, "i") });

      reply = `Found **${count}** item(s) in the **${env}** environment.`;
      data = items;
    }

    // 3. Query: Search by Risk level (e.g., "high risk", "medium risk")
    else if (cleanQuery.includes("risk")) {
      let riskLevel = "High";
      if (cleanQuery.includes("low")) riskLevel = "Low";
      if (cleanQuery.includes("medium")) riskLevel = "Medium";

      const items = await CMDB.find({ risk: new RegExp(riskLevel, "i") }).limit(5);
      reply = `Found items matching **${riskLevel}** risk level. Showing top results.`;
      data = items;
    }

    // 4. Fallback: Generic keyword search across CI name, type, or serial number
    else {
      const items = await CMDB.find({
        $or: [
          { name: { $regex: cleanQuery, $options: "i" } },
          { type: { $regex: cleanQuery, $options: "i" } },
          { serialNumber: { $regex: cleanQuery, $options: "i" } }
        ]
      }).limit(5);

      if (items.length > 0) {
        reply = `Found **${items.length}** matching item(s) in the CMDB:`;
        data = items;
      } else {
        reply = `I couldn't find any CMDB items matching "${query}". Try asking about environments (e.g., "production CIs"), total counts, or specific CI names.`;
      }
    }

    // Return structured response to frontend chatbot UI
    return res.json({
      reply,
      data
    });

  } catch (error) {
    console.error("CMDB Chatbot Error:", error);
    return res.status(500).json({ 
      error: "Internal Server Error", 
      reply: "Sorry, I encountered an issue fetching data from the CMDB." 
    });
  }
});

// ============================================================
// 2. ROOT CMDB CRUD ROUTES
// ============================================================

router.get("/", getCMDB);

/* CREATE */
router.post("/", requirePermission("cmdb", "create"), upload.single("justification_doc"), async (req, res) => {
    try {
      const ciData = {
        ...req.body,
        type: req.body.type || req.body.ci_class || "Custom CI",
        justification_doc: req.file ? req.file.path : req.body.justification_doc || null,
      };

      const newCi = await CMDB.create(ciData);
      return res.status(201).json(newCi);
    } catch (err) {
      console.error("Save error:", err);
      return res.status(500).json({ message: "Failed to create CI", error: err.message });
    }
  }
);

router.get("/:id", getCIById);
router.put("/:id", requirePermission("cmdb", "update"), updateCMDB);
router.delete("/:id", requirePermission("cmdb", "delete"), deleteCMDB);

// ------------------------------------------------------------
// 3. RELATIONSHIPS & CHANGE MGMT
// ------------------------------------------------------------

router.get("/:id/relationships", getRelationships);

/* RELATIONSHIP UPDATE */
router.put("/:id/relationships", requirePermission("cmdb", "relationships"), async (req, res) => {
    try {
    const ci = await CMDB.findById(req.params.id);
    if (!ci) return res.status(404).json({ error: "CI not found" });

    ci.relationships = req.body.relationships || [];
    await ci.save();

    res.json(ci);
  } catch (err) {
    res.status(500).json({ message: "Failed to update relationships", error: err.message });
  }
});

router.get("/:id/audit", getAuditTimeline);

// /*  simple rule‑based AI. */
router.get("/ai/:id", requirePermission("cmdb", "read"), async (req, res) => {
  try {
  const ci = await CMDB.findById(req.params.id).lean();
  if (!ci) return res.status(404).json({ error: "CI not found" });

  const impact = await CMDB.find({ "relationships.targetCi": ci._id }).lean();

  const connectivityScore = impact.length;
  const criticalityScore = ci.criticality === "High" ? 3 : ci.criticality === "Medium" ? 2 : 1;
  const envScore = ci.environment === "Prod" ? 3 : 1;

  const riskScore = connectivityScore + criticalityScore + envScore;

  const explanation = `
CI "${ci.name}" is a ${ci.type} in ${ci.environment} used by ${impact.length} downstream items.
Criticality: ${ci.criticality}. Overall risk score: ${riskScore}.
If this CI fails, impacted items include: ${impact.map(i => i.name).join(", ")}.
`;

  res.json({ riskScore, explanation });
} catch (err) {
    res.status(500).json({ message: "Failed AI evaluation", error: err.message });
  }
});

// submit change
router.put("/:id/submit", requirePermission("cmdb", "update"), async (req, res) => {
  try {
  const ci = await CMDB.findByIdAndUpdate(
    req.params.id,
    { operational_status: "InReview", pendingChange: req.body },
    { new: true }
  );
  res.json(ci);
} catch (err) {
    res.status(500).json({ message: "Failed to submit change", error: err.message });
  }
});

export default router;
