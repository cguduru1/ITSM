const { connect, clear, close } = require("./setupMongo");
const seed = require("./seedAggregationFixture");
const { buildAssetWorkspace } = require("../services/aggregationService");

describe("aggregationService audits and procurement", () => {
  beforeAll(async () => { await connect(); });
  afterEach(async () => { await clear(); });
  afterAll(async () => { await close(); });

  test("workspace contains audit entries and procurement info", async () => {
    const assetId = await seed();
    const ws = await buildAssetWorkspace(assetId);
    expect(ws).toBeTruthy();
    expect(Array.isArray(ws.audits)).toBe(true);
    expect(ws.audits.length).toBeGreaterThan(0);
    expect(ws.procurement).toBeTruthy();
    expect(ws.procurement.poNumber).toBe("PO-AGG-001");
  });
});
