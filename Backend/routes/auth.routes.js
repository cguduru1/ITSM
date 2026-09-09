import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Tenant from "../models/Tenant.js";

const router = express.Router();

// Fallbacks prevent server crashes if .env keys are missing
const ACCESS_SECRET = String(process.env.ACCESS_SECRET || process.env.JWT_SECRET || "default_access_secret_123");
const REFRESH_SECRET = String(process.env.REFRESH_SECRET || "default_refresh_secret_123");

// ------------------------------------------------------------
// Generate Access Token
// ------------------------------------------------------------
function generateAccessToken(user) {
  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      role: user.role,
      department: user.department,
      tenant: user.tenant
    },
    ACCESS_SECRET,
    { expiresIn: "1d" } // 👈 Make sure there are NO spaces inside "1d"
  );
}

// ------------------------------------------------------------
// Generate Refresh Token
// ------------------------------------------------------------
function generateRefreshToken(user) {
  return jwt.sign(
    { id: user._id },
    REFRESH_SECRET,
    { expiresIn: "7d" } // 👈 Make sure there are NO spaces inside "7d"
  );
}

// ------------------------------------------------------------
// GET /api/auth/me
// ------------------------------------------------------------
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, ACCESS_SECRET);

    const user = await User.findById(decoded.id).select("-password").lean();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(user);
  } catch (err) {
    console.error("GET /me Verification Error:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
});

// ------------------------------------------------------------
// LOGIN
// ------------------------------------------------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // MFA Check
    if (user.mfaEnabled) {
      const otp = Math.floor(100000 + Math.random() * 900000);
      user.mfaCode = otp;
      user.mfaExpires = new Date(Date.now() + 5 * 60 * 1000);
      await user.save();

      return res.json({
        mfaRequired: true,
        message: "OTP sent",
        email: user.email,
      });
    }

    const access = generateAccessToken(user);
    const refresh = generateRefreshToken(user);

    // Set Cookies
    res.cookie("accessToken", access, {
      httpOnly: true,
      secure: false, // Localhost testing
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie("refreshToken", refresh, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Login successful",
      token: access,
      access,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        tenant: user.tenant,
      },
    });
  } catch (err) {
    console.error("=== LOGIN CRASH ERROR ===", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
});

// ------------------------------------------------------------
// VERIFY OTP (MFA)
// ------------------------------------------------------------
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.mfaCode) {
      return res.status(400).json({ error: "MFA not initiated" });
    }

    if (String(user.mfaCode) !== String(otp) || new Date() > user.mfaExpires) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    user.mfaCode = null;
    user.mfaExpires = null;
    await user.save();

    const access = generateAccessToken(user);
    const refresh = generateRefreshToken(user);

    return res.json({
      message: "MFA verified",
      token: access,
      access,
      refresh,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        tenant: user.tenant,
      },
    });
  } catch (err) {
    console.error("OTP ERROR:", err);
    return res.status(500).json({ error: "OTP verification failed" });
  }
});

// ------------------------------------------------------------
// REFRESH TOKEN
// ------------------------------------------------------------
router.post("/refresh", async (req, res) => {
  try {
    const token = req.body.token || req.cookies?.refreshToken;
    if (!token) return res.status(400).json({ error: "No refresh token provided" });

    const decoded = jwt.verify(token, REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(400).json({ error: "User not found" });

    const access = generateAccessToken(user);
    return res.json({ token: access, access });
  } catch (err) {
    console.error("REFRESH ERROR:", err);
    return res.status(401).json({ error: "Invalid refresh token" });
  }
});

export default router;
