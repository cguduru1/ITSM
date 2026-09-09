//itsm-frontend/server.js
// import express from "express";
// import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../itsm-backend/routes/users.js";
import kbRoutes from "../itsm-backend/routes/knowledge.js";

// const app = express();

// Middleware
// app.use(cors());
// app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Knowledge Base Routes
app.use("/api/kb", kbRoutes);

app.post("/api/login", async (req, res) => {
  try {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: "Invalid password" });

  const token = jwt.sign(
    {
      id: user._id,
      name: user.name,
      role: user.role,
      department: user.department,
      tenant: user.tenant
    },
    "SECRET_KEY",
    { expiresIn: "1d" }
  );

  res.json({
    message: "Login successful",
    token,
    role: user.role,
    department: user.department,
    tenant: user.tenant
  });
} catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Internal server error during login" });
  }
});

// Port Listener
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// api.get("/dashboard/stats");  // becomes /api/dashboard/stats via proxy