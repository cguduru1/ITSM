// backend/tests/purchaseOrder.receive.test.js
const request = require("supertest");
const mongoose = require("mongoose");
const { connect, clearDatabase } = require("./setupMongo");
const PurchaseOrder = require("../models/PurchaseOrder").default || require("../models/PurchaseOrder");
const AssetMaster = require("../models/AssetMaster").default || require("../models/AssetMaster");
const FinancialLifecycle = require("../models/FinancialLifecycle").default || require("../models/FinancialLifecycle");

const request = require("supertest");
const mongoose = require("mongoose");
const { connect, clearDatabase } = require("./setupMongo");
const PurchaseOrder = require("../models/PurchaseOrder");
const AssetMaster = require("../models/AssetMaster");
const FinancialLifecycle = require("../models/FinancialLifecycle");
const app = require("../server"); // ensure server exports app (CommonJS)


// Import your Express app (ensure backend/server.js exports `app`)
const app = require("../server").default || require("../server");

beforeAll(async () => {
  await connect();
});

afterEach(async () => {
  await clearDatabase();
  jest.restoreAllMocks();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoose.connection.close();
});

describe("POST /api/purchase-orders/:poNumber/receive", () => {
  test("successfully receives PO and creates assets + financial records", async () => {
    // Create a PO
    const poPayload = {
      poNumber: "PO-TEST-001",
      vendorId: "Vendor-1",
      requestedBy: "user-1",
      items: [
        { modelId: "MODEL-1", quantity: 2, unitCost: 1000 }
      ]
    };
    await request(app).post("/api/purchase-orders").send(poPayload).expect(201);

    // Call receive endpoint
    const res = await request(app).post(`/api/purchase-orders/${poPayload.poNumber}/receive`).send().expect(200);

    expect(res.body).toHaveProperty("po");
    expect(res.body).toHaveProperty("createdAssets");
    expect(Array.isArray(res.body.createdAssets)).toBe(true);
    expect(res.body.createdAssets.length).toBe(2);

    // Verify DB records
    const assets = await AssetMaster.find({}).lean();
    expect(assets.length).toBe(2);

    const financials = await FinancialLifecycle.find({}).lean();
    expect(financials.length).toBe(2);

    // PO status updated
    const po = await PurchaseOrder.findOne({ poNumber: poPayload.poNumber }).lean();
    expect(po.status).toBe("Received");
  });

  test("transaction rollback on financial create error (no assets persisted, PO not marked Received)", async () => {
    // Create a PO
    const poPayload = {
      poNumber: "PO-TEST-002",
      vendorId: "Vendor-2",
      requestedBy: "user-2",
      items: [
        { modelId: "MODEL-2", quantity: 1, unitCost: 500 }
      ]
    };
    await request(app).post("/api/purchase-orders").send(poPayload).expect(201);

    // Force FinancialLifecycle.create to throw to simulate DB error
    const originalCreate = FinancialLifecycle.create;
    jest.spyOn(FinancialLifecycle, "create").mockImplementation(() => {
      throw new Error("Simulated DB failure during financial create");
    });

    // Call receive endpoint - expect failure
    const res = await request(app).post(`/api/purchase-orders/${poPayload.poNumber}/receive`).send().expect(400);
    expect(res.body).toHaveProperty("error");

    // Ensure no assets were persisted
    const assets = await AssetMaster.find({}).lean();
    expect(assets.length).toBe(0);

    // Ensure no financial records
    const financials = await FinancialLifecycle.find({}).lean();
    expect(financials.length).toBe(0);

    // PO should remain not Received
    const po = await PurchaseOrder.findOne({ poNumber: poPayload.poNumber }).lean();
    expect(po.status).not.toBe("Received");

    // restore original
    FinancialLifecycle.create = originalCreate;
  });
});
