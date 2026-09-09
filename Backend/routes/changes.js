// routes/changes.js
import express from "express";
import mongoose from "mongoose";
import requirePermission from "../middleware/requirePermission.js";
import { verifyToken as authenticateUser } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/authorizeRole.js";

import CABMeeting from "../models/CABMeeting.js";
import ChangeRequest from "../models/ChangeRequest.js";
import ChangeApproval from "../models/ChangeApproval.js";
import Change from "../models/Change.js";
import EmergencyChange from "../models/EmergencyChange.js";

import {
  createChange,
  transitionChange,
  updateChange
} from "../services/changeService.js";

const router = express.Router();

/* ==========================================
   1. EMERGENCY CHANGE ENDPOINTS
   ========================================== */

// GET: Fetch emergency changes with Linked Incident & Approver details
router.get("/emergency", authenticateUser, async (req, res) => {
  console.log("--> HIT /api/changes/emergency ENDPOINT");
  try {
    const changes = await EmergencyChange.find()
      .populate("linkedIncident", "ticketNumber title severity status")
      .populate("approver", "name email role")
      .sort({ createdAt: -1 });

    res.json(changes);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch emergency changes" });
  }
});

// POST: Create Emergency Change linked to a P1 Incident
router.post("/emergency", authenticateUser, async (req, res) => {
  try {
    const { title, description, linkedIncidentId, rollbackPlan } = req.body;

    const newChange = new EmergencyChange({
      title,
      description,
      linkedIncident: linkedIncidentId,
      approver: req.user._id, // Assign logged-in user or manager ID
      rollbackPlan
    });

    await newChange.save();
    res.status(201).json(newChange);
  } catch (err) {
    res.status(400).json({ error: "Failed to create emergency change record" });
  }
});

