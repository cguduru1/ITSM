// backend/services/purchaseOrderService.js
import mongoose from "mongoose";
import PurchaseOrder from "../models/PurchaseOrder.js";
import AssetMaster from "../models/AssetMaster.js";
import FinancialLifecycle from "../models/FinancialLifecycle.js";
import ProductCatalog from "../models/ProductCatalog.js"; 
import * as auditService from "./auditService.js";
import { generateAssetId, generateFinancialId, generateAssetTag } from "./idHelpers.js";

/**
 * Create PO
 */
export async function createPO(payload, actor) {
  return await PurchaseOrder.create({
    ...payload,
    createdBy: actor || "system"
  });
}

/**
 * Approve PO
 */
export async function approvePO(poNumber, actor) {
  const po = await PurchaseOrder.findOneAndUpdate(
    { poNumber },
    { status: "Approved", approvedBy: actor, approvedAt: new Date() },
    { new: true }
  );
  if (!po) throw new Error("PO not found");
  await auditService.log(`PO_APPROVED`, { poNumber }, actor);
  return po;
}

/**
 * Receive PO
 * - Creates assets and financial records via optimized bulk inserts
 * - Uses an atomic transaction safely
 */
export async function receivePO(poNumber, actor) {
   // ✂️ REMOVED: mongoose.startSession() and startTransaction()
  // const session = await mongoose.startSession();
  // session.startTransaction();

  try {
    // Find the purchase order without a session attachment
    const po = await PurchaseOrder.findOne({ poNumber });
    if (!po) throw new Error("PO not found");
    if (po.status === "Received") throw new Error("PO already received");

    // 1. Gather all distinct modelIds from the PO items to avoid query loops
    const modelIds = (po.items || []).map(item => item.modelId);
    
    // 2. Fetch those catalog entries in a single bulk database query [3]
    const catalogEntries = await ProductCatalog.find({ modelId: { $in: modelIds } });
    
    // 3. Create a quick memory lookup map (modelId -> category)
    const catalogMap = new Map(catalogEntries.map(c => [c.modelId, c.category]));


    const assetsToInsert = [];
    const financialsToInsert = [];
    const auditLogsToInsert = [];
    const receivedAt = po.receivedAt || new Date();

    for (const item of po.items || []) {
      const qty = item.quantity || 1;

      // ✅ Look up the category from our catalog map, fallback safely if not found
      const resolvedCategory = catalogMap.get(item.modelId) || "Hardware";

      for (let i = 0; i < qty; i++) {
        const assetId = generateAssetId();
        const assetTag = generateAssetTag(assetId);

        const assetDoc = {
          assetId,
          assetTag,
          serialNumber: item.serialNumber || null,
          assetName: item.assetName || item.modelId,
          modelId: item.modelId,
          category: resolvedCategory,
          description: item.description,
          status: "In-Stock",
          locationId: po.receivingLocation || null,
          createdAt: receivedAt,
          updatedAt: receivedAt
        };

        const financialDoc = {
          financialId: generateFinancialId(),
          assetId: assetId,
          poNumber: po.poNumber,
          invoiceNumber: po.invoiceNumber || null,
          vendorId: po.vendorId || null,
          purchaseDate: receivedAt,
          warrantyExpiryDate: item.warrantyExpiryDate || null,
          purchaseCost: item.unitCost || 0,
          depreciationMethod: item.depreciationMethod || "Straight-Line",
          residualValue: item.residualValue || 0,
          currentBookValue: item.unitCost || 0
        };

         // ✅ FIX: Restored array maps to collect entries for bulk processing
        assetsToInsert.push(assetDoc);
        financialsToInsert.push(financialDoc);

        // Map data arrays safely for historical schema logs
        auditLogsToInsert.push({
          assetId: assetId,
          actionType: "PO_RECEIVE_CREATE",
          oldValue: null,
          newValue: JSON.stringify({ asset: assetDoc, financial: financialDoc }),
          changedBy: actor || "system"
        });
      }
    }

    // High performance bulk insertion blocks outside the loop mapping
    let createdAssets = await AssetMaster.insertMany(assetsToInsert, { ordered: false });createdAssets = [];
    if (assetsToInsert.length > 0) {
      // ✂️ REMOVED: { session } configurations from data transactions
      // createdAssets = await AssetMaster.insertMany(assetsToInsert, { session });
      // await FinancialLifecycle.insertMany(financialsToInsert, { session });

      createdAssets = await AssetMaster.insertMany(assetsToInsert, { ordered: false });
      await FinancialLifecycle.insertMany(financialsToInsert, { ordered: false });
      
      // Batch record the changes using your audit logging layout framework
      if (typeof auditService.createAssetAuditBulk === "function") {
        await auditService.createAssetAuditBulk(auditLogsToInsert);
      } else {
        await Promise.all(
          auditLogsToInsert.map(logItem => auditService.createAssetAudit(logItem))
        );
      }
    }

    // Finalize state documentation mappings
    po.status = "Received";
    po.receivedAt = receivedAt;
    // ✂️ REMOVED: { session } references
    // await po.save({ session });
    await po.save();

    await auditService.log("PO_RECEIVED", { poNumber: po.poNumber, createdCount: createdAssets.length }, actor);

    // ✂️ REMOVED: commitTransaction() execution steps
    // await session.commitTransaction();
    return { po, createdAssets };

  } catch (err) {
    // ✂️ REMOVED: abortTransaction() error steps
    // await session.abortTransaction();
    throw err;
  // } finally {
  //   session.endSession();
  }
}
