import express from "express";
// FIX 1: Import your correct, target-named schema file configuration
import ChangeRequest from "../models/ChangeRequest.js"; 
import ChangeTimeline from "../models/ChangeTimeline.js";
import { sendNotification } from "../services/notification.service.js";
import { sendEmail } from "../services/email.service.js";
import { cabInviteTemplate } from "../services/changeEmailTemplates.js";
import { calculateSLA } from "../utils/changeSLA.js";

const router = express.Router();

// CREATE
router.post("/", async (req, res) => {
  try {
    const change = await ChangeRequest.create(req.body);
    res.json(change);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// LIST (ALL CHUNKS)
router.get("/", async (req, res) => {
  try {
    const { search = "", status = "All", page = 1, pageSize = 5 } = req.query;

    const query = {};
    if (search) query.title = { $regex: search, $options: "i" };
    if (status !== "All") query.status = status;

    const total = await ChangeRequest.countDocuments(query);

    const data = await ChangeRequest.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(Number(pageSize));

    res.json({
      table: data,
      totalPages: Math.ceil(total / pageSize) || 1
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// FIX 2: RECONFIGURED LISTING ROUTE FOR A SPECIFIC PARENT ITEM (e.g. CI ID)
// This returns the structure your frontend needs to map rows
router.get("/:id", async (req, res) => {
  try {
    const parentId = req.params.id;
    const { page = 1, pageSize = 5 } = req.query;

    // Filter to find records associated with this parent element
    const query = { relatedCIs: parentId };
    const total = await ChangeRequest.countDocuments(query);

    const data = await ChangeRequest.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(Number(pageSize));

    res.json({
      table: data,
      totalPages: Math.ceil(total / pageSize) || 1
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// FIX 3: ADDED SPECIFIC ROUTE FOR RETRIEVING A SINGLE RECORD CARD 
router.get("/detail/:id", async (req, res) => {
  try {
    const change = await ChangeRequest.findById(req.params.id);
    if (!change) return res.status(404).json({ error: "Change not found" });
    res.json(change);
  } catch (err) {
    res.status(404).json({ error: "Change not found" });
  }
});

router.get("/:id/timeline", async (req, res) => {
  const logs = await ChangeTimeline.find({ changeId: req.params.id }).sort({ timestamp: -1 });
  res.json(logs);
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const updated = await ChangeRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });

    // Notify requester
    if (updated.requestedBy) {
      await sendNotification(
        updated.requestedBy,
        "Change Updated",
        `Your change "${updated.title}" was updated.`
      );
    }

    if (updated.requestedByEmail) {
      await sendEmail(
        updated.requestedByEmail,
        "Change Updated",
        `Your change "${updated.title}" was updated.`
      );
    }

    // Log timeline entry
    await ChangeTimeline.create({
      changeId: req.params.id,
      action: "Change Updated",
      details: JSON.stringify(req.body),
      user: req.body.updatedBy || "System" 
    });
  
    // If change enters CAB review stage
    if (req.body.status === "Pending CAB Approval") {
      const sla = calculateSLA(updated);
      const emailBody = cabInviteTemplate(updated, sla.slaHours);

      await sendEmail(
        "cab-team@company.com",
        `CAB Review: ${updated.title}`,
        emailBody
      );
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    await ChangeRequest.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
