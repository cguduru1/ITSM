// src/components/kb/KBExpiryMonitor.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../api/apiClient"; // Adjust path if needed
import KBPanel from "./KBPanel";
import "../../styles/cmdb.css";
import "../../styles/ticket.css";

export default function KBExpiryMonitor({ expiry: propExpiry }) {
  const [expiry, setExpiry] = useState(propExpiry || null);
  const [loading, setLoading] = useState(!propExpiry);

  useEffect(() => {
    // Fetch expiry stats from API if not passed via props
    if (!propExpiry) {
      const fetchExpiryData = async () => {
        try {
          setLoading(true);
          const res = await apiClient.get("/api/kb/expiry");
          setExpiry(res?.data || res);
        } catch (err) {
          console.error("Failed to load expiry data:", err);
          // Fallback mockup object so UI never renders blank
          setExpiry({
            active: 0,
            expired: 0,
            soon: 0
          });
        } finally {
          setLoading(false);
        }
      };

      fetchExpiryData();
    }
  }, [propExpiry]);

  if (loading) {
    return (
      <KBPanel title="Expiry Monitor">
        <p style={{ padding: "16px" }}>Loading article expiry status...</p>
      </KBPanel>
    );
  }

  const data = expiry || { active: 0, expired: 0, soon: 0 };

  return (
  <div className="quantum-panel">
    {/* <KBPanel title="Expiry Monitor"> */}
      <div className="ticket-header">
        <h1 >⏳ Article Expiry Monitor</h1>
        <Link to="/kb" className="quantum-link" style={{ color: '#ffffff' }}>
                ← Back to Dashboard
              </Link>
            </div>

        <div
          className="quantum-expiry-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px"
          }}
        >
          <div className="quantum-card" style={{ ...cardStyle, borderLeft: "6px solid #4ECDC4" }}>
            <h3 style={cardHeader}>Active Articles</h3>
            <p style={{ ...numberStyle, color: "#16a34a" }}>{data.active ?? 0}</p>
          </div>

          <div className="quantum-card" style={{ ...cardStyle, borderLeft: "6px solid #4ECDC4" }}>
            <h3 style={cardHeader}>Expiring Soon</h3>
            <p style={{ ...numberStyle, color: "#d97706" }}>{data.soon ?? 0}</p>
          </div>

          <div className="quantum-card" style={{ ...cardStyle, borderLeft: "6px solid #4ECDC4" }}>
            <h3 style={cardHeader}>Expired</h3>
            <p style={{ ...numberStyle, color: "#dc2626" }}>{data.expired ?? 0}</p>
          </div>
        </div>
    {/* </KBPanel> */}
  </div>
);
}

const cardStyle = {
  background: "#0f172a",           // dark quantum background
  border: "1px solid #334155",     // subtle border
  borderRadius: "8px",
  padding: "20px",
  color: "#f8fafc",                // light text
  boxShadow: "0 1px 3px rgba(0,0,0,0.3)"
};

const cardHeader = {
  marginBottom: "8px",
  fontSize: "16px",
  fontWeight: "600",
  color: "#38bdf8"                 // teal header color for visibility
};

const numberStyle = {
  fontSize: "26px",
  fontWeight: "bold",
  marginTop: "8px"
};
