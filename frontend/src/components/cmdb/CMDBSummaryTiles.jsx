// src/components/cmdb/CMDBSummaryTiles.jsx
import React from "react";

const cardStyle = {
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: "8px",
  padding: "20px",
  color: "#f8fafc",
  boxShadow: "0 1px 3px rgba(0,0,0,0.3)"
};

const cardHeader = {
  marginBottom: "8px",
  fontSize: "16px",
  fontWeight: "600",
  color: "#38bdf8"
};

const numberStyle = {
  fontSize: "26px",
  fontWeight: "bold",
  marginTop: "8px"
};

export default function CMDBSummaryTiles({ analytics, totalCount = 0 }) {
  const data = analytics || {};
  const byTypeArray = Array.isArray(data.byType) ? data.byType : [];

  // Use explicit totalCount if provided, otherwise sum up byType counts
  const calculatedTotal = byTypeArray.reduce((acc, t) => acc + (t?.count || 0), 0);
  const totalCIs = totalCount || calculatedTotal;
  const staleCount = data.stale ?? 0;

  return (
    <div className="quantum-panel">
      <h2 style={{ color: "#38bdf8", marginBottom: "16px" }}>📊 CMDB Summary</h2>

      <div
        className="cmdb-tile-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px"
        }}
      >
        <div className="quantum-card" style={{ ...cardStyle, borderLeft: "6px solid #38bdf8" }}>
          <h3 style={cardHeader}>Total CIs</h3>
          <p style={numberStyle}>{totalCIs}</p>
        </div>

        <div className="quantum-card" style={{ ...cardStyle, borderLeft: "6px solid #facc15" }}>
          <h3 style={cardHeader}>Stale CIs</h3>
          <p style={numberStyle}>{staleCount}</p>
        </div>

        <div className="quantum-card" style={{ ...cardStyle, borderLeft: "6px solid #4ECDC4" }}>
          <h3 style={cardHeader}>Types Breakdown</h3>
          <p style={{ color: "#e2e8f0", fontSize: "14px", marginTop: "8px" }}>
            {byTypeArray.length > 0 ? (
              byTypeArray
                .filter(t => t?._id)
                .map(t => `${t._id} (${t.count || 0})`)
                .join(", ")
            ) : (
              <span style={{ color: "#94a3b8" }}>No configuration types found</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}