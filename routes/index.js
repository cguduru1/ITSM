import express from "express";
import productCatalog from "./productCatalog.js";
import assetMaster from "./assetMaster.js";
import financialLifecycle from "./financialLifecycle.js";
import softwareLicense from "./softwareLicense.js";
import softwareAllocation from "./softwareAllocation.js";
import purchaseOrder from "./purchaseOrder.js";
import assetAudit from "./assetAudit.js";
import aggregations from "./aggregations.js";

const router = express.Router();

router.use("/product-catalog", productCatalog);
router.use("/assets", assetMaster);
router.use("/financial", financialLifecycle);
router.use("/licenses", softwareLicense);
router.use("/allocations", softwareAllocation);
router.use("/purchase-orders", purchaseOrder);
router.use("/audits", assetAudit);
router.use("/aggregations", aggregations);

export default router;
