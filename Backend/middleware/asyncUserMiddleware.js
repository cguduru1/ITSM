// middleware/asyncUserMiddleware.js
import { runWithUser } from "../lib/context/asyncLocalUser.js";

/**
 * Place this middleware after your authentication middleware that sets req.user.
 * It ensures every downstream async operation has access to the current user.
 */
export function withUserContext(handler) {
  return async (req, res) => {
    const userId = req.user?.email || req.user?.id || "anonymous";

    return runWithUser(userId, async () => {
      try {
        await handler(req, res);
      } catch (err) {
        console.error("Context handler error:", err);
        return res.status(500).json({ error: err.message || "Internal Server Error" });
      }
    });
  };
}

/**
 * Standard Express middleware for global app.use()
 */
export function asyncUserMiddleware(req, res, next) {
  const userId = req.user?.email || req.user?.id || "anonymous";

  return runWithUser(userId, () => {
    return next();
  });
}

export default asyncUserMiddleware;
