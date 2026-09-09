import { Ticket } from "../models/Ticket.js";

export function registerHeatmapRoute(app) {
  app.get("/api/analytics/heatmap", async (req, res) => {
    const tenant = req.user?.tenant || "default";

    const data = await Ticket.find(
      {
        tenant,
        "location.lat": { $ne: null },
        "location.lng": { $ne: null }
      },
      {
        location: 1,
        category: 1,
        priority: 1
      }
    );

    res.json(data);
  });
}
