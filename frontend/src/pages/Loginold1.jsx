import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import apiClient from "../api/apiClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Authenticate user credentials
      const data = await apiClient.post("/api/auth/login", { email, password });

      if (data.token) {
        // 2. Save token securely
        localStorage.setItem("token", data.token);

        // 3. Update Auth Context immediately with returned user data or fallback
        setUser(data.user || { name: email.split("@")[0] });

        // 4. Navigate directly to dashboard, bypassing extra /api/me calls if login already returned user details
        navigate("/dashboard", { replace: true });
      } else {
        setError("Invalid server response: missing token.");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.body || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", padding: 24, background: "#fff", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
      <h2 style={{ marginTop: 0, marginBottom: 20 }}>Sign In</h2>

      {error && (
        <div style={{ padding: 10, background: "#fee2e2", color: "#991b1b", borderRadius: 6, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Explicitly bound to handleSubmit function */}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "10px", borderRadius: 6, border: "1px solid #ccc", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "10px", borderRadius: 6, border: "1px solid #ccc", boxSizing: "border-box" }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: "12px", background: "#556EE6", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: "600" }}
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </div>
  );
}