import express from "express";
import User from "../models/User.js"; // Adjust path to your User model

const router = express.Router();

// GET /api/users - Fetch all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find({}, "-password").lean(); // Exclude password fields
    res.json(users || []);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users", error: err.message });
  }
});

// PUT /api/users/:id/role - Update user role
router.put("/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to update user role", error: err.message });
  }
});

// GET /api/me/permissions (or GET /api/users/me/permissions depending on route mounting)
router.get("/me/permissions", async (req, res) => {
  try {
    // Return permissions matrix based on your application roles
    // Adjust permissions according to req.user.role if auth middleware is attached
    const defaultPermissions = {
      change_request: ["read", "create", "update", "delete"],
      asset: ["read", "create", "update"],
      role: ["read", "update"]
    };

    res.json({
      success: true,
      permissions: defaultPermissions
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch permissions", error: err.message });
  }
});

export default router;