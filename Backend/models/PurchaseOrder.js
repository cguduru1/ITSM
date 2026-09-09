// models/PurchaseOrder.js
import mongoose from "mongoose";
import softDeletePlugin from "../lib/plugins/softDelete.js";
import { attachAuditHooks } from "../lib/middleware/auditMiddleware.js";

const { Schema } = mongoose;

const PurchaseOrderItemSchema = new Schema({
  modelId: { type: String, ref: "ProductCatalog", trim: true },
  description: { type: String },
  assetName: { type: String, trim: true },
  quantity: { type: Number, default: 1, min: 1 },
  unitCost: { type: Number, default: 0, min: 0 },
  warrantyMonths: { type: Number, default: 12 }
}, { _id: false });

const PurchaseOrderSchema = new Schema({
  // Removed `unique: true` from property definition
  poNumber: { type: String, required: true, trim: true },
  vendorId: { type: String, index: true, trim: true },
  requestedBy: { type: String, trim: true },
  invoiceNumber: { type: String, trim: true },
  receivingLocation: { type: String, trim: true },
  items: { type: [PurchaseOrderItemSchema], default: [] },
  status: { type: String, default: "Requested", trim: true }, // Requested, Approved, Ordered, Received, Cancelled
  receivedAt: { type: Date, default: null },
  totalCost: { type: Number, default: 0 },
}, { timestamps: true });

// Useful indexes (Explicitly handle uniqueness here)
PurchaseOrderSchema.index({ poNumber: 1 }, { unique: true });
PurchaseOrderSchema.index({ status: 1 });
PurchaseOrderSchema.index({ vendorId: 1, status: 1, createdAt: -1 });

// Soft delete plugin
PurchaseOrderSchema.plugin(softDeletePlugin);

// Attach audit hooks if you use audit middleware
attachAuditHooks(PurchaseOrderSchema);

// Example pre-save validation
PurchaseOrderSchema.pre("save", async function () {
  // Example: Auto-generating total or checking status
  if (this.items && this.items.length > 0) {
    this.totalCost = this.items.reduce((acc, item) => {
      return acc + ((item.quantity || 0) * (item.unitCost || 0));
    }, 0);
  }
  // Do NOT call next() here — returning/resolving the promise is enough!
});



// Guarded model export
const PurchaseOrder = mongoose.models?.PurchaseOrder || mongoose.model("PurchaseOrder", PurchaseOrderSchema);
export default PurchaseOrder;
