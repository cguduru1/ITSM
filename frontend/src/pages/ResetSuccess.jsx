import { Link } from "react-router-dom";
import logo from "../assets/s3-logo.png";

export default function ResetSuccess() {
  return (
    <div className="sn-login-wrapper">

      {/* Left Panel */}
      <div className="sn-login-panel">
        <div className="sn-login-box">
          <img src={logo} alt="S3 Technologies" className="sn-logo" />

          <h1 className="sn-title">S3 Technologies ITSM</h1>
          <p className="sn-subtitle">Password Reset Completed</p>

          <div className="success-icon" style={{ fontSize: "60px", color: "#2ECC71", marginBottom: "15px" }}>
            ✔
          </div>

          <h2 className="sn-form-title">Password Reset Successful</h2>
          <p>Your password has been updated. You can now sign in with your new credentials.</p>

          <Link to="/login">
            <button className="success-btn">Go to Login</button>
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
