// itsm-backend/routes/cmdb.js
import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import CI from "../models/CI.js";
import requirePermission from "../middleware/requirePermission.js";
import { sanitizeCiForUser } from "../utils/cmdbSanitize.js";
import CMDBModel from "../models/CMDB.js";

const router = express.Router();

// Configure file storage
const upload = multer({ dest: "uploads/" });

// ==========================================
// STATIC OPERATIONAL ROUTES (MUST BE FIRST)
// ==========================================

// GET /api/cmdb/stats
router.get("/stats", async (req, res) => {
  try {
    const totalCis = await CI.countDocuments();
    const activeCis = await CI.countDocuments({ status: "Active" });
    const inMaintenance = await CI.countDocuments({ status: "Maintenance" });
    const cis = await CI.find().limit(10); // Safeguard array response
    
    res.json({
      total: totalCis,
      active: activeCis,
      maintenance: inMaintenance,
      cis
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching stats", error: err.message });
  }
});

/* CMDB Dashboard analytics */
router.get("/analytics", requirePermission("cmdb", "admin"), async (req, res) => {
  try {
  const byType = await CI.aggregate([{ $group: { _id: "$type", count: { $sum: 1 } } }]);
  const byEnv = await CI.aggregate([{ $group: { _id: "$environment", count: { $sum: 1 } } }]);
  const byDept = await CI.aggregate([{ $group: { _id: "$department", count: { $sum: 1 } } }]);
  const distribution = await CI.aggregate([{ $group: { _id: "$type", count: { $sum: 1 } } }]);
  const stale = await CI.countDocuments({updatedAt: { $lt: new Date(Date.now() - 180 * 86400000) }});
  
  res.json({ byType, byEnv, byDept, distribution, stale });
  } catch (err) {
    res.status(500).json({ message: "Failed to load analytics", error: err.message });
  }
});

/*  CIs and relationships */
router.get("/service-map", requirePermission("cmdb", "read"), async (req, res) => {
  try {
  const services = await CI.find({ type: "Service" }).lean();
  const all = await CI.find().lean();
  res.json({ services: services || [], all: all || [] });
} catch (err) {
    res.status(500).json({ message: "Error fetching service map", error: err.message });
  }
});

// GET /api/cmdb/services
router.get("/services", async (req, res) => {
  try {
    const services = await CI.find({ type: "Service" }).lean();
    res.json(services || []);
  } catch (err) {
    res.status(500).json({ message: "Error fetching services", error: err.message });
  }
});

// routes/cmdb.js
router.get("/data-quality", requirePermission("cmdb", "analytics"), async (req, res) => {
  try {
    const cis = await CI.find().lean();

    const scored = cis.map(ci => {
      const missingOwner = !ci.owner;
      const missingDept = !ci.department;
      const missingRelationships = !ci.relationships || ci.relationships.length === 0;
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

// GET /api/cmdb/assets
router.get("/assets", requirePermission("cmdb", "read"), async (req, res) => {
  try {
    const assets = await CI.find({ type: { $ne: "Service" } }).lean();
    res.json(assets || []);
  } catch (err) {
    res.status(500).json({ message: "Failed to load assets", error: err.message });
  }
});

// GET /api/cmdb/permissions
router.get("/permissions", requirePermission("cmdb", "admin"), async (req, res) => {
  try {
    // Return custom permission mappings or system role rules
    const permissions = [
      { role: "admin", permissions: ["read", "create", "update", "delete", "admin"] },
      { role: "cmdb_manager", permissions: ["read", "create", "update"] },
      { role: "cmdb_viewer", permissions: ["read"] }
    ];
    res.json(permissions);
  } catch (err) {
    res.status(500).json({ message: "Failed to load CMDB permissions", error: err.message });
  }
});

// Add upload.single("justification_doc") middleware to parse incoming FormData
router.post("/", upload.single("justification_doc"), async (req, res) => {
  try {
    // req.body will now contain fields like 'name' and 'type'
    const newCi = new CMDBModel({
      ...req.body,
      // Map 'ci_class' to 'type' if your schema requires a type field
      type: req.body.type || req.body.ci_class || "Custom CI", // Ensures 'type' field is populated
      justification_doc: req.file ? req.file.path : null
    });

    await newCi.save();
    return res.status(201).json({ message: "CI created successfully", data: newCi });
  } catch (err) {
    console.error("Save error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. ROOT LIST & CREATE ROUTES
// ==========================================

/* CI list (Explorer) */
router.get("/", requirePermission("cmdb", "read"), async (req, res) => {
  try {
    const { search, type, env } = req.query;

    const query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (type) {
      query.type = type;
    }

    if (env) {
      query.environment = env;
    }

    const cis = await CI.find(query).lean();

    res.status(200).json(cis);
  } catch (error) {
    console.error("GET /api/cmdb failed:", error);
    res.status(500).json({
      error: "Failed to fetch configuration items",
      message: error.message
    });
  }
});

/* CREATE */
router.post("/", requirePermission("cmdb", "create"), upload.single("justification_doc"), async (req, res) => {
    try {
      const ciData = {
        ...req.body,
        type: req.body.type || req.body.ci_class || "Custom CI",
        justification_doc: req.file ? req.file.path : req.body.justification_doc || null,
      };

      const newCi = await CI.create(ciData);
      return res.status(201).json(newCi);
    } catch (err) {
      console.error("Save error:", err);
      return res.status(500).json({ message: "Failed to create CI", error: err.message });
    }
  }
);

/*  RBAC permissions */
/* LIST */
router.get("/", requirePermission("cmdb", "view"), async (req, res) => {
    const cis = await CI.find().lean();
    res.json(cis);
  }
);

/* ANALYTICS */
router.get("/analytics", requirePermission("cmdb", "analytics"), async (req, res) => {
    const byType = await CI.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } }
    ]);

    const byEnv = await CI.aggregate([
      { $group: { _id: "$environment", count: { $sum: 1 } } }
    ]);

    const byDept = await CI.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } }
    ]);

    const stale = await CI.countDocuments({
      updatedAt: { $lt: new Date(Date.now() - 180 * 86400000) }
    });

    res.json({ byType, byEnv, byDept, stale });
  }
);

// ==========================================
// 3. DYNAMIC PARAMETER ROUTES
// ==========================================

/* Impact traversal */
router.get("/impact/:id", requirePermission("cmdb", "read"), async (req, res) => {
  try {
  const root = await CI.findById(req.params.id).lean();
  if (!root) return res.status(404).json({ error: "CI not found" });

  const visited = new Set();
  const queue = [root._id];
  const downstream = [];

  while (queue.length) {
    const id = queue.shift();
    if (visited.has(String(id))) continue;
    visited.add(String(id));

    const dependents = await CI.find({ "relationships.targetCi": id }).lean();
    dependents.forEach(d => {
      downstream.push(d);
      queue.push(d._id);
    });
  }

  res.json({ root, downstream });
  } catch (err) {
    res.status(500).json({ message: "Failed impact analysis", error: err.message });
  }
});

/*  simple rule‑based AI. */
router.get("/ai/:id", requirePermission("cmdb", "read"), async (req, res) => {
  try {
  const ci = await CI.findById(req.params.id).lean();
  if (!ci) return res.status(404).json({ error: "CI not found" });

  const impact = await CI.find({ "relationships.targetCi": ci._id }).lean();

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
  const ci = await CI.findByIdAndUpdate(
    req.params.id,
    { status: "InReview", pendingChange: req.body },
    { new: true }
  );
  res.json(ci);
} catch (err) {
    res.status(500).json({ message: "Failed to submit change", error: err.message });
  }
});

// approve change
router.post("/:id/approve", requirePermission("cmdb", "approve"), async (req, res) => {
  try {
  const ci = await CI.findById(req.params.id);
  if (!ci) return res.status(404).json({ error: "CI not found" });

  // await logCmdbAudit(req, "UPDATE", ci, { fields: Object.keys(req.body) });
  Object.assign(ci, ci.pendingChange || {});
  ci.status = "Approved";
  ci.pendingChange = null;
  await ci.save();
  res.json(ci);
} catch (err) {
    res.status(500).json({ message: "Failed to approve change", error: err.message });
  }
});

// reject change
router.post("/:id/reject", requirePermission("cmdb", "approve"), async (req, res) => {
  try {
  const ci = await CI.findByIdAndUpdate(
    req.params.id,
    { status: "Rejected", pendingChange: null },
    { new: true }
  );
  // await logCmdbAudit(req, "UPDATE", ci, { fields: Object.keys(req.body) });
  res.json(ci);
} catch (err) {
    res.status(500).json({ message: "Failed to reject change", error: err.message });
  }
});

/* RELATIONSHIP UPDATE */
router.put("/:id/relationships", requirePermission("cmdb", "relationships"), async (req, res) => {
    try {
    const ci = await CI.findById(req.params.id);
    if (!ci) return res.status(404).json({ error: "CI not found" });

    ci.relationships = req.body.relationships || [];
    await ci.save();

    res.json(ci);
  } catch (err) {
    res.status(500).json({ message: "Failed to update relationships", error: err.message });
  }
});

/* CI detail Read */
router.get("/:id", requirePermission("cmdb", "read"), async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: `Invalid CI ID format: '${id}'` });
    }

    const ci = await CI.findById(id).populate("relationships.targetCi").lean();
    if (!ci) return res.status(404).json({ error: "CI not found" });

    res.json(sanitizeCiForUser(ci, req.user));
  } catch (err) {
    res.status(500).json({ message: "Failed to load CI", error: err.message });
  }
});