// PUT: Approve or Reject (Restricted strictly to Managers / Admin)
router.put(
  "/emergency/:id/approval",
  authenticateUser,
  authorizeRoles("Manager", "Director", "SecOps_Lead", "Admin"),
  async (req, res) => {
    try {
      const { status } = req.body; // "Approved" or "Rejected"
      
      if (!["Approved", "Rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
      }

      const updatedChange = await EmergencyChange.findByIdAndUpdate(
        req.params.id,
        { 
          status,
          approver: req.user._id // Stamp the exact authorizing authority
        },
        { new: true }
      ).populate("linkedIncident", "ticketNumber title");

      res.json(updatedChange);
    } catch (err) {
      res.status(500).json({ error: "Failed to process emergency approval" });
    }
  }
);

// PUT: Update emergency change details
router.put("/emergency/:id", authenticateUser, async (req, res) => {
  try {
    const updated = await EmergencyChange.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Emergency change not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Failed to update emergency change" });
  }
});

// DELETE: Remove emergency change
router.delete("/emergency/:id", authenticateUser, async (req, res) => {
  try {
    const deleted = await EmergencyChange.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Emergency change not found" });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: "Failed to delete emergency change" });
  }
});

/* -----------------------------
   SERVICE OPS ENDPOINTS
------------------------------ */

// Task Board → all changes (basic fields)
router.get("/serviceops/tasks", async (req, res) => {
  try {
    const tasks = await ChangeRequest.find({}, "title status priority").lean();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// Incident Queue → changes with status Open/In Progress
router.get("/serviceops/incidents", async (req, res) => {
  try {
    const incidents = await ChangeRequest.find(
      { status: { $in: ["Open", "In Progress"] } },
      "title description priority status"
    ).lean();
    res.json(incidents);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch incidents" });
  }
});

// Automation Rules → changes with model=standard/emergency/devops
router.get("/serviceops/automation", async (req, res) => {
  try {
    const automation = await ChangeRequest.find(
      { model: { $in: ["standard", "emergency", "devops"] } },
      "title model assignedTo"
    ).lean();
    res.json(automation);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch automation rules" });
  }
});

// Analytics → aggregate SLA compliance, breaches, incident trend
router.get("/serviceops/analytics", async (req, res) => {
  try {
    const total = await ChangeRequest.countDocuments();
    const breaches = await ChangeRequest.countDocuments({ status: "Cancelled" });
    const compliance = total > 0 ? Math.round(((total - breaches) / total) * 100) : 0;

    // Incident trend: group by day
    const trend = await Change.aggregate([
  { $match: { status: { $in: ["Open", "In Progress"] }, createdAt: { $exists: true, $ne: null } } }, // 👈 Add this safety filter
  {
    $group: {
      _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
      count: { $sum: 1 }
    }
  },
  { $sort: { _id: 1 } }
]);

    res.json({
      slaCompliance: compliance,
      slaBreaches: breaches,
      incidentTrend: {
        dates: trend.map(t => t._id),
        counts: trend.map(t => t.count)
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

/**
 * GET /api/change/standard/templates
 * Fetches pre-approved standard change templates
 */
router.get("/standard/templates", async (req, res) => {
  // If querying MongoDB:
    try {
    // const templates = await ChangeTemplate.find({ isStandard: true });

    // Mock data response:
    const templates = [
      {
        _id: "tpl_101",
        name: "OS Security Patch Deployment",
        category: "Infrastructure",
        description: "Routine monthly operating system patch rollout across non-critical servers.",
        riskLevel: "Low"
      },
      {
        _id: "tpl_102",
        name: "SSL/TLS Certificate Renewal",
        category: "Security",
        description: "Replacement and deployment of expiring SSL certificates for domain endpoints.",
        riskLevel: "Low"
      },
      {
        _id: "tpl_103",
        name: "Database Index Rebuild",
        category: "Database",
        description: "Scheduled off-hours rebuild of database indexes to improve query optimization.",
        riskLevel: "Low"
      },
      {
        _id: "tpl_104",
        name: "Standard Firewall Port Opening",
        category: "Network",
        description: "Pre-approved standard rule addition for internal application communication.",
        riskLevel: "Low"
      }
    ];

    res.json(templates);
  } catch (error) {
    console.error("Error fetching standard templates:", error);
    res.status(500).json({ error: "Failed to load standard change templates" });
  }
});

// GET /api/change/standard/approvals
router.get("/standard/approvals", async (req, res) => {
  try {
    const approvals = [
      {
        _id: "app_201",
        title: "Global Infrastructure Patch Policy",
        category: "Infrastructure",
        risk: "Low",
        status: "Approved",
        maxDuration: "2 Hours",
        approvedBy: "CAB Governance Board"
      },
      {
        _id: "app_202",
        title: "Automated Certificate Management",
        category: "Security",
        risk: "Low",
        status: "Approved",
        maxDuration: "1 Hour",
        approvedBy: "SecOps Lead"
      },
      {
        _id: "app_203",
        title: "Routine Maintenance Window Policy",
        category: "Database",
        risk: "Low",
        status: "Approved",
        maxDuration: "4 Hours",
        approvedBy: "Database Administrator Group"
      }
    ];

    res.json(approvals);
  } catch (error) {
    console.error("Error fetching governance approvals:", error);
    res.status(500).json({ error: "Failed to load governance pre-approvals" });
  }
});

// POST /api/change/standard/create
router.post("/standard/create", async (req, res) => {
  try {
    const { templateId } = req.body;

    if (!templateId) {
      return res.status(400).json({ error: "Template ID is required." });
    }

    const newChangeRequest = {
      changeId: `CHG-${Math.floor(100000 + Math.random() * 900000)}`,
      templateId,
      type: "Standard",
      status: "Implement",
      createdAt: new Date().toISOString()
    };

    res.status(201).json({
      message: "Standard change request created successfully",
      data: newChangeRequest
    });
  } catch (error) {
    console.error("Error creating standard change:", error);
    res.status(500).json({ error: "Failed to create standard change request" });
  }
});

/* ==========================================
   4. CAB MEETINGS ENDPOINTS
   ========================================== */

// Update meeting (reschedule or sign‑off)
router.put("/meetings/:id", async (req, res) => {
  try {
    const meeting = await CABMeeting.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(meeting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* -----------------------------
   LIST CHANGE REQUESTS
------------------------------ */
router.get("/", requirePermission("change_request", "read"), async (req, res) => {
  try {
    const q = {};
    // Check both status and state query params for backwards compatibility
    if (req.query.status) q.status = req.query.status;
    else if (req.query.state) q.status = req.query.state;

    const list = await ChangeRequest.find(q)
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    return res.json(list);
  } catch (e) {
    return res.status(500).json({ error: e.message || "Failed to fetch change requests" });
  }
});

/* -----------------------------
   CREATE CHANGE REQUEST
------------------------------ */
// router.post("/", requirePermission("change_request", "create"), async (req, res) => {
//   try {
//     const result = await createChange(req.body, req.user);
//     return res.status(201).json(result.change || result);
//   } catch (e) {
//     console.error("❌ CREATE CHANGE ERROR:", {
//       message: e.message,
//       errors: e.errors || e.errInfo?.details
//     });

//     return res.status(400).json({
//       error: e.message,
//       details: e.errors ? Object.keys(e.errors) : e.errInfo?.details
//     });
//   }
// });

// POST: Create regular change request
router.post("/", async (req, res) => {
  try {
    const change = new ChangeRequest({ ...req.body, tenant: "default" });
    await change.save();
    res.status(201).json(change);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* -----------------------------
   VIEW APPROVALS FOR CHANGE
------------------------------ */
router.get("/:id/approvals", requirePermission("change_request", "read"), async (req, res) => {
  try {
    const approvals = await ChangeApproval.find({
      changeId: req.params.id
    }).lean();
    return res.json(approvals);
  } catch (e) {
    return res.status(500).json({ error: e.message || "Failed to fetch approvals" });
  }
});

/* -----------------------------
   ADD APPROVAL ENTRY
------------------------------ */
router.post("/:id/approvals", requirePermission("change_request", "update"), async (req, res) => {
  try {
    const { approverGroup, decision, comment } = req.body;

    const doc = await ChangeApproval.create({
      changeId: req.params.id,
      approverGroup,
      approverId: req.user?._id,
      decision,
      comment
    });

    return res.status(201).json(doc);
  } catch (e) {
    return res.status(400).json({ error: e.message || "Failed to add approval entry" });
  }
});

/* -----------------------------
   SIMPLE TRANSITION (NO APPROVAL CHECK)
------------------------------ */
router.post("/:id/transition-simple", requirePermission("change_request", "update"), async (req, res) => {
  try {
    const { toState, reason } = req.body;
    const change = await ChangeRequest.findById(req.params.id);

    if (!change) return res.status(404).json({ error: "Not found" });

    // FIX: Updated from change.state to change.status
    const fromState = change.status || change.state;

    change.status = toState;
    change.stateHistory = change.stateHistory || [];
    change.stateHistory.push({
      from: fromState,
      to: toState,
      by: req.user?._id,
      reason,
      at: new Date()
    });

    await change.save();
    return res.json(change);
  } catch (e) {
    return res.status(400).json({ error: e.message || "Failed to transition state" });
  }
});

/* -----------------------------
   FULL TRANSITION WITH APPROVAL CHECKER
------------------------------ */
router.post("/:id/transition", requirePermission("change_request", "update"), async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { toState, reason } = req.body;

    const change = await transitionChange(
      req.params.id,
      toState,
      req.user?._id,
      reason,
      async (changeDoc, fromState, targetState) => {
        if (fromState === "Authorize" && targetState === "Scheduled") {
          const approvals = await ChangeApproval.countDocuments({
            changeId: changeDoc._id,
            decision: "Approved"
          }).session(session);

          return approvals > 0;
        }
        return true;
      }
    );

    await session.commitTransaction();
    session.endSession();

    return res.json(change);
  } catch (e) {
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json({ error: e.message || "Transition failed" });
  }
});

/* -----------------------------
   APPROVE (append-only)
------------------------------ */
router.post("/:id/approve", requirePermission("change_request", "update"), async (req, res) => {
  try {
    const { approverGroup, decision, comment } = req.body;

    // FIX: Replaced non-existent .record() with standard .create()
    const doc = await ChangeApproval.create({
      changeId: req.params.id,
      approverGroup,
      approverId: req.user?._id,
      decision,
      comment,
      metadata: {
        ip: req.ip,
        userAgent: req.get("User-Agent")
      }
    });

    return res.status(201).json(doc);
  } catch (e) {
    return res.status(400).json({ error: e.message || "Failed to record approval" });
  }
});

/* ==========================================
   GENERIC WILDCARD & PARAMETER ROUTES (MUST BE LAST)
   ========================================== */
/* -----------------------------
   GET SINGLE CHANGE REQUEST
------------------------------ */
// router.get("/:id", requirePermission("change_request", "read"), async (req, res) => {
//   try {
//     const change = await ChangeRequest.findById(req.params.id).lean();
//     if (!change) {
//       return res.status(404).json({ error: "Change request not found" });
//     }
//     return res.json(change);
//   } catch (e) {
//     return res.status(400).json({ error: e.message || "Invalid change request ID" });
//   }
// });

router.get("/:id", async (req, res) => {
  try {
    const parentId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 5;
    const skipValue = (page - 1) * pageSize;

    // Matches the field array in ChangeRequestSchema
    const queryFilter = { relatedCIs: parentId };

    const [total, data] = await Promise.all([
      ChangeRequest.countDocuments(queryFilter),
      ChangeRequest.find(queryFilter)
        .sort({ createdAt: -1 })
        .skip(skipValue)
        .limit(pageSize)
    ]);

    // Matches your frontend's responseData payload structure
    res.json({
      table: data,
      totalPages: Math.ceil(total / pageSize) || 1
    });
  } catch (err) {
    console.error("Error loading paginated changes:", err);
    res.status(500).json({ error: "Failed to load changes" });
  }
});

// GET: Individual Single Detail Document Lookups
router.get("/detail/:id", async (req, res) => {
  try {
    const change = await ChangeRequest.findById(req.params.id);
    if (!change) return res.status(404).json({ error: "Change not found" });
    res.json(change);
  } catch (err) {
    res.status(404).json({ error: "Change not found" });
  }
});

/* -----------------------------
   UPDATE CHANGE REQUEST
------------------------------ */
// router.put("/:id", requirePermission("change_request", "update"), async (req, res) => {
//   try {
//     const user = req.user;
//     const result = await updateChange(req.params.id, req.body, user);

//     if (result?.error === "collision") {
//       return res.status(409).json(result);
//     }

//     return res.json(result.change || result);
//   } catch (e) {
//     return res.status(400).json({ error: e.message || "Failed to update change request" });
//   }
// });

// PUT: Update regular change request
router.put("/:id", async (req, res) => {
  try {
    const updated = await ChangeRequest.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: "Change not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* -----------------------------
   DELETE CHANGE REQUEST
------------------------------ */
// router.delete("/:id", requirePermission("change_request", "delete"), async (req, res) => {
//   try {
//     const deleted = await ChangeRequest.findByIdAndDelete(req.params.id);
//     if (!deleted) {
//       return res.status(404).json({ error: "Change request not found" });
//     }
//     return res.json({ ok: true });
//   } catch (e) {
//     return res.status(400).json({ error: e.message || "Failed to delete change request" });
//   }
// });

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await ChangeRequest.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Change not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;