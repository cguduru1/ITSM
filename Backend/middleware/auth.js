// middleware/auth.js
import jwt from "jsonwebtoken";

// Standardize fallback secret with your auth route
const SECRET_KEY = String(
  process.env.ACCESS_SECRET || 
  process.env.JWT_SECRET || 
  "default_access_secret_123"
);

export function verifyToken(req, res, next) {
  // Allow preflight OPTIONS requests to pass through middleware safely
  if (req.method === "OPTIONS") return next();

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1]?.trim();

  if (!token || token === "null" || token === "undefined") {
    return res.status(401).json({ error: "Invalid token payload structure" });
  }

  try {
    // Verify using the exact same constant
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    return next();
  } catch (err) {
    console.error("Dashboard Token Verification Error:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
 }  

 // Export as default export as well
export default verifyToken;