import express from "express";
import Change from "../models/Change.js";
import CMDB from "../models/CMDB.js";

const router = express.Router();

router.get("/:id/risk-score", async (req, res) => {
  const change = await Change.findById(req.params.id);
  const cis = await CMDB.find({ _id: { $in: change.related_cis } });

  let score = 0;

  cis.forEach(ci => {
    const crit = ci.business_criticality;
    if (crit === "Critical") score += 5;
    else if (crit === "High") score += 4;
    else if (crit === "Medium") score += 3;
    else score += 1;

    if (ci.environment === "Prod") score += 5;
    else if (ci.environment === "Test") score += 2;
    else score += 1;
  });

  if (change.type === "Emergency") score += 5;
  else if (change.type === "Normal") score += 3;
  else score += 1;

  res.json({ score });
});

export default router;
