import express from "express";
import PDFDocument from "pdfkit";
import Change from "../models/Change.js";
import CMDB from "../models/CMDB.js";
import Asset from "../models/Asset.js";
import ChangeTimeline from "../models/ChangeTimeline.js";
import { calculateSLA } from "../utils/changeSLA.js";

const router = express.Router();

router.get("/:id/pdf", async (req, res) => {
  try {
    const change = await Change.findById(req.params.id);
    const cis = await CMDB.find({ _id: { $in: change.related_cis } });
    const assets = await Asset.find({ _id: { $in: change.related_assets } });
    const timeline = await ChangeTimeline.find({ changeId: req.params.id });
    const sla = calculateSLA(change);

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    doc.fontSize(20).text(`Change Report: ${change.title}`);
    doc.moveDown();

    doc.fontSize(14).text("Summary");
    doc.text(`Status: ${change.status}`);
    doc.text(`Requested By: ${change.requestedBy}`);
    doc.text(`Created: ${change.createdAt}`);
    doc.moveDown();

    doc.fontSize(14).text("SLA");
    doc.text(`Target: ${sla.slaHours} hours`);
    doc.text(`Deadline: ${sla.deadline}`);
    doc.text(`Breached: ${sla.breached}`);
    doc.moveDown();

    doc.fontSize(14).text("Linked CIs");
    cis.forEach(ci => doc.text(`- ${ci.name} (${ci.business_criticality})`));
    doc.moveDown();

    doc.fontSize(14).text("Linked Assets");
    assets.forEach(a => doc.text(`- ${a.name} (${a.type})`));
    doc.moveDown();

    doc.fontSize(14).text("Timeline");
    timeline.forEach(t => doc.text(`${t.timestamp}: ${t.action}`));

    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
