import { Ticket } from "../models/Ticket.js";

export function registerExportRoute(app) {
  app.get("/api/analytics/export", async (req, res) => {
    const tenant = req.user?.tenant || "default";
    const tickets = await Ticket.find({ tenant });
    res.json(tickets);
  });
}
