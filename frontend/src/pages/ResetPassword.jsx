import { useState } from "react";
// import api from "../api/api";
import apiClient from "../api/apiClient";
import { useNavigate, useSearchParams } from "react-router-dom";
import logo from "../assets/s3-logo.png";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      await api.post("/api/reset-password", {
        token,
        password
      });

      navigate("/reset-success");
    } catch (err) {
      console.error(err);
      setError("Reset link is invalid or expired.");
    }
  };

  return (
    <div className="sn-login-wrapper">

      {/* Left Panel */}
      <div className="sn-login-panel">
        <div className="sn-login-box">
          <img src={logo} alt="S3 Technologies" className="sn-logo" />

          <h1 className="sn-title">S3 Technologies ITSM</h1>
          <p className="sn-subtitle">Set a New Password</p>

          <h2 className="sn-form-title">Reset Password</h2>

          <form onSubmit={submit}>
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />

            {message && <p className="success">{message}</p>}
            {error && <p className="error">{error}</p>}

            <button>Update Password</button>
          </form>
        </div>
      </div>

      {/* Right Panel */}
      <div className="sn-brand-panel">
        <div className="sn-brand-content">
          <h1>S3 Technologies ITSM</h1>
          <p>Enterprise Service Management Platform</p>
        </div>
      </div>

    </div>
  );
}
