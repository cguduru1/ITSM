// middleware/requirePermission.js
import { roles } from "../rbac.js";

export default function requirePermission(resource, action) {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized: User not authenticated" });
      }

      const role = req.user.role;
      if (!role) {
        return res.status(403).json({ error: "Forbidden: No role assigned" });
      }

      // Admins bypass standard permission checks
      if (role === "admin" || role === "System Admin") {
        return next();
      }

      const userPermissions = roles[role]?.can || [];
      const permissionKey = `${resource}:${action}`; // 👈 FIXED: Uses 'resource' instead of 'module'

      // Check for permission match or wildcard '*' match
      const hasPermission =
        userPermissions.includes(permissionKey) ||
        userPermissions.includes(`${resource}:*`) ||
        userPermissions.includes("*");

      if (!hasPermission) {
        return res.status(403).json({
          error: `Forbidden: Missing required permission [${permissionKey}]`
        });
      }
      return next(); 
    } catch (err) {
      console.error("Permission Middleware Error:", err);
      // Fallback return statement safely terminates the hanging request if something crashes
      return res.status(500).json({ error: err.message || "Internal authorization engine error" });
    }
  };
}