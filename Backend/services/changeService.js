// services/changeService.js
import ChangeRequest from "../models/ChangeRequest.js";
import ChangeApproval from "../models/ChangeApproval.js";
import { aiQueue } from "../lib/queue.js";
import Asset from "../models/Asset.js";
import mongoose from "mongoose";
import MaintenanceWindow from "../models/MaintenanceWindow.js";
import ApproverMapping from "../models/ApproverMapping.js";

/**
 * Helper: check blackout windows overlap
 */
export async function checkBlackoutOverlap(start, end) {
  const overlaps = await MaintenanceWindow.findOne({
    isBlackout: true,
    $or: [
      { startTs: { $lt: end, $gte: start } },
      { endTs: { $gt: start, $lte: end } },
      { $and: [{ startTs: { $lte: start } }, { endTs: { $gte: end } }] }
    ]
  }).lean();
  return !!overlaps;
}

/**
 * Helper: collision detection for affected CI array
 * Returns array of conflicting change docs
 */
export async function detectCollisions(changeId, affectedCIs = [], scheduledStart, scheduledEnd) {
  if (!affectedCIs || !affectedCIs.length) return [];

  const conflicts = await ChangeRequest.find({
    _id: changeId
      ? { $ne: mongoose.Types.ObjectId(changeId) }
      : { $exists: true },
    state: { $in: ["Scheduled", "Implement"] },
    affectedCIs: { $in: affectedCIs },
    $expr: {
      $and: [
        { $lt: ["$scheduledStart", scheduledEnd] },
        { $gt: ["$scheduledEnd", scheduledStart] }
      ]
    }
  }).lean();

  return conflicts;
}

/**
 * Helper: lead time verification
 * policy: minLeadDays per change type from DB or fallback
 */
export async function verifyLeadTime(scheduledStart, changeType) {
  const policy = {
    Normal: 3,
    Standard: 1,
    Minor: 0,
    Emergency: 0
  };
  const minDays = policy[changeType] ?? 3;
  const minDate = new Date(Date.now() + minDays * 24 * 60 * 60 * 1000);
  return scheduledStart >= minDate;
}

/**
 * Helper: map approvers based on change type/category
 * ApproverMapping model schema:
 * { changeType: String, category: String, requiredGroup: String, minApprovals: Number }
 */
export async function mapApprovers(changeDoc) {
  const mappings = await ApproverMapping.find({
    $or: [{ changeType: changeDoc.type }, { category: changeDoc.category }]
  }).lean();

  const groups = {};
  mappings.forEach(m => {
    const key = m.requiredGroup;
    if (!groups[key]) {
      groups[key] = { required: m.minApprovals || 1 };
    } else {
      groups[key].required = Math.max(groups[key].required, m.minApprovals || 1);
    }
  });

  const approvals = Object.keys(groups).map(g => ({
    changeId: changeDoc._id,
    approverGroup: g,
    decision: "Pending",
    comment: "",
    metadata: { required: groups[g].required },
    createdAt: new Date()
  }));

  if (approvals.length) {
    await ChangeApproval.insertMany(approvals);
  }

  return Object.keys(groups).map(g => ({
    approverGroup: g,
    required: groups[g].required
  }));
}

/**
 * Create a new Change Request
 */
export async function createChange(payload, user) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const scheduledStart = payload.scheduledStart
      ? new Date(payload.scheduledStart)
      : null;
    const scheduledEnd = payload.scheduledEnd
      ? new Date(payload.scheduledEnd)
      : null;

    if (scheduledStart && scheduledEnd && scheduledEnd <= scheduledStart) {
      throw new Error("scheduledEnd must be after scheduledStart");
    }

    if (scheduledStart && scheduledEnd && !payload.emergency) {
      const blackout = await checkBlackoutOverlap(
        scheduledStart,
        scheduledEnd
      );
      if (blackout) {
        throw new Error("Scheduled window overlaps a blackout window");
      }
    }

    if (
      scheduledStart &&
      !(await verifyLeadTime(scheduledStart, payload.type))
    ) {
      throw new Error(
        "Scheduled start violates lead time policy for this change type"
      );
    }

    let snapshot = [];
    if (Array.isArray(payload.affectedCIs) && payload.affectedCIs.length) {
      const cis = await Asset.find(
        { _id: { $in: payload.affectedCIs } },
        "name type tags configHash owner"
      ).lean();

      if (cis.length !== payload.affectedCIs.length) {
        throw new Error("One or more affected CIs not found");
      }

      snapshot = cis.map(c => ({
        id: c._id,
        name: c.name,
        type: c.type,
        tags: c.tags,
        configHash: c.configHash
      }));
      payload.affectedCISnapshot = snapshot;
    }

    if (
      scheduledStart &&
      scheduledEnd &&
      payload.affectedCIs &&
      payload.affectedCIs.length
    ) {
      const conflicts = await detectCollisions(
        null,
        payload.affectedCIs,
        scheduledStart,
        scheduledEnd
      );
      if (conflicts && conflicts.length) {
        await session.abortTransaction();
        session.endSession();
        return { error: "collision", conflicts };
      }
    }

    payload.requestedBy = user?._id || user?.id || new mongoose.Types.ObjectId();

    const [created] = await ChangeRequest.create([payload], { session });

    const staticScore = await ChangeRequest.computeStaticRisk(created, Asset);
    created.riskScore = staticScore;
    created.riskLevel =
      created.riskLevel ||
      (staticScore >= 81
        ? "Critical"
        : staticScore >= 51
        ? "High"
        : staticScore >= 21
        ? "Medium"
        : "Low");

    await created.save({ session });

    const approverSummary = await mapApprovers(created);

    await aiQueue.add("ai-risk", { changeId: created._id.toString() });

    await session.commitTransaction();
    session.endSession();

    return { change: created.toObject(), approverSummary };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}

