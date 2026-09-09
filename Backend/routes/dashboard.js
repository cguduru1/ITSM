import express from "express";
import { Ticket } from "../models/Ticket.js";
import Asset from "../models/Asset.js";
import Change from "../models/Change.js";
import CMDB from "../models/CMDB.js"
import KnowledgeArticle from "../models/KnowledgeArticle.js";

const router = express.Router();

router.get("/stats", async (req, res) => {
  try {
    const activeAssets = await Asset.countDocuments({ 
      status: { $in: ["Active", "In-Stock", "Deployed", "In Use"] } 
    });
    const openTickets = await Ticket.countDocuments({ 
      status: { $in: ["New", "Assess", "Authorize", "Scheduled", "Implement", "Review"] } 
    });
    const pendingChanges = await Change.countDocuments({ status: "Pending" });

    // Example placeholders — replace with real calculations
    // const ciHealth = "92%";
    const ciHealth = await CMDB.countDocuments({ status: "Operational" });
    // const kbSuccess = "87%"; 
    
    const kbSuccess = await KnowledgeArticle.countDocuments({ status: "Published" });

    res.json({
      activeAssets,
      openTickets,
      pendingChanges,
      ciHealth,
      kbSuccess,
    });
  } catch (err) {
    console.error("Failed to load dashboard stats:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
