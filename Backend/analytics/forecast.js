import { Ticket } from "../models/Ticket.js";

export function registerForecastRoute(app) {
  app.get("/api/analytics/trends", async (req, res) => {
    const tenant = req.user?.tenant || "default";
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const data = await Ticket.aggregate([
      { $match: { tenant, createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(data);
  });

  app.get("/api/analytics/forecast", async (req, res) => {
    const tenant = req.user?.tenant || "default";
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const data = await Ticket.aggregate([
      { $match: { tenant, createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const counts = data.map(d => d.count);
    const avg = counts.length
      ? counts.reduce((a, b) => a + b, 0) / counts.length
      : 0;

    const forecast = Array.from({ length: 7 }).map((_, i) => ({
      day: `Day ${i + 1}`,
      predicted: Math.round(avg * (1 + (Math.random() - 0.5) * 0.3)) || 1
    }));

    res.json(forecast);
  });
}
