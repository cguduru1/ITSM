import ChangeImpact from "../models/ChangeImpact.js";

export async function calculateImpact(req, res) {
  try {
    const { changeId, affectedServices, affectedCIs } = req.body;

    const score = (affectedServices.length * 2) + affectedCIs.length;
    const risk = score > 10 ? "High" : score > 5 ? "Medium" : "Low";

    const impact = await ChangeImpact.create({
      changeId,
      affectedServices,
      affectedCIs,
      riskLevel: risk,
      impactScore: score
    });

    res.json(impact);
  } catch (err) {
    res.status(500).json({ error: "Impact calculation failed" });
  }
}
