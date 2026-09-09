// controllers/changeController.js
import ChangeRequest from "../models/ChangeRequest.js";

// GET changes (With absolute support for Pagination and filtering)
export const getChanges = async (req, res) => {
  try {
    // 1. Capture query pagination bounds safely
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 5;
    const skipValue = (page - 1) * pageSize;

    // 2. Base tenant query engine configuration
    const queryFilter = {
      $or: [
        { tenant: "default" },
        { tenant: { $exists: false } },
        { tenant: null }
      ]
    };

    // OPTIONAL: If the :id is being routed here to filter changes by a specific related item, 
    // uncomment the line below:
    // if (req.params.id) { queryFilter.relatedCIs = req.params.id; }

    // 3. Execute count and paginated query in parallel
    const [totalRecords, dataRecords] = await Promise.all([
      ChangeRequest.countDocuments(queryFilter),
      ChangeRequest.find(queryFilter)
        .sort({ createdAt: -1 })
        .skip(skipValue)
        .limit(pageSize)
    ]);

    // 4. Return structuralized payload that perfectly matches your frontend logic
    res.json({
      changes: dataRecords,
      totalPages: Math.ceil(totalRecords / pageSize) || 1,
      currentPage: page,
      totalRecords
    });

  } catch (err) {
    console.error("Error loading changes:", err);
    res.status(500).json({ error: "Failed to load changes" });
  }
};

// GET single change
export const getChangeById = async (req, res) => {
  try {
    const change = await ChangeRequest.findById(req.params.id);
    if (!change) return res.status(404).json({ error: "Change not found" });
    res.json(change);
  } catch (err) {
    res.status(500).json({ error: "Failed to load change" });
  }
};

// CREATE change
export const createChange = async (req, res) => {
  try {
    const change = new ChangeRequest({ ...req.body, tenant: "default" });
    await change.save();
    res.status(201).json(change);
  } catch (err) {
    console.error("Error creating change:", err);
    res.status(500).json({ error: "Failed to create change" });
  }
};

// UPDATE change
export const updateChange = async (req, res) => {
  try {
    const change = await ChangeRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!change) return res.status(404).json({ error: "Change not found" });
    res.json(change);
  } catch (err) {
    res.status(500).json({ error: "Failed to update change" });
  }
};

// DELETE change
export const deleteChange = async (req, res) => {
  try {
    const change = await ChangeRequest.findByIdAndDelete(req.params.id);
    if (!change) return res.status(404).json({ error: "Change not found" });
    res.json({ message: "Change deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete change" });
  }
};
