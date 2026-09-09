// middleware/authJwt.js (example)
import jwt from "jsonwebtoken";
const SECRET = process.env.JWT_SECRET || "dev-secret";

export default function authJwt(req, res) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).send("Missing Authorization");
  const token = auth.split(" ")[1];
  try {
    const payload = jwt.verify(token, SECRET);
    req.user = { id: payload.sub, email: payload.email };
  } catch (err) {
    res.status(401).send("Invalid token");
  }
}
