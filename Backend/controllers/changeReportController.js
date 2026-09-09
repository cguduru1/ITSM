import ChangeReport from "../models/ChangeReport.js";
import Change from "../models/Change.js";

  export async function generateReport(req, res) {
  try {
    const change = await Change.findById(req.body.changeId);

    const report = await ChangeReport.create({
      changeId: change._id,
      summary: change.description,
      riskLevel: change.risk || "Medium",
      impactScore: change.impactScore || 0,
      slaBreached: change.slaBreached || false
    });

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: "Report generation failed" });
  }
};
