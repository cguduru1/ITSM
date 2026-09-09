import ChangeSLA from "../models/ChangeSLA.js";
import Change from "../models/Change.js";

  export async function evaluateSLA(req, res) {
  try {
    const change = await Change.findById(req.body.changeId);
    const slaHours = change.priority === "High" ? 4 : change.priority === "Medium" ? 8 : 24;

    const breached = new Date() > new Date(change.createdAt.getTime() + slaHours * 3600000);

    const result = await ChangeSLA.create({
      changeId: change._id,
      slaHours,
      breached
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "SLA evaluation failed" });
  }
};
