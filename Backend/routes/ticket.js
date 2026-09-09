// itsm-backend/routes/ticket.js
import express from "express";
import { Ticket, ITIncident, HROnboarding, FacilitiesWorkOrder } from "../models/Ticket.js";
import CI from "../models/CI.js";
import User from "../models/User.js";
import requirePermission from "../middleware/requirePermission.js";
import RequestCatalogItem from "../models/RequestCatalogItem.js";

import { calculatePriority } from "../utils/priority.js";
import { sendNotification } from "../services/notificationEngine.js";

const router = express.Router();

/* Helper: set SLA dates */
function setSla(ticket) {
  const now = new Date();
  const responseMinutes = ticket.priority === "P1" ? 30 :
                          ticket.priority === "P2" ? 60 :
                          ticket.priority === "P3" ? 240 : 480;
  const resolutionMinutes = ticket.priority === "P1" ? 240 :
                            ticket.priority === "P2" ? 480 :
                            ticket.priority === "P3" ? 1440 : 2880;

  ticket.slaResponseDue = new Date(now.getTime() + responseMinutes * 60000);
  ticket.slaResolutionDue = new Date(now.getTime() + resolutionMinutes * 60000);
}

// /* Helper: calculate priority from impact + urgency */
// function calculatePriority(impact, urgency) {
//   const map = {
//     HighHigh: "P1",
//     HighMedium: "P2",
//     MediumHigh: "P2",
//     MediumMedium: "P3",
//     LowHigh: "P3",
//     LowMedium: "P4",
//     LowLow: "P4"
//   };
//   return map[`${impact}${urgency}`] || "P3";
// }

/* Helper: simple AI KB suggestion (title/description keyword match) */
async function suggestKb(ticket) {
  // placeholder: you can replace with real AI
  // For now, just leave empty array
  ticket.suggestedKbIds = [];
}

/* ==========================================================================
   1. SPECIFIC NAMED GET ROUTES (MUST BE DECLARED BEFORE /:id)
   ========================================================================== */

   /* ANALYTICS */
