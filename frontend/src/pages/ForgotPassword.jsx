import { useState } from "react";
// import api from "../api/api";
import apiClient from "../api/apiClient";
import { Link } from "react-router-dom";
import logo from "../assets/s3-logo.png";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await api.post("/api/forgot-password", { email });
      setMessage("A password reset link has been sent to your email.");
    } catch (err) {
      console.error(err);
      setError("Unable to send reset link. Please try again.");
    }
  };

  return (
    <div className="sn-login-wrapper">

      {/* Left Panel */}
      <div className="sn-login-panel">
        <div className="sn-login-box">
          <img src={logo} alt="S3 Technologies" className="sn-logo" />

          <h1 className="sn-title">S3 Technologies ITSM</h1>
          <p className="sn-subtitle">Reset Your Password</p>

          <h2 className="sn-form-title">Forgot Password</h2>

          <form onSubmit={submit}>
            <input
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {message && <p className="success">{message}</p>}
            {error && <p className="error">{error}</p>}

            <button>Send Reset Link</button>
          </form>

          <Link to="/login" className="sn-forgot">
            ← Back to Login
          </Link>
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
