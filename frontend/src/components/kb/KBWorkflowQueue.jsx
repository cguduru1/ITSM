// src/components/kb/KBWorkflowQueue.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../api/apiClient"; // Adjust path if needed
import { useAuth } from "../../auth/AuthContext"; // Adjust path to your Auth context
import KBPanel from "./KBPanel";
import "../../styles/cmdb.css";

export default function KBWorkflowQueue({ items: propItems }) {
  const { user } = useAuth() || {}; // Safely retrieve authenticated user context
  const [items, setItems] = useState(propItems || []);
  const [loading, setLoading] = useState(!propItems);

  useEffect(() => {
    // Fetch queue items if not directly provided via props
    if (!propItems) {
      const fetchWorkflowQueue = async () => {
        try {
          setLoading(true);
          const res = await apiClient.get("/api/kb/workflow");
          const data = res?.data || res || [];
          setItems(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error("Failed to load workflow queue:", err);
          setItems([]);
        } finally {
          setLoading(false);
        }
      };

      fetchWorkflowQueue();
    }
  }, [propItems]);

  const isAdmin = user?.permissions?.kb?.includes("admin") || user?.role === "admin";

  return (
    <div className="quantum-panel">
      <KBPanel title="Workflow Queue Overview">
        <div className="ticket-header">
          <h1>🔄 Article Workflow Queue</h1>
          <Link to="/kb" className="quantum-link" style={{ color: '#ffffff' }}>
                  ← Back to Dashboard
                </Link>
        </div>

          {loading ? (
            <p style={{ color: "#94a3b8" }}>Loading pending queue items...</p>
          ) : !items || items.length === 0 ? (
            <p style={{ color: "#64748b" }}>No workflow items currently pending.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {items.map((i) => {
                const itemId = i._id || i.id;
                return (
                  <li key={itemId} style={cardStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={statusBadge(i.status)}>{i.status || "Draft"}</span>
                      <Link
                        to={`/kb/${itemId}`}
                        style={{ color: "#38bdf8", fontWeight: 500, textDecoration: "none" }}
                      >
                        {i.title || "Untitled Article"}
                      </Link>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: "8px" }}>
                      {i.status === "Draft" && (
                        <button style={{ ...btnStyle, background: "#2563eb", color: "#fff" }}>
                          Submit
                        </button>
                      )}

                      {i.status === "InReview" && isAdmin && (
                        <>
                          <button style={{ ...btnStyle, background: "#16a34a", color: "#fff" }}>
                            Approve
                          </button>
                          <button style={{ ...btnStyle, background: "#dc2626", color: "#fff" }}>
                            Reject
                          </button>
                        </>
                      )}
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

const btnStyle = {
  padding: "4px 10px",
  fontSize: "12px",
  borderRadius: "4px",
  border: "none",
  cursor: "pointer"
};