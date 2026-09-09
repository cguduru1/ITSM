//controllers/cmdb.contoller.js
import mongoose from "mongoose";
import CMDB from "../models/CMDB.js";
import Change from "../models/Change.js";
import ChangeRequest from "../models/ChangeRequest.js";

// -------------------------------------------------------------
// GET ALL CMDB ITEMS (with pagination + search)
// -------------------------------------------------------------
export const getCMDB = async (req, res) => {
   try {
    const { search = "", page = 1, pageSize = 10, business_criticality, operational_status, environment } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(pageSize, 10) || 10);

    const query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    if (business_criticality) {
      query.business_criticality = business_criticality;
    }
    if (operational_status) {
      query.operational_status = operational_status;
    }
    if (environment) {
      query.environment = environment;
    }

    // Directly query the "cmdbs" collection in MongoDB
    const collection = mongoose.connection.db.collection("cmdbs");

    const total = await CMDB.countDocuments(query);

    const items = await CMDB.find(query)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    res.json({
      items,
      data: items,
      table: items,
      total,
      page: pageNum,
      pageSize: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1
    });
  } catch (err) {
    console.error("GET CMDB ERROR:", err);
    res.status(500).json({ error: "Failed to load CMDB", details: err.message });
  }
};

// -------------------------------------------------------------
// GET SINGLE CI BY ID
// -------------------------------------------------------------
export const getCIById = async (req, res) => {
  try {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: `Invalid ID format: ${id}` });
    }
    const ci = await CMDB.findById(id)
      .populate("dependencies")
      .populate("dependents")
      .populate("related_assets")
      .populate("related_changes")
      .lean();

    // const ci = await CMDB.findById(id);

    if (!ci) return res.status(404).json({ error: "CI not found in cmdbs" });

    res.json(ci);
  } catch (err) {
    console.error("GET CI ERROR:", err);
    res.status(500).json({ error: "Failed to load CI" });
  }
};

// -------------------------------------------------------------
// CREATE CI
// -------------------------------------------------------------
export const createCMDB = async (req, res) => {
  try {
    const ci = new CMDB(req.body);
    await ci.save();
    res.json({ message: "CI created successfully", ci });
  } catch (err) {
    console.error("CREATE CI ERROR:", err);
    res.status(500).json({ error: "Failed to create CI" });
  }
};

// -------------------------------------------------------------
// UPDATE CI
// -------------------------------------------------------------
export const updateCMDB = async (req, res) => {
  try {
    const ci = await CMDB.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!ci) return res.status(404).json({ error: "CI not found" });

    res.json({ message: "CI updated successfully", ci });
  } catch (err) {
    console.error("UPDATE CI ERROR:", err);
    res.status(500).json({ error: "Failed to update CI" });
  }
};

// -------------------------------------------------------------
// DELETE CI
// -------------------------------------------------------------
export const deleteCMDB = async (req, res) => {
  try {
    const ci = await CMDB.findByIdAndDelete(req.params.id);
    if (!ci) return res.status(404).json({ error: "CI not found" });

    res.json({ message: "CI deleted successfully" });
  } catch (err) {
    console.error("DELETE CI ERROR:", err);
    res.status(500).json({ error: "Failed to delete CI" });
  }
};

// -------------------------------------------------------------
// CI DEPENDENCY GRAPH
// -------------------------------------------------------------
export const getGraph = async (req, res) => {
  try {
    const cis = await CMDB.find().populate("dependencies dependents").lean();

    const nodes = cis.map(ci => ({
      id: ci._id,
      label: ci.name,
      status: ci.operational_status
    }));

    const links = [];

    cis.forEach(ci => {
      (ci.dependencies || []).forEach(dep => {
        if (dep?._id) {
        links.push({
          source: ci._id,
          target: dep._id
        });
      }
      });
    });

    res.json({ nodes, links });
  } catch (err) {
    console.error("GRAPH ERROR:", err);
    res.status(500).json({ error: "Failed to load graph" });
  }
};

// -------------------------------------------------------------
// CI RELATIONSHIP MAPPING
// -------------------------------------------------------------
export const getRelationships = async (req, res) => {
  try {
    const ci = await CMDB.findById(req.params.id)
      .populate("dependencies dependents related_assets related_changes");

    if (!ci) return res.status(404).json({ error: "CI not found" });

    res.json({
      dependencies: ci.dependencies || [],
      dependents: ci.dependents || [],
      assets: ci.related_assets || [],
      changes: ci.related_changes || []
    });
  } catch (err) {
    console.error("RELATIONSHIP ERROR:", err);
    res.status(500).json({ error: "Failed to load relationships" });
  }
};

// -------------------------------------------------------------
// CI IMPACT ANALYSIS
// -------------------------------------------------------------
export const calculateImpact = async (req, res) => {
  try {
    const { ciId } = req.body;

    if (!ciId || !mongoose.Types.ObjectId.isValid(ciId)) {
      return res.status(400).json({ error: "Valid ciId is required" });
    }

    const ci = await CMDB.findById(ciId)
      .populate("dependencies dependents related_assets related_changes")
      .lean();

    if (!ci) return res.status(404).json({ error: "CI not found" });

    const impactScore =
      ((ci.dependencies?.length || 0) * 2) +
      ((ci.dependents?.length || 0) * 3) +
      ((ci.related_assets?.length || 0) * 1) +
      ((ci.related_changes?.length || 0) * 2);

    const risk =
      impactScore > 15 ? "High" :
      impactScore > 8 ? "Medium" : "Low";

    res.json({
      ci: ci.name,
      impactScore,
      risk,
      affected: {
        dependencies: ci.dependencies,
        dependents: ci.dependents,
        assets: ci.related_assets,
        changes: ci.related_changes
      }
    });
  } catch (err) {
    console.error("IMPACT ERROR:", err);
    res.status(500).json({ error: "Failed to calculate impact" });
  }
};

export const getAuditTimeline = async (req, res) => {
  try {
    const { id } = req.params;

    // Optional: If your audit logs are tracked in a dedicated collection:
    // const logs = await AuditLog.find({ ciId: id }).sort({ createdAt: -1 });
    
    // Alternative: If audit/timeline logs are embedded directly inside the CMDB document itself:
    const ci = await CMDB.findById(id).select("timeline stateHistory");
    if (!ci) {
      return res.status(404).json({ message: "CI not found" });
    }
    
    const logs = ci.timeline || [];

    return res.status(200).json({ success: true, data: logs });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return res.status(500).json({ message: "Failed to load audit history logs", error: error.message });
  }
};
