// src/components/kb/KBAnalyticsPanel.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../api/apiClient"; // Adjust path if needed
import KBPanel from "./KBPanel";
import "../../styles/cmdb.css";
import "../../styles/ticket.css";

export default function KBAnalyticsPanel({ analytics: propAnalytics }) {
  const [analytics, setAnalytics] = useState(propAnalytics || null);
  const [loading, setLoading] = useState(!propAnalytics);

  useEffect(() => {
    // If prop wasn't passed directly by a parent component, fetch data from backend API
    if (!propAnalytics) {
      const fetchAnalytics = async () => {
        try {
          setLoading(true);
          const res = await apiClient.get("/api/kb/analytics");
          setAnalytics(res?.data || res);
        } catch (err) {
          console.error("Failed to load analytics:", err);
          // Fallback mockup state so UI never renders completely blank
          setAnalytics({
            totalViews: 0,
            avgRating: 0,
            helpfulPercent: 0,
            totalArticles: 0
          });
        } finally {
          setLoading(false);
        }
      };

      fetchAnalytics();
    }
  }, [propAnalytics]);

  if (loading) {
    return (
      <KBPanel title="Analytics Overview">
        <p style={{ padding: "16px" }}>Loading analytics data...</p>
      </KBPanel>
    );
  }

  // Fallback defaults to prevent reading properties of null
  const data = analytics || {
    totalViews: 0,
    avgRating: 0,
    helpfulPercent: 0,
    totalArticles: 0
  };

return (
  <div className="quantum-panel">
    <div className="ticket-header">
      <h1>Analytics Overview</h1>
      <Link to="/kb" className="quantum-link" style={{ color: '#ffffff' }}>
        ← Back to Dashboard
      </Link>
    </div>

    <div
      className="quantum-analytics-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "20px"
      }}
    >
      <div className="quantum-card" style={cardStyle}>
        <h3>Total Views</h3>
        <p style={numberStyle}>{data.totalViews ?? 0}</p>
      </div>

      <div className="quantum-card" style={cardStyle}>
        <h3>Avg Rating</h3>
        <p style={numberStyle}>{(data.avgRating || 0).toFixed(2)}</p>
      </div>

      <div className="quantum-card" style={cardStyle}>
        <h3>Helpful %</h3>
        <p style={numberStyle}>{data.helpfulPercent ?? 0}%</p>
      </div>

      <div className="quantum-card" style={cardStyle}>
        <h3>Total Articles</h3>
        <p style={numberStyle}>{data.totalArticles ?? 0}</p>
      </div>
    </div>
  </div>
);
}

const cardStyle = {
  background: "#0f172a",          // dark panel background
  border: "1px solid #334155",    // subtle border
  borderLeft: "6px solid #4ECDC4",// green accent stripe on left
  borderRadius: "8px",
  padding: "20px",
  color: "#f8fafc",               // light text
  boxShadow: "0 1px 3px rgba(0,0,0,0.3)"
};

const numberStyle = {
  fontSize: "26px",
  fontWeight: "bold",
  color: "#facc15",               // yellow highlight for numbers
  marginTop: "8px"
};
