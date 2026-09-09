// ./lib/permissions.js
import Role from "../models/Role.js";
import UserRole from "../models/UserRole.js";

/**
 * getUserPermissions(userId)
 * returns { resource: [actions] }
 * Aggregates permissions from roles assigned to the user.
 */
export async function getUserPermissions(userId) {
  if (!userId) return {};

  // Default permissions for registered users without explicit database role mappings
  const DEFAULT_PERMISSIONS = {
    change_request: ["read", "create", "update"],
    asset: ["read"],
    role: ["read"]
  };

  // Load user-role links and populate the role document
  const userRoles = await UserRole.find({ userId }).populate("roleId").lean();

  // Extract populated role objects (roleId may be populated object or an id)
  const roles = userRoles
    .map(ur => ur.roleId)
    .filter(Boolean); // remove null/undefined

  // If no assigned roles found in UserRole table, return default safe permissions
  if (!roles.length) {
    return DEFAULT_PERMISSIONS;
  } 

  // Aggregate permissions into a map resource -> Set(actions)
  const permsMap = {};

  for (const role of roles) {
    const permissions = role.permissions || [];
    for (const p of permissions) {
      const resource = p.resource;
      const actions = Array.isArray(p.actions) ? p.actions : [];
      if (!permsMap[resource]) permsMap[resource] = new Set();
      for (const a of actions) permsMap[resource].add(a);
    }
  }

  // Convert Sets to arrays for the final shape
  const perms = Object.fromEntries(
    Object.entries(permsMap).map(([k, v]) => [k, Array.from(v)])
  );

  // Return aggregated permissions if non-empty, otherwise fallback
  return Object.keys(perms).length > 0 ? perms : DEFAULT_PERMISSIONS;

  return perms;
}
