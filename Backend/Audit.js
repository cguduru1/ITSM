const mongoose = require("mongoose");

const auditSchema = new mongoose.Schema({
  user: String,
  action: String,
  timestamp: { type: Date, default: Date.now },
  ip: String
});

module.exports = mongoose.model("Audit", auditSchema);

//Log Actions
function logAction(user, action, ip) {
  Audit.create({ user, action, ip });
}

logAction(req.user.name, "ticket:create", req.ip);
