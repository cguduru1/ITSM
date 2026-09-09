import { Ticket } from "../models/Ticket.js";

export function registerExecutiveRoute(app) {
  app.get("/api/analytics/executive", async (req, res) => {
    const tenant = req.user?.tenant || "default";

    const totalTickets = await Ticket.countDocuments({ tenant });

    const resolvedToday = await Ticket.countDocuments({
      tenant,
      status: "Resolved",
      updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    const avgRes = await Ticket.aggregate([
      { $match: { tenant, resolutionHours: { $gt: 0 } } },
      { $group: { _id: null, avg: { $avg: "$resolutionHours" } } }
    ]);

    res.json({
      totalTickets,
      resolvedToday,
      avgResolutionTime: avgRes[0]?.avg || 0
    });
  });
}
