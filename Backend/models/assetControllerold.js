import mongoose from "mongoose";
import AssetMaster from "../models/AssetMaster.js";

export const getAssets = async (req, res) => {
  try {
    const assets = await AssetMaster.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json({ success: true, data: assets });
  } catch (err) {
    console.error("Error fetching assets:", err);
    return res.status(500).json({ success: false, error: "Failed to fetch assets" });
  }
};

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

    // Standardized payload format
    return res.status(200).json({ success: true, data: asset });
  } catch (err) {
    console.error("Error fetching asset:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to fetch asset" });
  }
};

// Alias to ensure assetRoutes.js calling assetController.getAssetById won't crash
export const getAssetById = getAsset;

export const createAsset = async (req, res) => {
try {
    const { assetId, category, ...rest } = req.body;

    const payload = {
      ...rest,
      assetId: assetId?.trim() || `AST-${Date.now()}`,
      category: category?.trim() || "Hardware",
    };

    const asset = await AssetMaster.create(payload);
    return res.status(201).json({ success: true, data: asset });
  } catch (err) {
    console.error("Error creating asset:", err);

    if (err.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0] || "field";
      return res.status(409).json({ success: false, error: `An asset with this ${field} already exists.` });
    }

    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(422).json({ success: false, error: messages.join(", ") });
    }

    return res.status(400).json({ success: false, error: err.message || "Failed to create asset" });
  }
};

export const updateAsset = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: "Invalid Asset ID format" });
    }

    const asset = await AssetMaster.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!asset) {
      return res.status(404).json({ success: false, error: "Asset not found" });
    }

    return res.status(200).json({ success: true, data: asset });
  } catch (err) {
    console.error("Error updating asset:", err);
    return res.status(400).json({ success: false, error: err.message || "Failed to update asset" });
  }
};

export const deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: "Invalid Asset ID format" });
    }

    const asset = await AssetMaster.findByIdAndDelete(id);
    if (!asset) {
      return res.status(404).json({ success: false, error: "Asset not found" });
    }

    return res.status(200).json({ success: true, message: "Asset deleted successfully" });
  } catch (err) {
    console.error("Error deleting asset:", err);
    return res.status(500).json({ success: false, error: "Failed to delete asset" });
  }
};