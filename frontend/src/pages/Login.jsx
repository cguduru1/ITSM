import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import apiClient from "../api/apiClient";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");


  // src/pages/Login.jsx
  const handleSubmit = async (e) => {
  e.preventDefault();
  setErrorMessage("");
  setLoading(true);

  try {
      // AuthContext handles setting user state and saving token
      const res = await login({ email, password });

      // 2. Multi-Key Fallback: Ensure accessToken is present for all components
      const tokenValue = res?.token || res?.access || res?.accessToken;
      if (tokenValue) {
        localStorage.setItem("accessToken", tokenValue);
        localStorage.setItem("token", tokenValue);
        localStorage.setItem("access", tokenValue);
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
      setErrorMessage(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* Watermark */}
      <div className="page-watermark">
        <img src="/s3-watermark.png" alt="S3 Technologies" />
      </div>

      <div className="sn-login-wrapper">

        {/* Left Panel */}
        <div className="sn-login-panel">
          <div className="sn-login-box">
            <img src="/s3-logo.png" alt="S3 Technologies" className="sn-logo" />

            <h2 className="sn-title">Welcome Back</h2>
            <p className="sn-subtitle">Sign in to continue to S3 ITSM Portal</p>

            {errorMessage && (
              <div className="error-banner" role="alert" style={{ color: "red", marginBottom: "1rem" }}>
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                autoComplete="email"
              />

              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading} 
                required
                autoComplete="current-password" 
              />

              <button type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <Link to="/forgot-password" className="sn-forgot">
              Forgot Password?
            </Link>
          </div>
        </div>

        {/* Right Branding Panel */}
        <div className="sn-brand-panel">
          <div className="sn-brand-content">
            <h1>S3 Technologies ITSM</h1>
            <p>Enterprise Service Management Platform</p>
          </div>
        </div>
      </div>
    </div>
    );
}
