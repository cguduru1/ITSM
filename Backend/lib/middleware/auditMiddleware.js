
// lib/middleware/auditMiddleware.js
import AuditLog from "../../models/AuditLog.js";
import { getUser } from "../context/asyncLocalUser.js";

export function attachAuditHooks(schema) {
  // 1. findOneAndUpdate pre-hook
  schema.pre("findOneAndUpdate", async function () {
    const doc = await this.model.findOne(this.getQuery()).lean();
    this._original = doc || null;
  });

  // 2. findOneAndUpdate post-hook
  schema.post("findOneAndUpdate", async function (res) {
    try {
      const before = this._original || null;
      const after = res ? (typeof res.toObject === "function"
        ? res.toObject({ depopulate: true })
        : res) : null;
      const user = (this.getOptions?._auditUser) || getUser() || null;

      await AuditLog.create({
        collectionName: this.model.modelName,
        documentId: after?._id || before?._id || null,
        operation: "update",
        user,
        before,
        after,
        timestamp: new Date()
      });
    } catch (err) {
      console.error("Audit log error (findOneAndUpdate):", err);
    }
  });

  // 3. Save pre-hook
  schema.pre("save", function () {
    if (!this.isNew) {
      this._original = this._original || null;
    }
  });

  // 4. Save post-hook
  schema.post("save", async function (doc) {
    try {
      const isNew = doc.isNew;
      const before = doc._original || null;
      const after = doc.toObject({ depopulate: true });
      const collectionName = doc.constructor.modelName || this.modelName || "Unknown";

      await AuditLog.create({
        collectionName,
        documentId: doc._id,
        operation: isNew ? "create" : "update",
        user: doc._auditUser || getUser() || null,
        before,
        after,
        timestamp: new Date()
      });
    } catch (err) {
      console.error("Audit log error (save):", err);
    }
  });

  // 5. Delete hook
  schema.pre("deleteOne", { document: true, query: false }, async function () {
    try {
      await AuditLog.create({
        collectionName: this.constructor.modelName || "Unknown",
        documentId: this._id,
        operation: "delete",
        user: this._auditUser || getUser() || null,
        before: this.toObject({ depopulate: true }),
        after: null,
        timestamp: new Date()
      });
    } catch (err) {
      console.error("Audit log error (deleteOne):", err);
    }
  });
}