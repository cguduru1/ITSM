import express from "express";
import mongoose from "mongoose"; 
import PurchaseOrder from "../models/PurchaseOrder.js";
import AssetMaster from "../models/AssetMaster.js";
import FinancialLifecycle from "../models/FinancialLifecycle.js";
// import * as controller from "../controllers/purchaseOrderController.js";

const router = express.Router();

// Helper to safely escape user input for regular expressions
const escapeRegex = (string) => string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');

// List purchase orders
router.get("/", async (req, res) => {
  try {
    const orders = await PurchaseOrder.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve purchase orders" });
  }
});

// GET single PO by _id or poNumber
router.get("/:id", async (req, res) => {
  try {
    const rawId = req.params.id;
    const decodedId = decodeURIComponent(rawId).trim();
    const safeRegex = escapeRegex(decodedId);

    let po = await PurchaseOrder.findOne({
      $or: [
        { poNumber: rawId },
        { poNumber: decodedId },
        { poNumber: { $regex: new RegExp(`^${safeRegex}$`, "i") } }
      ]
    });

    if (!po && decodedId.match(/^[0-9a-fA-F]{24}$/)) {
      po = await PurchaseOrder.findById(decodedId);
    }

    if (!po) {
      return res.status(404).json({ message: `Purchase Order '${decodedId}' not found` });
    }

    return res.json(po);
  } catch (err) {
    console.error("Error fetching PO:", err);
    return res.status(500).json({ message: err.message });
  }
});

// Create PO
router.post("/", async (req, res) => {
  try {
    const po = await PurchaseOrder.create(req.body);
    res.status(201).json(po);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Approve PO
router.post("/:poNumber/approve", async (req, res) => {
  try {
    const rawPoNumber = req.params.poNumber;
    const decodedPoNumber = decodeURIComponent(rawPoNumber).trim();

    const po = await PurchaseOrder.findOneAndUpdate(
      { 
        $or: [
          { poNumber: rawPoNumber },
          { poNumber: decodedPoNumber }
        ]
      }, 
      { status: "Approved" }, 
      { new: true }
    );

    if (!po) return res.status(404).json({ error: "PO not found" });
    res.json(po);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Receive PO: Atomically create assets and financial records
router.post("/:poNumber/receive", async (req, res) => {
  const rawPoNumber = req.params.poNumber;
  const decodedPoNumber = decodeURIComponent(rawPoNumber).trim();

  let session = null;
  let useTransaction = false;

  try {
    // 1. Detect topology support for transactions (Replica Set)
    const topologyType = mongoose.connection.client?.topology?.description?.type;
    const isReplicaSet = topologyType && topologyType !== "Single";

    if (isReplicaSet) {
      session = await mongoose.startSession();
      session.startTransaction();
      useTransaction = true;
    }

    // 2. Prepare query options dynamically
    const opts = useTransaction ? { session } : {};

    // 3. Find target PO
    const po = await PurchaseOrder.findOne({
      $or: [
        { poNumber: rawPoNumber },
        { poNumber: decodedPoNumber }
      ]
    }, null, opts);

    if (!po) {
      if (useTransaction) await session.abortTransaction();
      return res.status(404).json({ error: "PO not found" });
    }

    if (po.status === "Received") {
      if (useTransaction) await session.abortTransaction();
      return res.status(400).json({ error: "PO has already been received" });
    }

    // Safely declare receiveDate AFTER finding the PO
    const receiveDate = po.receivedAt || new Date();
    const assetsToCreate = [];
    const financialsToCreate = [];
    const timestamp = Date.now();
    let uniqueCounter = 0;

    // 4. Construct asset and financial payloads cleanly
    for (const item of po.items || []) {
      let warrantyExpiry = null;
      if (item.warrantyMonths) {
        warrantyExpiry = new Date(receiveDate);
        warrantyExpiry.setMonth(warrantyExpiry.getMonth() + Number(item.warrantyMonths));
      }

      for (let i = 0; i < item.quantity; i++) {
        uniqueCounter++;
        const assetId = `ASSET-${timestamp}-${uniqueCounter}-${Math.floor(Math.random() * 1000)}`;

        assetsToCreate.push({
          assetId,
          assetTag: `TAG-${assetId}`,
          modelId: item.modelId,
          description: item.description,
          name: item.assetName || item.description || "Hardware Asset",
          location: po.receivingLocation || "Main Warehouse",
          category: item.category || item.modelCategory || "Hardware",
          status: "In-Stock"
        });

        financialsToCreate.push({
          financialId: `FIN-${assetId}`,
          assetId: assetId,
          invoiceNumber: po.invoiceNumber || "",
          purchaseDate: receiveDate,
          purchaseCost: item.unitCost || 0,
          warrantyExpiryDate: warrantyExpiry
        });
      }
    }

    // 5. Bulk insert documents
    let createdAssets = [];
    if (assetsToCreate.length > 0) {
      createdAssets = await AssetMaster.insertMany(assetsToCreate, opts);
      await FinancialLifecycle.insertMany(financialsToCreate, opts);
    }

    // 6. Update PO status
    po.status = "Received";
    po.receivedAt = receiveDate;
    await po.save(opts);

    // 7. Commit transaction if active
    if (useTransaction) {
      await session.commitTransaction();
    }

    return res.json({ po, createdAssets });

  } catch (err) {
    if (useTransaction && session) {
      await session.abortTransaction();
    }
    console.error("Receive PO Error:", err);
    return res.status(500).json({ error: err.message });
  } finally {
    if (session) {
      session.endSession();
    }
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const poId = req.params.id;

    // Find the purchase order by ID
    const po = await PurchaseOrder.findById(poId);

    if (!po) {
      return res.status(404).json({ error: "Purchase Order not found" });
    }

    if (po.status === "Received") {
      return res.status(400).json({ error: "Cannot delete a received Purchase Order" });
    }

    // Trigger soft delete (or use findByIdAndDelete for hard delete)
    if (typeof po.delete === "function") {
      await po.delete(); // Soft delete plugin method
    } else {
      await PurchaseOrder.findByIdAndDelete(poId); // Fallback hard delete
    }

    return res.json({ message: "Purchase Order deleted successfully", id: poId });
  } catch (err) {
    console.error("Delete PO Error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// router.post("/", controller.createPO);
// router.post("/:poNumber/approve", controller.approvePO);
// router.post("/:poNumber/receive", controller.receivePO);

export default router;
