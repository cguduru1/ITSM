// routes/adminRoles.js
import express from "express";
import requirePermission from "../middleware/requirePermission.js";
import { roles as staticRoles } from "../rbac.js";

// Dynamic RBAC models (must exist)
import Role from "../models/Role.js";
import UserRole from "../models/UserRole.js";

const router = express.Router();

/**
 * STATIC RBAC — VIEW ALL STATIC ROLES
 */
router.get("/static", requirePermission("settings", "update"), (req, res) => {
  res.json({ success: true, roles: staticRoles });
});

/**
 * STATIC RBAC — VIEW PERMISSIONS FOR ONE STATIC ROLE
 */
router.get("/static/:role", requirePermission("settings", "update"), (req, res) => {
  const roleName = req.params.role;

  if (!staticRoles[roleName]) {
    return res.status(404).json({ error: "Static role not found" });
  }

  res.json({
    role: roleName,
    permissions: staticRoles[roleName].can
  });
});

/**
 * STATIC RBAC — UPDATE PERMISSIONS FOR ONE STATIC ROLE
 */
router.post("/static/:role/update", requirePermission("settings", "update"), (req, res) => {
  const roleName = req.params.role;
  const { permissions } = req.body;

  if (!staticRoles[roleName]) {
    return res.status(404).json({ error: "Static role not found" });
  }

  if (!Array.isArray(permissions)) {
    return res.status(400).json({ error: "Permissions must be an array" });
  }

  staticRoles[roleName].can = permissions;

  res.json({
    success: true,
    role: roleName,
    permissions
  });
});

/**
 * DYNAMIC RBAC — LIST ALL ROLES FROM DB
 */
router.get("/", requirePermission("role", "read"), async (req, res) => {
  try {
    const list = await Role.find().lean();
    return res.json(list);
  } catch (e) {
    return res.status(500).json({ error: e.message || "Failed to fetch roles" });
  }
});

/**
 * DYNAMIC RBAC — CREATE ROLE
 */
router.post("/", requirePermission("role", "create"), async (req, res) => {
  try {
    const r = await Role.create(req.body);
    return res.status(201).json(r);
  } catch (e) {
    return res.status(400).json({ error: e.message || "Failed to create role" });
  }
});

/**
 * DYNAMIC RBAC — UPDATE ROLE
 */
router.put("/:id", requirePermission("role", "update"), async (req, res) => {
  try {
    const r = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!r) {
      return res.status(404).json({ error: "Role not found" });
    }
    return res.json(r);
  } catch (e) {
    return res.status(400).json({ error: e.message || "Failed to update role" });
  }
});

/**
 * DYNAMIC RBAC — ASSIGN ROLE TO USER
 */
router.post("/assign", requirePermission("role", "update"), async (req, res) => {
  try {
    const { userId, roleId, scope } = req.body;

    const ur = await UserRole.create({
      userId,
      roleId,
      scope,
      grantedBy: req.user?._id
    });

    return res.status(201).json(ur);
  } catch (e) {
    return res.status(400).json({ error: e.message || "Failed to assign role" });
  }
});

/**
 * DYNAMIC RBAC — REVOKE ROLE FROM USER
 */
router.delete("/revoke/:id", requirePermission("role", "delete"), async (req, res) => {
  try {
    const result = await UserRole.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ error: "User role assignment not found" });
    }
    return res.json({ ok: true });
  } catch (e) {
    return res.status(400).json({ error: e.message || "Failed to revoke role" });
  }
});

export default router;
