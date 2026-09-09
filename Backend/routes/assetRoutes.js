// routes/assetRoutes.js
import express from "express";


import * as assetController from "../controllers/assetController.js";
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

import verifyToken from "../middleware/auth.js";

// 1. MUST declare router BEFORE using router.get / router.post
const router = express.Router();

// Apply auth middleware
router.use(verifyToken);

// -------------------------------------------------------------
// 1. STATIC UTILITY ROUTES (MUST COME BEFORE /:id ROUTES)
// -------------------------------------------------------------
router.get("/dashboard", getAssetDashboard);
router.get("/export/csv", exportCSV);
router.post("/import/csv", importCSV);

// Ensure these methods exist in your assetController.js:
if (assetController.getLicenseCompliance) router.get("/license/compliance", assetController.getLicenseCompliance);
if (assetController.getStockroom) router.get("/stockroom", assetController.getStockroom);

// -------------------------------------------------------------
// 2. ROOT COLLECTION ROUTES
// -------------------------------------------------------------
router.get("/", assetController.getAssets);
router.post("/", assetController.createAsset);

// -------------------------------------------------------------
// 3. PARAMETERIZED / DYNAMIC ROUTES (/:id)
// -------------------------------------------------------------
// Sub-resource routes
if (assetController.getWorkspace) router.get("/:assetId/workspace", assetController.getWorkspace);
router.get("/:id/timeline", getAssetTimeline);
router.get("/:id/graph", getAssetGraph);
router.get("/:id/report/pdf", generateAssetPDF);
router.get("/:id/qr", getAssetQR);
router.get("/:id/audit", getAssetAudit);
router.get("/:id/risk", getAssetRisk);
router.get("/:id/usage", getAssetUsage);

// Single asset CRUD
router.get("/:id", assetController.getAssetById);
router.put("/:id", assetController.updateAsset);
router.delete("/:id", assetController.deleteAsset);
if (assetController.restoreAsset) router.post("/:id/restore", assetController.restoreAsset);

export default router;