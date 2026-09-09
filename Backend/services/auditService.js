// backend/services/auditService.js
import AssetAuditHistory from "../models/AssetAuditHistory.js";

/**
 * Standardized internal helper to create audit entries with session support
 */

async function saveAuditEntry(doc) {
  const [createdEntry] = await AssetAuditHistory.create([doc]);
  return createdEntry;
}

/**
 * Create an audit entry for an asset
 */
export async function createAssetAudit({ assetId, actionType, oldValue, newValue, changedBy }) {
  const doc = {
    assetId: assetId || null,
    actionType,
    oldValue: oldValue ?? null,
    newValue: newValue ?? null,
    changedBy: changedBy || "system",
    changedAt: new Date()
  };

  return await saveAuditEntry(doc);
}

/**
 * ✅ FIX: High-performance bulk generation for asset historical changes
 * Safely inserts arrays of audit configurations at once
 */
export async function createAssetAuditBulk(logsArray) {
  if (!Array.isArray(logsArray) || logsArray.length === 0) return [];

  const standardizedDocs = logsArray.map(log => ({
    assetId: log.assetId || null,
    actionType: log.actionType,
    oldValue: log.oldValue ?? null,
    newValue: log.newValue ?? null,
    changedBy: log.changedBy || "system",
    changedAt: new Date()
  }));

  // Perform a single, blazing fast batch database operation
  return await AssetAuditHistory.insertMany(standardizedDocs);
}

/**
 * Generic log entry (PO events, system events)
 */
export async function log(action, payload = {}, actor = "system") {
  let serializedPayload = null;
  
  try {
    serializedPayload = typeof payload === "string" ? payload : JSON.stringify(payload);
  } catch (err) {
    serializedPayload = JSON.stringify({ error: "Failed to serialize audit payload", message: err.message });
  }

  const doc = {
    assetId: payload?.assetId || null,
    actionType: action,
    oldValue: null,
    newValue: serializedPayload,
    changedBy: actor,
    changedAt: new Date()
  };

  return await saveAuditEntry(doc);
}
