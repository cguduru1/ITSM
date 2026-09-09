// middleware/authorizeRole.js
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // Expecting req.user to be set by your JWT/Session auth middleware
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Access Denied: You do not have permission to approve emergency changes."
      });
    }
    next();
  };
};