router.get("/analytics", requirePermission("ticket", "analytics"), async (req, res) => {
try {
    
    const byType = await Ticket.aggregate([{ $group: { _id: "$type", count: { $sum: 1 } } }]);
    const byStatus = await Ticket.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);
    const byPriority = await Ticket.aggregate([{ $group: { _id: "$priority", count: { $sum: 1 } } }]);

    const slaBreached = await Ticket.countDocuments({
      status: { $ne: "Closed" },
      slaResolutionDue: { $lt: new Date() }
    });

    const stats = {
      total: await Ticket.countDocuments(),
      open: await Ticket.countDocuments({ status: "New" }),
      closed: await Ticket.countDocuments({ status: "Closed" }),
      low: await Ticket.countDocuments({ priority: "Low" }),
      medium: await Ticket.countDocuments({ priority: "Medium" }),
      high: await Ticket.countDocuments({ priority: "High" })
    };

    res.json({ byType, byStatus, byPriority, slaBreached, stats });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

/* MAJOR INCIDENTS SECOND */
router.get("/major-incidents", requirePermission("ticket", "view"), async (req, res) => {
  try {
    const majors = await Ticket.find({
      type: "Incident",
      isMajorIncident: true
    }).lean();
    return res.json(majors);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch major incidents" });
  }
});

// Get incidents for a problem
router.get("/:problemId/incidents", requirePermission("ticket", "view"), async (req, res) => {
  try {  
  const incidents = await Ticket.find({
      parentProblemId: req.params.problemId,
      type: "Incident"
    }).lean();

    res.json(incidents);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch linked incidents" });
  }
});

/* AI Assist (simple) */
router.get("/ai/:id", requirePermission("ticket", "ai"), async (req, res) => {
  try { 
    const ticket = await Ticket.findById(req.params.id).lean();
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    const hints = [];

    if (ticket.ciName) {
      hints.push(`Check CMDB record for ${ticket.ciName} for recent changes or incidents.`);
    }
    if (ticket.priority === "P1") {
      hints.push("Escalate to Major Incident process and notify stakeholders.");
    }
    if (ticket.type === "ServiceRequest") {
      hints.push("Verify approval workflow and required fulfillment tasks.");
    }

    res.json({ suggestedKbIds: ticket.suggestedKbIds || [], hints });
  } catch (err) {
    res.status(400).json({ error: "Invalid ticket ID" });
  }
});

/* LIST (Dashboard / Queue) */
router.get("/", requirePermission("ticket", "view"), async (req, res) => {
  try {
    const { type, status, priority, assigneeId } = req.query;
    const query = {$or: [{ tenant: "default" }, { tenant: { $exists: false } }]};
    if (type) query.type = type;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assigneeId) query.assigneeId = assigneeId;

    const tickets = await Ticket.find(query).sort({ createdAt: -1 }).lean();
    return res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
});

/* ==========================================================================
   2. SINGLE POST ENDPOINT (Merged Discriminator + Generic Ticket Intake)
   ========================================================================== */

   router.post("/", requirePermission("ticket", "create"), async (req, res) => {
  try {
    const { ticketType, impact = "Medium", urgency = "Medium" } = req.body;
    let newTicket;

    // Handle Sub-type creation
    if (ticketType === "ITIncident") {
      const priority = calculatePriority(impact, urgency);
      if (req.body.state && req.body.state !== "New" && !req.body.assignmentGroup) {
        return res.status(400).json({ error: "Assignment Group is mandatory when moving out of 'New' state." });
      }

      newTicket = new ITIncident({ ...req.body, priority });
      setSla(newTicket);
      await newTicket.save();

      const populated = await newTicket.populate("caller", "email");
      sendNotification("IT_TICKET_CREATED", {
        number: newTicket.number,
        shortDescription: newTicket.shortDescription,
        callerEmail: populated.caller?.email,
        id: newTicket._id,
      });

    } else if (ticketType === "HROnboarding") {
      newTicket = new HROnboarding(req.body);
      await newTicket.save();

      const populated = await newTicket.populate("hiringManager", "email");
      sendNotification("HR_ONBOARDING_INITIALIZED", {
        newHireName: newTicket.newHireName,
        managerEmail: populated.hiringManager?.email,
        id: newTicket._id,
      });

    } else if (ticketType === "FacilitiesWorkOrder") {
      newTicket = new FacilitiesWorkOrder(req.body);
      await newTicket.save();

    } else {
      // Generic base Ticket creation fallback
      const priority = calculatePriority(impact, urgency);
      newTicket = new Ticket({
        ...req.body,
        impact,
        urgency,
        priority,
        status: req.body.status || "New",
        requesterId: req.user?._id || null,
        requesterName: req.user?.name || "System User",
        tenant: req.body.tenant || "default"
      });

      setSla(newTicket);
      await newTicket.save();
    }

    return res.status(201).json(newTicket);
  } catch (err) {
    return res.status(400).json({ error: err.message || "Failed to create ticket" });
  }
});

router.post("/from-catalog/:catalogId", requirePermission("ticket", "create"), async (req, res) => {
    try {
    const catalog = await RequestCatalogItem.findById(req.params.catalogId).lean();
    if (!catalog) return res.status(404).json({ error: "Catalog item not found" });

    const impact = catalog.defaultImpact || "Medium";
    const urgency = catalog.defaultUrgency || "Medium";
    const priority = catalog.defaultPriority || calculatePriority(impact, urgency);

    const ticket = new Ticket({
      type: "ServiceRequest",
      channel: "Portal",
      title: catalog.name,
      description: catalog.description,
      impact,
      urgency,
      priority,
      group: catalog.defaultGroup,
      requesterId: req.user?._id || null,
      requesterName: req.user?.name || "System User"
    });

    setSla(ticket);

    if (catalog.ciTemplateId) {
      const ci = await CI.findById(catalog.ciTemplateId).lean();
      if (ci) {
        ticket.ciId = ci._id;
        ticket.ciName = ci.name;
      }
    }

    ticket.number = `SR${String(Date.now()).slice(-6)}`;
    await suggestKb(ticket);

    const saved = await ticket.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to create catalog ticket" });
  }
});

// Link incident to problem
router.post("/:problemId/link-incident/:incidentId", requirePermission("ticket", "update"), async (req, res) => {
    try {
    const problem = await Ticket.findById(req.params.problemId);
    const incident = await Ticket.findById(req.params.incidentId);

    if (!problem || !incident) {
      return res.status(404).json({ error: "Problem or Incident not found" });
    }
    if (problem.type !== "Problem" || incident.type !== "Incident") {
      return res.status(400).json({ error: "Invalid ticket types" });
    }

    incident.parentProblemId = problem._id;
    await incident.save();

    if (!problem.linkedIncidentIds.includes(incident._id)) {
      problem.linkedIncidentIds.push(incident._id);
      await problem.save();
    }

    res.json({ problem, incident });
  } catch (err) {
    res.status(400).json({ error: "Failed to link incident to problem" });
  }
});

/* ADD WORK NOTE */
router.post("/:id/work-note", requirePermission("ticket", "update"), async (req, res) => {
    try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    ticket.workNotes.push({
      authorId: req.user?._id,
      authorName: req.user?.name || "System User",
      type: req.body.type || "internal",
      text: req.body.text
    });

    ticket.updatedAt = new Date();
    await ticket.save();

    res.json(ticket);
  } catch (err) {
    res.status(400).json({ error: "Failed to add work note" });
  }
});

/* ==========================================================================
   3. PUT / SINGLE GET / DELETE ENDPOINTS
   ========================================================================== */

/* -----------------------------
   ASSIGN TICKET (Admin only)
------------------------------ */
// router.put("/:id/assign", requirePermission("ticket", "update"), async (req, res) => {
//   try {
//     const { assigneeId } = req.body;

//     const ticket = await Ticket.findById(req.params.id);
//     if (!ticket) {return res.status(404).json({ error: "Ticket not found" });}

//     if (assigneeId) {
//       // Look up the user to get their name
//       const agent = await User.findById(assigneeId).lean();
//       if (!agent) {return res.status(400).json({ error: "Invalid assigneeId" });}

//       ticket.assigneeId = agent._id;
//       ticket.assigneeName = agent.name;
//     } else {
//       // Clear assignment if null
//       ticket.assigneeId = null;
//       ticket.assigneeName = "";
//     }

//     await ticket.save();

//     // Return updated ticket with assignee info
//     res.json({
//       _id: ticket._id,
//       number: ticket.number,
//       title: ticket.title,
//       status: ticket.status,
//       priority: ticket.priority,
//       assigneeId: ticket.assigneeId,
//       assigneeName: ticket.assigneeName
//     });
//   } catch (err) {
//     console.error("❌ Assign route error:", err.message);
//     res.status(400).json({ error: err.message });
//   }
// });

router.put("/:id/assign", async (req, res) => {
  try {
    const { assigneeId } = req.body;

    // // Optional: look up user to store name
    // let assignedTo = null;
    // if (assigneeId) {
    //   const user = await User.findById(assigneeId);
    //   if (!user) return res.status(400).json({ error: "Invalid assigneeId" });
    //   assignedTo = user.name;
    // }

    // Use findByIdAndUpdate to target ONLY the assignee fields directly 
    // without triggering validation errors on old field formatting
    const updatedTicket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { $set: { assigneeId: assigneeId || null } },
      { new: true, runValidators: true }
    ).populate("assigneeId", "name"); 
    // 👆 populate the assigneeId field, returning only name + email

    if (!updatedTicket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    res.json(updatedTicket);
  } catch (err) {
    console.error("Assignment route failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* -----------------------------
   GET SINGLE TICKET
------------------------------ */
router.get("/:id", requirePermission("ticket", "read"), async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).lean();
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    res.json(ticket);
  } catch (err) {
    res.status(400).json({ error: "Invalid ticket ID" });
  }
});

/* SINGLE CONSOLIDATED UPDATE ENDPOINT */
router.put("/:id", requirePermission("ticket", "update"), async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    // 1. Resolution section validation
    if (ticket.ticketType === "ITIncident" && (req.body.state === "Resolved" || req.body.status === "Resolved")) {
      if (!req.body.resolution?.code || !req.body.resolution?.notes) {
        return res.status(400).json({ error: "Resolution Code and Resolution Notes are mandatory when resolving a ticket." });
      }
    }

    // 2. Manage SLA Pause states
    const targetStatus = req.body.state || req.body.status;
    if (targetStatus === "OnHold" || targetStatus === "On Hold") {
      req.body.slaPaused = true;
    } else if (targetStatus === "InProgress" || targetStatus === "In Progress" || targetStatus === "Resolved") {
      req.body.slaPaused = false;
    }

    // Apply updates
    Object.assign(ticket, req.body);
    await ticket.save();

    // 3. Dispatch Resolution Notification
    if (ticket.ticketType === "ITIncident" && (ticket.state === "Resolved" || ticket.status === "Resolved")) {
      const populated = await ticket.populate("caller", "email");
      sendNotification("IT_TICKET_RESOLVED", {
        number: ticket.number,
        resolutionNotes: ticket.resolution?.notes,
        callerEmail: populated.caller?.email,
        id: ticket._id,
      });
    }

    return res.json(ticket);
  } catch (err) {
    return res.status(400).json({ error: err.message || "Failed to update ticket" });
  }
});

