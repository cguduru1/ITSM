const { connect, clear, close } = require("./setupMongo");
const seedWorkspaceFixture = require("./seedWorkspaceFixture");
const { buildAssetWorkspace } = require("../services/aggregationService");

describe("AggregationService.buildAssetWorkspace", () => {
  beforeAll(async () => {
    await connect();
  });

  afterEach(async () => {
    await clear();
  });

  afterAll(async () => {
    await close();
  });

  test("returns full workspace for valid asset", async () => {
    const assetId = await seedWorkspaceFixture();
    const ws = await buildAssetWorkspace(assetId);

    expect(ws).toBeTruthy();
    expect(ws.asset.assetId).toBe(assetId);
    expect(ws.financial.assetId).toBe(assetId);
    expect(ws.procurement.poNumber).toBe("PO-TEST-001");
    expect(ws.allocations.length).toBe(1);
    expect(ws.audits.length).toBe(1);
  });

  test("returns null for missing asset", async () => {
    const ws = await buildAssetWorkspace("NON_EXISTENT");
    expect(ws).toBeNull();
  });
});
