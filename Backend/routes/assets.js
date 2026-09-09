import express from "express";
import {
  getAssets,
  createAsset,
  updateAsset,
  deleteAsset,
  getLicenseCompliance,
  getStockroom,
  getWorkspace
} from "../controllers/assetController.js";
import { getAssetDashboard } from "../controllers/assetDashboardController.js";
import { getAssetTimeline } from "../controllers/assetLogController.js";
import { getAssetGraph } from "../controllers/assetRelController.js";
import { generateAssetPDF } from "../controllers/assetReportController.js";
import { exportCSV } from "../controllers/assetExportController.js";
import { importCSV } from "../controllers/assetImportController.js";
import { getAssetQR } from "../controllers/assetQRController.js";
import { getAssetAudit } from "../controllers/assetAuditController.js";
import { getAssetRisk } from "../controllers/assetRiskController.js";
import { getAssetUsage } from "../controllers/assetUsageController.js";

// Import your auth middleware (adjust path as needed)
// import { protect } from "../middleware/auth.js";
import verifyToken from "../middleware/auth.js";

import AssetMaster from "../models/AssetMaster"; 
import Ticket from "../models/Ticket";
import Change from "../models/Change";

const router = express.Router();

// Apply auth middleware to protect all asset routes
// (If you want public access for testing, comment this line out)
router.use(verifyToken);

// -------------------------------------------------------------
// 1. SPECIFIC / STATIC ROUTES (MUST BE DECLARED BEFORE /:id)
// -------------------------------------------------------------

   router.get("/dashboard/stats", async (req, res) => {
    try {
      const activeAssets = await AssetMaster.countDocuments({ 
      $or: [{ status: "Active" }, { status: "In Use" }, { isDeleted: false }] 
      });
      const openTickets = await Ticket.countDocuments({ status: "New" });
      const pendingChanges = await Change.countDocuments({ 
        status: { $in: ["Pending", "Open", "Requested"] } 
      });
      const kbSuccess = await KnowledgeBase.aggregate([ /* your logic */ ]);

  res.json({
    openTickets,
    activeAssets,
    pendingChanges,
    ciHealth: "92%",   // or calculate dynamically
    kbSuccess: "87%"   // or calculate dynamically
  });
  } catch (err) {
    console.error("Dashboard Stats Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Collection level
router.get("/", getAssets);
router.post("/", createAsset);

// Static features
router.get("/license/compliance", getLicenseCompliance);
router.get("/stockroom", getStockroom);
router.get("/dashboard", getAssetDashboard);
router.get("/export/csv", exportCSV);
router.post("/import/csv", importCSV);

// -------------------------------------------------------------
// 2. PARAMETERIZED SUB-RESOURCES (Must precede generic /:id)
// -------------------------------------------------------------


// Workspace (Must come before generic GET /:id so Express routes sub-paths correctly)
router.get("/:assetId/workspace", getWorkspace);
router.get("/:id/timeline", getAssetTimeline);
router.get("/:id/graph", getAssetGraph);
router.get("/:id/report/pdf", generateAssetPDF);
router.get("/:id/qr", getAssetQR);
router.get("/:id/audit", getAssetAudit);
router.get("/:id/risk", getAssetRisk);
router.get("/:id/usage", getAssetUsage);

// -------------------------------------------------------------
// 3. GENERIC PARAMETERIZED CRUD (MUST BE DECLARED LAST)
// -------------------------------------------------------------
router.get("/:id", getAsset); // Corrected to getAsset
router.put("/:id", updateAsset);
router.delete("/:id", deleteAsset);

export default router;
