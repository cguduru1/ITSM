// // Add upload.single("justification_doc") middleware to parse incoming FormData
// router.post("/", upload.single("justification_doc"), async (req, res) => {
//   try {
//     // req.body will now contain fields like 'name' and 'type'
//     const newCi = new CMDBModel({
//       ...req.body,
//       // Map 'ci_class' to 'type' if your schema requires a type field
//       type: req.body.type || req.body.ci_class || "Custom CI", // Ensures 'type' field is populated
//       justification_doc: req.file ? req.file.path : null
//     });

//     await newCi.save();
//     return res.status(201).json({ message: "CI created successfully", data: newCi });
//   } catch (err) {
//     console.error("Save error:", err);
//     return res.status(500).json({ error: err.message });
//   }
// });

// // approve change
// router.post("/:id/approve", requirePermission("cmdb", "approve"), async (req, res) => {
//   try {
//   const ci = await CMDB.findById(req.params.id);
//   if (!ci) return res.status(404).json({ error: "CI not found" });

//   // await logCmdbAudit(req, "UPDATE", ci, { fields: Object.keys(req.body) });
//   Object.assign(ci, ci.pendingChange || {});
//   ci.operational_status = "Approved";
//   ci.pendingChange = null;
//   await ci.save();
//   res.json(ci);
// } catch (err) {
//     res.status(500).json({ message: "Failed to approve change", error: err.message });
//   }
// });

// // reject change
// router.post("/:id/reject", requirePermission("cmdb", "approve"), async (req, res) => {
//   try {
//   const ci = await CMDB.findByIdAndUpdate(
//     req.params.id,
//     { status: "Rejected", pendingChange: null },
//     { new: true }
//   );
//   // await logCmdbAudit(req, "UPDATE", ci, { fields: Object.keys(req.body) });
//   res.json(ci);
// } catch (err) {
//     res.status(500).json({ message: "Failed to reject change", error: err.message });
//   }
// });

// router.get("/:id/audit", requirePermission("cmdb", "view"), async (req, res) => {
// try {
//   const logs = await CMDBAudit.find({ ciId: req.params.id })
//   .sort({ timestamp: -1 })
//   .lean();
//   res.json(logs);
//   } catch (err) {
//   res.status(500).json({ message: "Failed to fetch audit logs", error: err.message });
//   }
// });

// // GET /api/cmdb/assets
// router.get("/assets", requirePermission("cmdb", "read"), async (req, res) => {
//   try {
//     const assets = await CMDB.find({ type: { $ne: "Service" } }).lean();
//     res.json(assets || []);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to load assets", error: err.message });
//   }
// });

// router.post("/", createCMDB);

// /* CI list (Explorer) */
// router.get("/", requirePermission("cmdb", "read"), async (req, res) => {
//   try {
//     const { search, type, env } = req.query;

//     const query = {};

//     if (search) {
//       query.name = { $regex: search, $options: "i" };
//     }

//     if (type) {
//       query.type = type;
//     }

//     if (env) {
//       query.environment = env;
//     }

//     const cis = await CMDB.find(query).lean();

//     res.status(200).json(cis);
//   } catch (error) {
//     console.error("GET /api/cmdb failed:", error);
//     res.status(500).json({
//       error: "Failed to fetch configuration items",
//       message: error.message
//     });
//   }
// });

// /*  RBAC permissions */
// /* LIST */
// router.get("/", requirePermission("cmdb", "view"), async (req, res) => {
//     const cis = await CMDB.find().lean();
//     res.json(cis);
//   }
// );

// /* ANALYTICS */
// router.get("/analytics", requirePermission("cmdb", "analytics"), async (req, res) => {
//     const byType = await CMDB.aggregate([
//       { $group: { _id: "$type", count: { $sum: 1 } } }
//     ]);

//     const byEnv = await CMDB.aggregate([
//       { $group: { _id: "$environment", count: { $sum: 1 } } }
//     ]);

//     const byDept = await CMDB.aggregate([
//       { $group: { _id: "$department", count: { $sum: 1 } } }
//     ]);

//     const stale = await CMDB.countDocuments({
//       updatedAt: { $lt: new Date(Date.now() - 180 * 86400000) }
//     });

//     res.json({ byType, byEnv, byDept, stale });
//   }
// );

// // POST Create CI (with file upload support)
// router.post("/", upload.single("justification_doc"), createCMDB);

// /* Impact traversal */
// router.get("/impact/:id", requirePermission("cmdb", "read"), async (req, res) => {
//   try {
//   const root = await CMDB.findById(req.params.id).lean();
//   if (!root) return res.status(404).json({ error: "CI not found" });

//   const visited = new Set();
//   const queue = [root._id];
//   const downstream = [];

//   while (queue.length) {
//     const id = queue.shift();
//     if (visited.has(String(id))) continue;
//     visited.add(String(id));

//     const dependents = await CMDB.find({ "relationships.targetCi": id }).lean();
//     dependents.forEach(d => {
//       downstream.push(d);
//       queue.push(d._id);
//     });
//   }

//   res.json({ root, downstream: root.dependents || [] });
//   } catch (err) {
//     res.status(500).json({ message: "Failed impact analysis", error: err.message });
//   }
// });

// // GET /api/cmdb/:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validate Mongo ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: `Invalid CI ID format: '${id}'` });
    }

    // 2. Query model directly
    const ci = await CMDB.findById(id).lean();

    if (!ci) {
      return res.status(404).json({ error: "CI not found" });
    }

    return res.json(ci);
  } catch (err) {
    // PRINT THE EXACT ERROR IN YOUR BACKEND TERMINAL
    console.error("GET /api/cmdb/:id FAILED REAL REASON:", err.stack || err);
    return res.status(500).json({ message: "Failed to load CI", error: err.message });
  }
});

// /* UPDATE */
// router.put("/:id", requirePermission("cmdb", "update"), async (req, res) => {
//   try {
//     const updated = await CMDB.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     if (!updated) return res.status(404).json({ error: "CI not found" });
//     res.json(updated);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to update CI", error: err.message });
//   }
// });


// /* View */
// router.get("/:id", requirePermission("cmdb", "view"), async (req, res) => {
//   try {
//   const ci = await CMDB.findById(req.params.id).populate("relationships.targetCi").lean();
//   if (!ci) return res.status(404).json({ error: "CI not found" });
//   res.json(sanitizeCiForUser(ci, req.user));
//   } catch (err) {
//     res.status(500).json({ message: "Failed to delete CI", error: err.message });
//   }
// });

// /* DELETE */
// router.delete("/:id", requirePermission("cmdb", "delete"), async (req, res) => {
//   try {
//     const deleted = await CMDB.findByIdAndDelete(req.params.id);
//     if (!deleted) return res.status(404).json({ error: "CI not found" });
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to delete CI", error: err.message });
//   }
// });

// // GET /api/cmdb -> Fetches records from `cmdbs` collection
// router.get("/", async (req, res, next) => {
//   // Option A: Use controller if updated
//   // return getCMDB(req, res, next);

//   // Option B: Direct fetching from `cmdbs` collection
//   try {
//     const records = await CMDB.find().lean();
//     res.json(records);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch CMDB records" });
//   }
// });


