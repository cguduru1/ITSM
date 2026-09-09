// backend/tests/aiService.test.js
import { connect, clear, close } from "./setupMongo.js";
import seed from "./seedWorkspaceFixture.js";
import * as aiService from "../services/aiService.js";

describe("aiService (ESM)", () => {
  beforeAll(async () => { await connect(); });
  afterEach(async () => { await clear(); });
  afterAll(async () => { await close(); });

  test("extractFeatures returns expected shape", async () => {
    const assetId = await seed();
    const features = await aiService.extractFeatures(assetId);
    expect(features).toBeTruthy();
    expect(features.asset.assetId).toBe(assetId);
  });

  test("summarizeFeatures returns readable summary", async () => {
    const assetId = await seed();
    const features = await aiService.extractFeatures(assetId);
    const summary = aiService.summarizeFeatures(features);
    expect(typeof summary).toBe("string");
    expect(summary.length).toBeGreaterThan(10);
  });

  test("getRecommendations runs without error", async () => {
    await seed();
    const recs = await aiService.getRecommendations(10);
    expect(Array.isArray(recs)).toBe(true);
  });

  test("detectAnomalies returns array", async () => {
    await seed();
    const anomalies = await aiService.detectAnomalies(50);
    expect(Array.isArray(anomalies)).toBe(true);
  });
});
