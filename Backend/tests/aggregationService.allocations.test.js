const { connect, clear, close } = require("./setupMongo");
const seed = require("./seedAggregationFixture");
const { buildAssetWorkspace } = require("../services/aggregationService");

describe("aggregationService allocations", () => {
  beforeAll(async () => { await connect(); });
  afterEach(async () => { await clear(); });
  afterAll(async () => { await close(); });

  test("workspace contains allocations", async () => {
    const assetId = await seed();
    const ws = await buildAssetWorkspace(assetId);
    expect(ws).toBeTruthy();
    expect(Array.isArray(ws.allocations)).toBe(true);
    expect(ws.allocations.length).toBeGreaterThan(0);
    expect(ws.allocations[0].licenseId).toBe("LIC-AGG-001");
  });
});
