// backend/controllers/purchaseOrderController.js
import * as purchaseOrderService from "../services/purchaseOrderService.js";

export async function createPO(req, res) {
  try {
    const po = await purchaseOrderService.createPO(req.body, req.user?.id);
    return res.status(201).json(po);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

export async function approvePO(req, res) {
  try {
    const po = await purchaseOrderService.approvePO(req.params.poNumber, req.user?.id);
    return res.json(po);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

/**
 * Receive PO endpoint
 * - Validates PO exists and is in a receivable state
 * - Creates AssetMaster rows for each item quantity
 * - Creates FinancialLifecycle records for each created asset
 * - Writes audit entries
 * - Runs inside a MongoDB transaction (if supported)
 */
export async function receivePO(req, res) {
  try {
    const result = await purchaseOrderService.receivePO(req.params.poNumber, req.user?.id);
    return res.json(result);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}
