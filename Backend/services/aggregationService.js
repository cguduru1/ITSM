// backend/services/aggregationService.js
import mongoose from "mongoose";
import AssetMaster from "../models/AssetMaster.js";
import FinancialLifecycle from "../models/FinancialLifecycle.js";
import SoftwareAllocation from "../models/SoftwareAllocation.js";
import PurchaseOrder from "../models/PurchaseOrder.js";
import AssetAuditHistory from "../models/AssetAuditHistory.js";

/**
 * Returns a consolidated workspace object:
 * { asset, financial, allocations, audits, procurement }
 */
export async function buildAssetWorkspace(assetId) {
  // Check if assetId is a valid Mongo ObjectId string
  const isValidObjectId = mongoose.Types.ObjectId.isValid(assetId);

  // Build match query to support both custom assetId strings and Mongo _id
  const matchCriteria = isValidObjectId
    ? {
        $or: [
          { assetId: assetId },
          { _id: new mongoose.Types.ObjectId(assetId) },
        ],
      }
    : { assetId: assetId };

  // Use aggregation to fetch asset and lookups
  const pipeline = [
    { $match: matchCriteria },

    // Lookup financial lifecycle
    {
      $lookup: {
        from: FinancialLifecycle.collection.name,
        localField: "assetId",
        foreignField: "assetId",
        as: "financials",
      },
    },
    // Lookup software allocations
    {
      $lookup: {
        from: SoftwareAllocation.collection.name,
        localField: "assetId",
        foreignField: "assetId",
        as: "allocations",
      },
    },
    // Lookup audit history
    {
      $lookup: {
        from: AssetAuditHistory.collection.name,
        localField: "assetId",
        foreignField: "assetId",
        as: "audits",
      },
    },
    // lookup procurement (PO) by poNumber stored in financials[0].poNumber
    {
      $addFields: {
        primaryFinancial: { $arrayElemAt: ["$financials", 0] },
      },
    },
    // Lookup purchase order details
    {
      $lookup: {
        from: PurchaseOrder.collection.name,
        let: { poNumber: "$primaryFinancial.poNumber" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $ne: ["$$poNumber", null] },
                  { $eq: ["$poNumber", "$$poNumber"] },
                ],
              },
            },
          },
          {
            $project: {
              poNumber: 1,
              vendorId: 1,
              items: 1,
              status: 1,
              receivedAt: 1,
            },
          },
        ],
        as: "procurement",
      },
    },
    {
      $addFields: {
        procurement: { $arrayElemAt: ["$procurement", 0] },
      },
    },
    {
      $project: {
        _id: 1,
        asset: "$$ROOT",
      },
    },
  ];

  const result = await AssetMaster.aggregate(pipeline).exec();
  if (!result || !result.length) return null;

  const root = result[0].asset;

  // Build final shape
  const financial = (root.financials && root.financials[0]) || null;
  const allocations = root.allocations || [];
  const audits = (root.audits || []).sort(
    (a, b) => new Date(b.changedAt || b.createdAt) - new Date(a.changedAt || a.createdAt)
  );
  const procurement = root.procurement || null;

  // Clean asset object: remove lookups arrays
  delete root.financials;
  delete root.allocations;
  delete root.audits;
  delete root.procurement;
  delete root.primaryFinancial;

  return {
    asset: root,
    financial,
    allocations,
    audits,
    procurement
  };
}
