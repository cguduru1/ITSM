// middleware/currentUser.js
/**
 * Simple Express middleware that exposes a compact current user identifier
 * on req.currentUserId for controllers to use when setting _auditUser.
 *
 * Place this middleware after your authentication middleware (so req.user exists).
 */
export default function currentUser(req, res, next) {
  // adapt to your auth shape: req.user.email, req.user.id, etc.
  req.currentUserId = req.user?.email || req.user?.id || "anonymous";
  return next();
  
  // Pass control to the next middleware or route handler
}
