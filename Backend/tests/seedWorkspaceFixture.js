const AssetMaster = require("../models/AssetMaster");
const FinancialLifecycle = require("../models/FinancialLifecycle");
const SoftwareAllocation = require("../models/SoftwareAllocation");
const PurchaseOrder = require("../models/PurchaseOrder");
const AssetAuditHistory = require("../models/AssetAuditHistory");

module.exports = async function seedWorkspaceFixture() {
  const assetId = "ASSET-TEST-001";

  await AssetMaster.create({
    assetId,
    assetTag: "TAG-TEST-001",
    assetName: "Test Laptop",
    modelId: "MODEL-TEST",
    serialNumber: "SN-123",
    description: "",
    status: "In-Stock",
    locationId: "LOC-1"
  });

  await FinancialLifecycle.create({
    financialId: "FIN-TEST-001",
    assetId,
    poNumber: "PO-TEST-001",
    purchaseDate: new Date(),
    purchaseCost: 50000,
    residualValue: 5000,
    depreciationMethod: "Straight-Line",
    currentBookValue: 45000
  });

  await PurchaseOrder.create({
    poNumber: "PO-TEST-001",
    vendorId: "Vendor-XYZ",
    items: [{ modelId: "MODEL-TEST", quantity: 1, unitCost: 50000 }],
    status: "Received"
  });

  await SoftwareAllocation.create({
    allocationId: "ALLOC-TEST-001",
    assetId,
    licenseId: "LIC-TEST-001",
    licenseName: "Office 365",
    assignedTo: "user@example.com",
    assignedAt: new Date()
  });

  await AssetAuditHistory.create({
    assetId,
    actionType: "CREATE",
    newValue: "Asset created",
    changedBy: "system",
    changedAt: new Date()
  });

  return assetId;
};
