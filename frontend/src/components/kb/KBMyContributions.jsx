// src/components/kb/KBMyContributions.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../api/apiClient"; // Adjust path if needed
import KBPanel from "./KBPanel";
import "../../styles/cmdb.css";
import "../../styles/ticket.css";

export default function KBMyContributions({ data: propData }) {
  const [data, setData] = useState(propData || null);
  const [loading, setLoading] = useState(!propData);

  useEffect(() => {
    // If contributions data isn't passed via props, fetch directly from API
    if (!propData) {
      const fetchContributions = async () => {
        try {
          setLoading(true);
          const res = await apiClient.get("/api/kb/my-contributions");
          setData(res?.data || res);
        } catch (err) {
          console.error("Failed to load user contributions:", err);
          setData({
            created: [],
            updated: [],
            versions: [],
            approvals: []
          });
        } finally {
          setLoading(false);
        }
      };

      fetchContributions();
    }
  }, [propData]);

  if (loading) {
    return (
      <KBPanel title="My Contributions">
        <p style={{ padding: "16px" }}>Loading your contributions...</p>
      </KBPanel>
    );
  }

  // Safe fallback objects to prevent mapping errors
  const created = data?.created || [];
  const updated = data?.updated || [];
  const versions = data?.versions || [];
  const approvals = data?.approvals || [];

  return (
    <div className="quantum-panel">
    {/* <KBPanel title="My Contributions"> */}
      <div className="ticket-header">
        <h1>👤 My Contributions</h1>

        <Link to="/kb" className="quantum-link" style={{ color: '#ffffff' }}>
                ← Back to Dashboard
              </Link>
            </div>

        <div className="kb-contrib-section">
          {/* Created Articles */}
          <SectionBlock title="Created Articles" icon="📝">
            {created.length === 0 ? (
              <p style={emptyStyle}>No created articles yet.</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {created.map((a) => (
                  <li key={a._id || a.id} style={itemStyle}>
                    <strong style={{ color: "#f8fafc" }}>{a.title || "Untitled"}</strong> —{" "}
                    <span style={badgeStyle}>{a.status || "Draft"}</span>
                  </li>
                ))}
              </ul>
            )}
          </SectionBlock>

          {/* Updated Articles */}
          <SectionBlock title="Updated Articles" icon="✏️">
            {updated.length === 0 ? (
              <p style={emptyStyle}>No article updates recorded.</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {updated.map((a) => (
                  <li key={a._id || a.id} style={itemStyle}>
                    <strong style={{ color: "#f8fafc" }}  >{a.title || "Untitled"}</strong> —{" "}
                    <span style={badgeStyle}>{a.status || "Published"}</span>
                  </li>
                ))}
              </ul>
            )}
          </SectionBlock>

          {/* Versions Created */}
          <SectionBlock title="Versions Created" icon="🧬">
            {versions.length === 0 ? (
              <p style={emptyStyle}>No version histories created.</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {versions.map((v) => (
                  <li key={v._id || v.id} style={itemStyle}>
                    <strong style={{ color: "#facc15" }}>v{v.version || "1.0"}</strong> —{" "}
                    <span style={{ color: "#e2e8f0" }}>
                      {v.articleId?.title || v.title || "Article"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </SectionBlock> 

          {/* Approvals */}
          <SectionBlock title="Approvals" icon="✅">
            {approvals.length === 0 ? (
              <p style={emptyStyle}>No pending or completed approvals.</p>
            ) : (
               <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {approvals.map((a) => (
                  <li key={a._id || a.id} style={itemStyle}>
                     <span style={{ color: "#38bdf8" }}>
                    {a.articleTitle || a.title || "Approved Article"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </SectionBlock>
        </div>
    {/* </KBPanel> */}
    </div>
  );
}

// Sub-component wrapper for section consistency
function SectionBlock({ title, icon, children }) {
  return (
    <div style={{ marginBottom: "24px", background: "#0f172a", borderLeft: "6px solid #4ECDC4", borderRadius: "8px", padding: "12px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>
      <h3 style={{ fontSize: "16px", color: "#38bdf8", marginBottom: "8px" }}>
        {icon} {title}
      </h3>
      {children}
    </div>
  );
}

const itemStyle = {
  padding: "8px 0",
  borderBottom: "1px solid #334155",
  color: "#e2e8f0",
  fontSize: "14px"
};

const badgeStyle = {
  fontSize: "12px",
  color: "#0f172a",
  background: "#facc15",
  padding: "2px 6px",
  borderRadius: "4px",
  fontWeight: "600"
};

const emptyStyle = {
  color: "#94a3b8",
  fontSize: "14px",
  margin: 0
};