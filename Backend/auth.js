import jwt from "jsonwebtoken";
import User from "./models/User.js";
import Tenant from "./models/Tenant.js";

export default async function auth(req, res) {
  try {
    const header = req.headers.authorization;
    if (!header) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = header.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Invalid token format" });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
    req.user = decoded;

    // Load tenant data
    const tenant = await Tenant.findOne({ code: decoded.tenant });
    req.user.tenantData = tenant;

  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ error: "Unauthorized" });
  }
}
