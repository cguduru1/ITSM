// ./scripts/e2eChangeLifecycleTest.js
// ESM End‑to‑End Test Script for Change Management Lifecycle
// Run with: node --experimental-fetch ./scripts/e2eChangeLifecycleTest.js

import mongoose from "mongoose";
import ChangeRequest from "../models/ChangeRequest.js";
import ChangeApproval from "../models/ChangeApproval.js";
import ApproverMapping from "../models/ApproverMapping.js";
import Asset from "../models/Asset.js";
import UserRole from "../models/UserRole.js";
import Role from "../models/Role.js";
import { aiQueue } from "../lib/queue.js";
import "../workers/aiRiskWorker.js"; // start worker automatically

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/itsm";

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI);

  console.log("Clearing old test data...");
  await ChangeRequest.deleteMany({});
  await ChangeApproval.deleteMany({});
  await ApproverMapping.deleteMany({});
  await Role.deleteMany({});
  await UserRole.deleteMany({});

  // ---------------------------------------------------------
  // 1. Seed Approver Mappings
  // ---------------------------------------------------------
  console.log("Seeding approver mappings...");
  await ApproverMapping.insertMany([
    { changeType: "Database", requiredGroup: "DBA", minApprovals: 1 },
    { changeType: "Database", requiredGroup: "SRE", minApprovals: 1 },
    { changeType: "Network", requiredGroup: "NetworkOps", minApprovals: 1 },
    { changeType: "Emergency", requiredGroup: "PostIncidentReview", minApprovals: 1 }
  ]);

  // ---------------------------------------------------------
  // 2. Create Roles and Assign to Users
  // ---------------------------------------------------------
  console.log("Creating roles...");
  const changeManagerRole = await Role.create({
    name: "ChangeManager",
    permissions: [
      { resource: "change_request", actions: ["create", "read", "update"] }
    ]
  });

  const approverRole = await Role.create({
    name: "Approver",
    permissions: [
      { resource: "change_request", actions: ["read", "update"] }
    ]
  });

  // Fake users
  const userId = new mongoose.Types.ObjectId(); // requester
  const dbaUserId = new mongoose.Types.ObjectId(); // DBA approver
  const sreUserId = new mongoose.Types.ObjectId(); // SRE approver

  console.log("Assigning roles...");
  await UserRole.create({ userId, roleId: changeManagerRole._id });
  await UserRole.create({ userId: dbaUserId, roleId: approverRole._id });
  await UserRole.create({ userId: sreUserId, roleId: approverRole._id });

  // ---------------------------------------------------------
  // 3. Create a fake Asset (CI)
  // ---------------------------------------------------------
  console.log("Creating test asset...");
  const asset = await Asset.create({
    name: "prod-db-01",
    type: "database",
    tags: ["production"],
    configHash: "abc123"
  });

  // ---------------------------------------------------------
  // 4. Create Change Request
  // ---------------------------------------------------------
  console.log("Creating change request...");
  const change = await ChangeRequest.create({
    title: "Upgrade Production Database",
    description: "Upgrade PostgreSQL version on prod-db-01",
    type: "Database",
    category: "Database",
    requestedBy: userId,
    affectedCIs: [asset._id],
    backoutPlan: "Rollback to snapshot",
    scheduledStart: new Date(Date.now() + 86400000), // +1 day
    scheduledEnd: new Date(Date.now() + 90000000)
  });

  console.log("Change created:", change._id.toString());

  // ---------------------------------------------------------
  // 5. Map Approvers (DBA + SRE)
  // ---------------------------------------------------------
  console.log("Mapping approvers...");
  const mappings = await ApproverMapping.find({ changeType: "Database" }).lean();

  for (const m of mappings) {
    await ChangeApproval.create({
      changeId: change._id,
      approverGroup: m.requiredGroup,
      decision: "Pending"
    });
  }

  console.log("Approvers mapped:", mappings.map(m => m.requiredGroup));

  // ---------------------------------------------------------
  // 6. Simulate Approvals
  // ---------------------------------------------------------
  console.log("Simulating DBA approval...");
  await ChangeApproval.create({
    changeId: change._id,
    approverGroup: "DBA",
    approverId: dbaUserId,
    decision: "Approved"
  });

  console.log("Simulating SRE approval...");
  await ChangeApproval.create({
    changeId: change._id,
    approverGroup: "SRE",
    approverId: sreUserId,
    decision: "Approved"
  });

  // ---------------------------------------------------------
  // 7. Transition Change Through Lifecycle
  // ---------------------------------------------------------
  console.log("Transition: New → Assess");
  await ChangeRequest.findByIdAndUpdate(change._id, { state: "Assess" });

  console.log("Transition: Assess → Authorize");
  await ChangeRequest.findByIdAndUpdate(change._id, { state: "Authorize" });

  console.log("Transition: Authorize → Scheduled");
  await ChangeRequest.findByIdAndUpdate(change._id, { state: "Scheduled" });

  console.log("Transition: Scheduled → Implement");
  await ChangeRequest.findByIdAndUpdate(change._id, { state: "Implement" });

  console.log("Transition: Implement → Review");
  await ChangeRequest.findByIdAndUpdate(change._id, { state: "Review" });

  console.log("Transition: Review → Closed");
  await ChangeRequest.findByIdAndUpdate(change._id, { state: "Closed" });

  // ---------------------------------------------------------
  // 8. Trigger AI Risk Worker
  // ---------------------------------------------------------
  console.log("Triggering AI risk worker...");
  await aiQueue.add("ai-risk", { changeId: change._id.toString() });

  console.log("Waiting for AI worker...");
  await sleep(3000);

  const updated = await ChangeRequest.findById(change._id).lean();
  console.log("Final Risk Score:", updated.riskScore);
  console.log("Risk Level:", updated.riskLevel);
  console.log("Risk Evidence:", updated.riskEvidence);

  // ---------------------------------------------------------
  // Done
  // ---------------------------------------------------------
  console.log("E2E test completed successfully.");
  await mongoose.disconnect();
}

main().catch(err => {
  console.error("E2E test failed:", err);
  process.exit(1);
});
