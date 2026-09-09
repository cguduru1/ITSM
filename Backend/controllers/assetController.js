// controllers/assetController.js
import mongoose from "mongoose";
import AssetMaster from "../models/AssetMaster.js";
import { lifecycleEngine } from "../services/lifecycleEngine.js";
import { stockroomEngine } from "../services/stockroomEngine.js";
import { licenseCompliance } from "../services/licenseCompliance.js";
import { logAssetChanges } from "../services/auditLogger.js";
import * as aggregationService from "../services/aggregationService.js";

// GET Single Asset
export const getAsset = async (req, res) => {
  try {
    const { id } = req.params;

    let asset;
    if (mongoose.Types.ObjectId.isValid(id)) {
      asset = await AssetMaster.findById(id);
    } else {
      asset = await AssetMaster.findOne({ assetId: id });
    }

    if (!asset) {
      return res.status(404).json({ success: false, error: "Asset not found" });
    }

    return res.status(200).json({ success: true, data: asset });
  } catch (error) {
    console.error("Error fetching single asset:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch asset" });
  }
};

// Export alias so routes calling getAssetById don't fail
export const getAssetById = getAsset;

// GET All Assets (Paginated)
export const getAssets = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 20;
    const skip = (page - 1) * pageSize;

    const filter = { isDeleted: { $ne: true } };
    if (req.query.search) {
      filter.$or = [
        { assetTag: { $regex: req.query.search, $options: "i" } },
        { name: { $regex: req.query.search, $options: "i" } }
      ];
    }

    const total = await AssetMaster.countDocuments(filter);
    const assets = await AssetMaster.find(filter)
      .lean()
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 });

    const normalizedAssets = assets.map((asset) => ({
      ...asset,
      name: asset.name || asset.assetTag,
      type: asset.type || asset.category || "Hardware",
      owner: asset.owner || asset.assignedTo || "Unassigned",
      descfription: asset.description || asset.description || "",
      status: asset.status || "In-Stock",
    }));

    return res.status(200).json({
      success: true,
      data: normalizedAssets,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    console.error("Error fetching assets:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to fetch assets" });
  }
};

// CREATE Asset
export const createAsset = async (req, res) => {
  try {
    const { assetTag, category, modelId, status, assetId, description, ...rest } = req.body;

    const payload = {
      ...rest,
      assetTag: assetTag?.trim(),
      assetId: assetId || `AST-ID-${Date.now()}`,
      modelId: modelId || "MOD-DEFAULT",
      category: category || "Hardware",
      status: status || "In-Stock",
      description: description?.trim() || "", 
    };

    const assetMaster = await AssetMaster.create(payload);

    return res.status(201).json({
      success: true,
      data: assetMaster,
    });
  } catch (err) {
    console.error("Error creating asset:", err);

    if (err.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0] || "field";
      return res.status(409).json({
        success: false,
        error: `An asset with this ${field} already exists.`,
      });
    }

    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(422).json({
        success: false,
        error: messages.join(", "),
      });
    }

    return res.status(400).json({
      success: false,
      error: err.message || "Failed to create asset",
    });
  }
};

// UPDATE Asset
export async function updateAsset(req, res) {
  try {
    const { id } = req.params;
    const update = req.body;
    const options = { new: true, runValidators: true };

    const filter = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { assetId: id };

    const oldAsset = await AssetMaster.findOne(filter).lean();
    const updatedMaster = await AssetMaster.findOneAndUpdate(filter, update, options);

    if (!updatedMaster) return res.status(404).json({ success: false, error: "Asset not found" });

    lifecycleEngine(updatedMaster).catch(e => console.error("lifecycleEngine error:", e));
    logAssetChanges(
      oldAsset, 
      updatedMaster, 
      req.user?.name || req.user?.email || "system"
    ).catch(e => console.error("logAssetChanges error:", e));

    return res.status(200).json({ success: true, data: updatedMaster });
  } catch (err) {
    console.error("updateAsset error:", err);
    return res.status(400).json({ success: false, error: err.message || "Failed to update asset" });
  }
}

// DELETE Asset
export async function deleteAsset(req, res) {
  try {
    const { id } = req.params;
    const filter = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { assetId: id };

    const master = await AssetMaster.findOneAndDelete(filter);
    if (!master) return res.status(404).json({ success: false, error: "Asset not found" });

    return res.status(200).json({ success: true, message: "Asset deleted successfully", id });
  } catch (err) {
    console.error("deleteAsset error:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to delete asset" });
  }
}

// SOFT DELETE Asset
export async function softDeleteAsset(req, res) {
  try {
    const { id } = req.params;
    const filter = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { assetId: id };

    const doc = await AssetMaster.findOne(filter);
    if (!doc) return res.status(404).json({ success: false, error: "Not found" });

    doc.isDeleted = true;
    doc.deletedAt = new Date();
    await doc.save();

    return res.status(200).json({ success: true, message: "Asset soft-deleted successfully" });
  } catch (err) {
    console.error("softDeleteAsset error:", err);
    return res.status(400).json({ success: false, error: err.message });
  }
}

// RESTORE Asset
export const restoreAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const filter = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { assetId: id };

    const asset = await AssetMaster.findOneAndUpdate(
      filter,
      { isDeleted: false, deletedAt: null },
      { new: true }
    );

    if (!asset) {
      return res.status(404).json({ success: false, error: "Asset not found" });
    }

    return res.status(200).json({ success: true, data: asset });
  } catch (err) {
    console.error("Error restoring asset:", err);
    return res.status(500).json({ success: false, error: "Failed to restore asset" });
  }
};

// AUXILIARY SERVICES
export async function getWorkspace(req, res) {
  try {
    const assetId = req.params.assetId;
    const workspace = await aggregationService.buildAssetWorkspace(assetId);

    if (!workspace) {
      return res.status(404).json({ success: false, error: "Asset workspace not found" });
    }

    return res.status(200).json({ success: true, data: workspace });
  } catch (err) {
    console.error("getWorkspace Error:", err);
    return res.status(500).json({ success: false, error: err.message || "Internal server error" });
  }
}

export async function getLicenseCompliance(req, res) {
  try {
    const report = await licenseCompliance();
    return res.status(200).json({ success: true, data: report });
  } catch (err) {
    console.error("getLicenseCompliance error:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to fetch License Compliance" });
  }
}

export async function getStockroom(req, res) {
  try {
    const stock = await stockroomEngine();
    return res.status(200).json({ success: true, data: stock });
  } catch (err) {
    console.error("getStockroom error:", err);  
    return res.status(500).json({ success: false, error: err.message || "Failed to load stockroom data" });
  }
}