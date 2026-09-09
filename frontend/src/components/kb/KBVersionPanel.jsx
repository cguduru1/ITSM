// src/components/kb/KBVersionPanel.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../api/apiClient"; // Adjust path if needed
import KBPanel from "./KBPanel";
import "../../styles/cmdb.css";
import "../../styles/ticket.css";

export default function KBVersionPanel({ versions: propVersions }) {
  const [versions, setVersions] = useState(propVersions || []);
  const [loading, setLoading] = useState(!propVersions);

  useEffect(() => {
    // Fetch version history if not provided via props
    if (!propVersions) {
      const fetchVersions = async () => {
        try {
          setLoading(true);
          const res = await apiClient.get("/api/kb/versions");
          const data = res?.data || res || [];
          setVersions(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error("Failed to load version history:", err);
          setVersions([]);
        } finally {
          setLoading(false);
        }
      };

      fetchVersions();
    }
  }, [propVersions]);

  return (
    <div className="quantum-panel">
    <KBPanel title="Version History Overview">
      <div className="ticket-header">
        <h1>🧬 Article Version History</h1>
        <Link to="/kb" className="quantum-link" style={{ color: '#ffffff' }}>
                ← Back to Dashboard
              </Link>
            </div>

        {loading ? (
          <p style={{ color: "#94a3b8" }}>Loading version records...</p>
        ) : !versions || versions.length === 0 ? (
          <p style={{ color: "#64748b" }}>No version history recorded yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {versions.map((v, index) => {
              const versionNum = v.version || `1.${index}`;
              const author = v.createdByName || v.createdBy || "System";
              const date = v.createdAt
                ? new Date(v.createdAt).toLocaleDateString()
                : "Unknown Date";

              return (
                <li key={v._id || v.version || index} style={cardStyle}>
                  <div>
                    <strong style={{ color: "#facc15", fontSize: "16px" }}>
                      v{versionNum}
                    </strong>
                    {v.title && (
                      <span style={{ marginLeft: "10px", color: "#e2e8f0", fontWeight: 500 }}>
                        — {v.title}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "13px", color: "#94a3b8" }}>
                    <span>By {author}</span> • <span>{date}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
    </KBPanel>
    </div>
  );
}