// utils/cmdbAudit.js
import CMDBAudit from "../models/CMDBAudit.js";

export async function logCmdbAudit(req, action, ci, details = {}) {
  await CMDBAudit.create({
    ciId: ci._id,
    ciName: ci.name,
    userId: req.user._id,
    userName: req.user.name,
    action,
    details
  });
}
