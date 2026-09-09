export default function requireAuth(req, res) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}
