import { Ticket } from "../models/Ticket.js";
import { predictSLA } from "../utils/sla.js";
import { autoAssign } from "../utils/assign.js";

function classifyIssue(text) {
  const t = text.toLowerCase();

  if (t.includes("server") || t.includes("down") || t.includes("network"))
    return { category: "Infrastructure", priority: "Critical" };
  if (t.includes("email") || t.includes("outlook") || t.includes("smtp"))
    return { category: "Messaging", priority: "High" };
  if (t.includes("password") || t.includes("login") || t.includes("access"))
    return { category: "Access Management", priority: "High" };
  if (t.includes("hr") || t.includes("leave") || t.includes("payroll"))
    return { category: "HR", priority: "Medium" };

  return { category: "General", priority: "Medium" };
}

function detectIntent(message) {
  const t = message.toLowerCase();
  if (t.includes("create ticket") || t.includes("raise ticket")) return "create_ticket";
  if (t.includes("status") || t.includes("check ticket")) return "check_status";
  if (t.includes("my tickets")) return "my_tickets";
  if (t.includes("sla")) return "sla_info";
  return "describe_issue";
}

function extractTicket(message) {
  const titleMatch = message.match(/title\s*:\s*(.+)/i);
  const descMatch = message.match(/(desc|description)\s*:\s*(.+)/i);

  const title = titleMatch ? titleMatch[1].trim() : "Issue via chatbot";
  const description = descMatch ? descMatch[2].trim() : message;

  return { title, description };
}

export function registerChatbotRoutes(app) {
  app.post("/api/chat", async (req, res) => {
    const { message } = req.body;
    const userCtx = req.user || {
      name: "Chat User",
      role: "user",
      department: "general",
      tenant: "default"
    };

    if (!message) return res.json({ reply: "Please describe your issue." });

    const intent = detectIntent(message);

    if (userCtx.role === "admin" && message.toLowerCase().includes("list agents")) {
      const agents = await Ticket.aggregate([
        { $group: { _id: "$assignedTo", count: { $sum: 1 } } }
      ]);
      return res.json({
        reply: `Agents workload: ${agents.map(a => `${a._id}: ${a.count}`).join(", ")}`
      });
    }

    if (intent === "create_ticket") {
      const { title, description } = extractTicket(message);
      const ai = classifyIssue(description);
      const sla = predictSLA(ai.priority, ai.category);
      const assignedTo = autoAssign(ai.category, userCtx.department);

      const ticket = await new Ticket({
        title,
        description,
        createdBy: userCtx.name,
        category: ai.category,
        priority: ai.priority,
        slaTarget: sla,
        assignedTo,
        tenant: userCtx.tenant,
        department: userCtx.department
      }).save();

      return res.json({
        reply: `Ticket created: ${ticket._id}\nCategory: ${ai.category}\nPriority: ${ai.priority}\nSLA: ${sla}\nAssigned to: ${assignedTo}`
      });
    }

    if (intent === "check_status") {
      const idMatch = message.match(/([0-9a-f]{24})/i);
      if (!idMatch) return res.json({ reply: "Please provide a valid ticket ID." });

      const ticket = await Ticket.findOne({ _id: idMatch[1], tenant: userCtx.tenant });
      if (!ticket) return res.json({ reply: "Ticket not found in your tenant." });

      ticket.computeSLABreach();
      await ticket.save();

      return res.json({
        reply: `Ticket ${ticket._id}\nStatus: ${ticket.status}\nAssigned to: ${ticket.assignedTo || "N/A"}\nSLA: ${ticket.slaTarget}\nBreached: ${ticket.slaBreached ? "Yes" : "No"}`
      });
    }

    if (intent === "my_tickets") {
      const tickets = await Ticket.find({
        tenant: userCtx.tenant,
        $or: [{ createdBy: userCtx.name }, { assignedTo: userCtx.name }]
      }).limit(5);

      if (!tickets.length) return res.json({ reply: "You have no recent tickets." });

      const list = tickets
        .map(t => `${t._id} - ${t.title} (${t.status}, ${t.priority})`)
        .join("\n");

      return res.json({ reply: `Your recent tickets:\n${list}` });
    }

    if (intent === "sla_info") {
      return res.json({
        reply:
          "SLA rules:\nCritical: 4h (Infra 2h)\nHigh: 8h\nMedium: 24h\nLow: 48h.\nCategories may tighten or relax SLA."
      });
    }

    const { title, description } = extractTicket(message);
    const ai = classifyIssue(description);

    return res.json({
      reply: `I understand: "${title}".\nCategory: ${ai.category}\nPriority: ${ai.priority}.\nSay "create ticket" to log it or "my tickets" to see your recent ones.`
    });
  });
}

export { classifyIssue };
