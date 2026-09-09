// src/components/cmdb/CMDBAnalyticsPanel.jsx
import React from "react";

const cardStyle = {
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: "8px",
  padding: "16px",
  color: "#f8fafc",
  boxShadow: "0 1px 3px rgba(0,0,0,0.3)"
};

const cardHeader = {
  fontSize: "16px",
  color: "#38bdf8",
  marginBottom: "12px",
  fontWeight: "600"
};

const emptyStyle = {
  color: "#94a3b8",
  fontSize: "14px"
};

export default function CMDBAnalyticsPanel({ analytics }) {
  const isLoading = !analytics;
  const byEnv = Array.isArray(analytics?.byEnv) ? analytics.byEnv : [];
  const byDept = Array.isArray(analytics?.byDept) ? analytics.byDept : [];

  return (
    <section className="quantum-panel">
      <h2 style={{ color: "#38bdf8", marginBottom: "16px" }}>📊 Analytics</h2>
      
      <div
        className="cmdb-analytics-grid quantum-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr", // single column
          gap: "20px"
        }}
      >
        
        {/* By Environment Card */}
        <div className="quantum-card" style={cardStyle}>
          <h4 style={cardHeader}>By Environment</h4>
          {isLoading ? (
            <p style={emptyStyle}>Loading environment analytics...</p>
          ) : byEnv.length > 0 ? (
            <ul style={{ paddingLeft: "20px", margin: 0 }}>
              {byEnv.map((e, index) => (
                <li key={e._id || `env-${index}`} style={{ marginBottom: "4px" }}>
                  <strong>{e._id || "Unspecified"}:</strong> {e.count || 0}
                </li>
              ))}
            </ul>
          ) : (
            <p style={emptyStyle}>No environment data available</p>
          )}
        </div>

        {/* By Department Card */}
        <div className="quantum-card" style={cardStyle}>
          <h4 style={cardHeader}>By Department</h4>
          {isLoading ? (
            <p satyle={emptyStyle}>Loading department analytics...</p>
          ) : byDept.length > 0 ? (
            <ul style={{ paddingLeft: "20px", margin: 0 }}>
              {byDept.map((d, index) => (
                <li key={d._id || `dept-${index}`} style={{ marginBottom: "4px" }}>
                  <strong>{d._id || "Unspecified"}:</strong> {d.count || 0}
                </li>
              ))}
            </ul>
          ) : (
            <p style={emptyStyle}>No department data available</p>
          )}
        </div>
      </div>
   </section>
  );
}