/* UPDATE (Lifecycle, notes, routing) */
router.put("/:id", requirePermission("ticket", "update"), async (req, res) => {
  try {
    const updates = req.body;

    if (updates.status === "OnHold" || updates.status === "On Hold") {
      updates.slaPaused = true;
    }
    if (updates.status === "InProgress" || updates.status === "In Progress" || updates.status === "Resolved") {
      updates.slaPaused = false;
    }

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    res.json(ticket);
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to update ticket" });
  }
});

/* DELETE */
router.delete("/:id", requirePermission("ticket", "delete"), async (req, res) => {
  try {
    const deleted = await Ticket.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Ticket not found" });
    res.json({ success: true, message: "Ticket deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: "Failed to delete ticket" });
  }
});

/* CREATE (Omnichannel intake) */
router.post("/", requirePermission("ticket", "create"), async (req, res) => {
  try {
    const body = req.body;
    const impact = body.impact || "Medium";
    const urgency = body.urgency || "Medium";
    const priority = calculatePriority(impact, urgency);

    const ticket = new Ticket({
      ...body,
      impact,
      urgency,
      priority,
      status: body.status || "New",
      requesterId: req.user?._id || null,
      requesterName: req.user?.name || "System User",
      tenant: body.tenant || "default"
    });

    setSla(ticket);

    await ticket.save();
    res.status(201).json(ticket);
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to create ticket" });
  }
});

// PUT /api/tickets/:id - State Transitions & Resolution Logic
router.put("/:id", async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    // Validate Resolution section requirements for IT Incidents
    if (ticket.ticketType === "ITIncident" && req.body.state === "Resolved") {
      if (!req.body.resolution?.code || !req.body.resolution?.notes) {
        return res.status(400).json({ error: "Resolution Code and Resolution Notes are mandatory when resolving a ticket." });
      }
    }

    Object.assign(ticket, req.body);
    await ticket.save();

    // Trigger Resolution Email if state changed to Resolved
    if (ticket.ticketType === "ITIncident" && ticket.state === "Resolved") {
      const populated = await ticket.populate("caller", "email");
      sendNotification("IT_TICKET_RESOLVED", {
        number: ticket.number,
        resolutionNotes: ticket.resolution.notes,
        callerEmail: populated.caller?.email,
        id: ticket._id,
      });
    }

    return res.json(ticket);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/tickets - Create Ticket Dynamic Router
router.post("/", async (req, res) => {
  try {
    const { ticketType } = req.body;
    let newTicket;

    if (ticketType === "ITIncident") {
      // 1. Calculate Priority
      const priority = calculatePriority(req.body.impact, req.body.urgency);

      // 2. Validate Conditional Assignment Group requirement
      if (req.body.state && req.body.state !== "New" && !req.body.assignmentGroup) {
        return res.status(400).json({ error: "Assignment Group is mandatory when moving out of 'New' state." });
      }

      newTicket = new ITIncident({ ...req.body, priority });
      await newTicket.save();

      // Dispatch Creation Notification
      const populated = await newTicket.populate("caller", "email");
      sendNotification("IT_TICKET_CREATED", {
        number: newTicket.number,
        shortDescription: newTicket.shortDescription,
        callerEmail: populated.caller?.email,
        id: newTicket._id,
      });

    } else if (ticketType === "HROnboarding") {
      newTicket = new HROnboarding(req.body);
      await newTicket.save();

      const populated = await newTicket.populate("hiringManager", "email");
      sendNotification("HR_ONBOARDING_INITIALIZED", {
        newHireName: newTicket.newHireName,
        managerEmail: populated.hiringManager?.email,
        id: newTicket._id,
      });

    } else if (ticketType === "FacilitiesWorkOrder") {
      newTicket = new FacilitiesWorkOrder(req.body);
      await newTicket.save();
    } else {
      return res.status(400).json({ error: "Invalid ticket type specified." });
    }

    return res.status(201).json(newTicket);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});


export default router;