/* UPDATE */
router.put("/:id", requirePermission("cmdb", "update"), async (req, res) => {
  try {
    const updated = await CI.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "CI not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update CI", error: err.message });
  }
});


/* View */
router.get("/:id", requirePermission("cmdb", "view"), async (req, res) => {
  try {
  const ci = await CI.findById(req.params.id).populate("relationships.targetCi").lean();
  if (!ci) return res.status(404).json({ error: "CI not found" });
  res.json(sanitizeCiForUser(ci, req.user));
  } catch (err) {
    res.status(500).json({ message: "Failed to delete CI", error: err.message });
  }
});

/* DELETE */
router.delete("/:id", requirePermission("cmdb", "delete"), async (req, res) => {
  try {
    const deleted = await CI.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "CI not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete CI", error: err.message });
  }
});

// GET /api/cmdb/:id
router.get("/:id", requirePermission("cmdb", "read"), async (req, res) => {
  try {
    const { id } = req.params;

    // Guard: Return 400 if the requested param isn't a valid 24-character ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: `Invalid CI ID format: '${id}'` });
    }

    const ci = await CI.findById(id).populate("relationships.targetCi").lean();
    if (!ci) return res.status(404).json({ error: "CI not found" });

    res.json(ci);
  } catch (err) {
    res.status(500).json({ message: "Failed to load CI", error: err.message });
  }
});

router.get("/:id/audit", requirePermission("cmdb", "view"), async (req, res) => {
  try {
  const logs = await CMDBAudit.find({ ciId: req.params.id })
    .sort({ timestamp: -1 })
    .lean();
  res.json(logs);
} catch (err) {
    res.status(500).json({ message: "Failed to fetch audit logs", error: err.message });
  }
});

export default router;