/**
 * Update change
 * - supports partial updates
 * - re-check collisions and blackout if scheduling changed
 * - re-enqueue AI scoring if text fields changed
 */
export async function updateChange(changeId, updates, user) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const change = await ChangeRequest.findById(changeId).session(session);
    if (!change) throw new Error("Change not found");

    const prevScheduledStart = change.scheduledStart;
    const prevScheduledEnd = change.scheduledEnd;
    const prevAffected = (change.affectedCIs || []).map(String);

    Object.assign(change, updates);

    if (change.scheduledStart && change.scheduledEnd && !change.emergency) {
      const blackout = await checkBlackoutOverlap(
        change.scheduledStart,
        change.scheduledEnd
      );
      if (blackout) {
        throw new Error("Scheduled window overlaps a blackout window");
      }

      if (!(await verifyLeadTime(change.scheduledStart, change.type))) {
        throw new Error(
          "Scheduled start violates lead time policy for this change type"
        );
      }
    }

    const newAffected = (change.affectedCIs || []).map(String);
    const affectedChanged =
      JSON.stringify(prevAffected.sort()) !==
      JSON.stringify(newAffected.sort());
    const scheduleChanged =
      String(prevScheduledStart) !== String(change.scheduledStart) ||
      String(prevScheduledEnd) !== String(change.scheduledEnd);

    if (
      (affectedChanged || scheduleChanged) &&
      change.scheduledStart &&
      change.scheduledEnd
    ) {
      const conflicts = await detectCollisions(
        change._id,
        change.affectedCIs,
        change.scheduledStart,
        change.scheduledEnd
      );
      if (conflicts && conflicts.length) {
        await session.abortTransaction();
        session.endSession();
        return { error: "collision", conflicts };
      }
    }

    if (affectedChanged && change.affectedCIs && change.affectedCIs.length) {
      const cis = await Asset.find(
        { _id: { $in: change.affectedCIs } },
        "name type tags configHash owner"
      ).lean();

      change.affectedCISnapshot = cis.map(c => ({
        id: c._id,
        name: c.name,
        type: c.type,
        tags: c.tags,
        configHash: c.configHash
      }));
    }

    const textFields = ["title", "description", "backoutPlan"];
    const textChanged = textFields.some(
      f => updates[f] !== undefined && updates[f] !== null
    );

    await change.save({ session });

    if (textChanged) {
      await aiQueue.add("ai-risk", { changeId: change._id.toString() });
    }

    await session.commitTransaction();
    session.endSession();

    return { change: change.toObject() };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}

/**
 * Transition change state with approvals check
 * approvalsRequiredChecker: (changeDoc, fromState, toState, session) => boolean
 */
export async function transitionChange(
  changeId,
  toState,
  actorId,
  reason,
  approvalsRequiredChecker
) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const change = await ChangeRequest.findById(changeId).session(session);
    if (!change) throw new Error("Change not found");

    await change.transitionTo(
      toState,
      actorId,
      reason,
      session,
      approvalsRequiredChecker
    );

    await session.commitTransaction();
    session.endSession();

    return change.toObject();
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}

export default {
  createChange,
  updateChange,
  transitionChange,
  detectCollisions,
  checkBlackoutOverlap,
  mapApprovers,
  verifyLeadTime
};
