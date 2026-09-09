const AssetMaster = require("../models/AssetMaster");
const FinancialLifecycle = require("../models/FinancialLifecycle");
const SoftwareAllocation = require("../models/SoftwareAllocation");
const PurchaseOrder = require("../models/PurchaseOrder");
const AssetAuditHistory = require("../models/AssetAuditHistory");

module.exports = async function seedAggregationFixture() {
  const assetId = "ASSET-AGG-001";

  await AssetMaster.create({
    assetId,
    assetTag: "TAG-AGG-001",
    assetName: "Aggregation Test Device",
    modelId: "MODEL-AGG",
    description: "",
    serialNumber: "SN-AGG-001",
    status: "In-Stock",
    locationId: "LOC-AGG"
  });

  await FinancialLifecycle.create({
    financialId: "FIN-AGG-001",
    assetId,
    poNumber: "PO-AGG-001",
    purchaseDate: new Date(),
    purchaseCost: 120000,
    residualValue: 12000,
    depreciationMethod: "Straight-Line",
    currentBookValue: 108000
  });

  await PurchaseOrder.create({
    poNumber: "PO-AGG-001",
    vendorId: "Vendor-AGG",
    items: [{ modelId: "MODEL-AGG", quantity: 1, unitCost: 120000 }],
    status: "Received"
  });

  await SoftwareAllocation.create({
    allocationId: "ALLOC-AGG-001",
    assetId,
    licenseId: "LIC-AGG-001",
    licenseName: "Test License",
    assignedTo: "agguser@example.com",
    assignedAt: new Date()
  });

  await AssetAuditHistory.create({
    assetId,
    actionType: "CREATE",
    newValue: "Created for aggregation test",
    changedBy: "test",
    changedAt: new Date()
  });

  return assetId;
};
