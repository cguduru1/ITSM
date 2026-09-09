import { can } from "./rbac.js";

export function authorize(action) {
  return (req, res) => {
    if (!req.user || !can(req.user.role, action)) {
      return res.status(403).json({ error: "Forbidden" });
    }
  };
}
