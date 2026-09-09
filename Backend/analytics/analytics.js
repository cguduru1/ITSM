import { Ticket } from "../models/Ticket.js";

export function registerAnalyticsRoutes(app) {
  app.get("/api/analytics/summary", async (req, res) => {
    const tenant = req.user?.tenant || "default";

    const total = await Ticket.countDocuments({ tenant });
    const open = await Ticket.countDocuments({ tenant, status: "Open" });
    const closed = await Ticket.countDocuments({ tenant, status: "Resolved" });
    const breached = await Ticket.countDocuments({ tenant, slaBreached: true });

    res.json({ total, open, closed, breached });
  });

  app.get("/api/analytics/category", async (req, res) => {
    const tenant = req.user?.tenant || "default";
    const data = await Ticket.aggregate([
      { $match: { tenant } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json(data);
  });

  app.get("/api/analytics/priority", async (req, res) => {
    const tenant = req.user?.tenant || "default";
    const data = await Ticket.aggregate([
      { $match: { tenant } },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json(data);
  });

  app.get("/api/analytics/agents", async (req, res) => {
    const tenant = req.user?.tenant || "default";
    const data = await Ticket.aggregate([
      { $match: { tenant } },
      { $group: { _id: "$assignedTo", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json(data);
  });

  app.get("/api/analytics/departments", async (req, res) => {
    const tenant = req.user?.tenant || "default";
    const data = await Ticket.aggregate([
      { $match: { tenant } },
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json(data);
  });
}
