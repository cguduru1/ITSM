// ./routes/me.js
import express from "express";
import { getUserPermissions } from "../lib/permissions.js"; // server helper from earlier
import verifyToken from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

/**
 * GET /api/me/permissions
 * Returns the current user's resolved permissions as:
 * { resourceName: ['create','read','update','delete'], ... }
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.user?.sub;
    if (!userId) return res.status(401).json({ error: "Unauthorized: Missing user ID" });

    // Prevent Mongoose CastError on invalid ObjectId formats
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid User ID format" });
    }

    const user = await User.findById(userId).select("-password").lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json(user);
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to fetch user details" });
  }
});

/**
 * GET /api/me/permissions
 * Returns current user's resolved permissions object
 */
router.get("/permissions", verifyToken, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.user?.sub;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: Invalid token payload" });
    }

    const perms = await getUserPermissions(userId);

    // Fallback to empty object if perms is null/undefined
    return res.json(perms || {});
  } catch (err) {
    console.error(`Error resolving permissions for user ${req.user?.id || req.user?._id}:`, err);
    return res.status(500).json({ error: err.message || "Failed to resolve permissions" });
  }
});

export default router;
