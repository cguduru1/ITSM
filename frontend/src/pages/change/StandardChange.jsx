import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../api/apiClient";
import "../../styles/changeQuantum.css";
import "../../styles/cmdb.css";
import "../../styles/ticket.css";  

export default function StandardChange() {
  const [templates, setTemplates] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [submittingId, setSubmittingId] = useState(null);

  useEffect(() => {
    fetchStandardChangeData();
  }, []);

  const fetchStandardChangeData = async () => {
  setLoading(true);
  try {
    const [templateResult, approvalResult] = await Promise.allSettled([
      apiClient.get("/api/changes/standard/templates"),
      apiClient.get("/api/changes/standard/approvals")
    ]);

    // 1. Process and set Templates immediately
    if (templateResult.status === "fulfilled") {
      const response = templateResult.value;
      
      // If the response is a direct array, use it! Otherwise check inner fields
      if (Array.isArray(response)) {
        setTemplates(response);
      } else if (response && Array.isArray(response.data)) {
        setTemplates(response.data);
      } else if (response && Array.isArray(response.templates)) {
        setTemplates(response.templates);
      } else {
        setTemplates([]);
      }
    } else {
      console.error("Failed to load templates:", templateResult.reason);
      setTemplates([]);
    }

    // 2. Process and set Approvals immediately
    if (approvalResult.status === "fulfilled") {
      const response = approvalResult.value;

      if (Array.isArray(response)) {
        setApprovals(response);
      } else if (response && Array.isArray(response.data)) {
        setApprovals(response.data);
      } else if (response && Array.isArray(response.approvals)) {
        setApprovals(response.approvals);
      } else {
        setApprovals([]);
      }
    } else {
      console.error("Failed to load approvals:", approvalResult.reason);
      setApprovals([]);
    }

    setError(null);

    // Apply error banners if things completely broke down
    if (templateResult.status === "rejected" && approvalResult.status === "rejected") {
      setError("Failed to load standard changes data entirely.");
    } else if (templateResult.status === "rejected") {
      setError("Failed to load change templates panel.");
    } else if (approvalResult.status === "rejected") {
      setError("Failed to load governance pre-approvals panel.");
    }

  } catch (err) {
    console.error("Failed to execute data fetch:", err);
    setError("An unexpected error occurred while processing changes.");
  } finally {
    setLoading(false);
  }
};
  // Instantiate a change request from a preapproved template
  const handleCreateChange = async (templateId) => {
    setSubmittingId(templateId);
    try {
      await apiClient.post("/api/changes/standard/create", { templateId });
      alert("Standard Change Request created successfully!");
      fetchStandardChangeData(); // Refresh data
    } catch (err) {
      console.error("Failed to create change request:", err);
      alert("Error creating change request.");
    } finally {
      setSubmittingId(null);
    }
  };

  const categories = ["All", ...new Set(templates.map(t => t.category).filter(Boolean))];

  const filteredTemplates = selectedCategory === "All"
    ? templates
    : templates.filter(t => t.category === selectedCategory);

  if (loading) {
    return (
      <div className="quantum-page" style={{ padding: "20px", color: "#38bdf8" }}>
        Loading standard changes & templates...
      </div>
    );
  }

  return (
    <div className="quantum-page">
      {/* Header */}
      <div className="ticket-header">
      <header className="quantum-header">
        <h1>📋 Standard Change</h1>
        <p>
          Manage and request pre-approved low-risk standard changes
        </p>
        <Link to="/workspace/change" className="quantum-link" style={{ color: '#ffffff' }}>
                  ← Back to Dashboard
                </Link>
      </header>
      </div>

      {error && (
        <div style={{ padding: "10px", margin: "10px 0", color: "#f87171", backgroundColor: "rgba(248, 113, 113, 0.1)", borderRadius: "6px" }}>
          {error}
        </div>
      )}  

      {/* Body */}
      <div className="quantum-page-body quantum-grid">
        {/* Standard Templates Panel */}
        <section className="quantum-panel">
          <div className="quantum-flex-between" style={{ marginBottom: "12px" }}>
            <h3 className="quantum-heading">Standard Templates</h3>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="quantum-input"
              style={{ width: "auto", padding: "4px 8px" }}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        <div className="quantum-card">
            {filteredTemplates.length === 0 ? (
              <p className="muted" style={{ color: "#94a3b8" }}>No standard templates found.</p>
            ) : (
              filteredTemplates.map(template => (
                <div key={template._id || template.id} className="quantum-item" style={{ flexDirection: "column", alignItems: "flex-start", gap: "8px", paddingBottom: "12px", borderBottom: "1px solid #334155" }}>
                  <div className="quantum-flex-between" style={{ width: "100%" }}>
                    <strong style={{ color: "#f8fafc" }}>{template.name}</strong>
                    <span className="quantum-badge" style={{ fontSize: "0.75rem", padding: "2px 6px", borderRadius: "4px", backgroundColor: "#0284c7", color: "#fff" }}>
                      {template.category || "General"}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.875rem", color: "#94a3b8" }}>{template.description}</p>
                  <button
                    onClick={() => handleCreateChange(template._id || template.id)}
                    disabled={submittingId === (template._id || template.id)}
                    className="quantum-btn quantum-btn-primary"
                    style={{ marginTop: "4px", fontSize: "0.8rem", padding: "4px 12px" }}
                  >
                    {submittingId === (template._id || template.id) ? "Requesting..." : "Use Template"}
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Approvals & Active Catalog Panel */}
        <section className="quantum-panel">
          <h3 className="quantum-heading">Governance & Pre-Approvals</h3>
          <div className="quantum-card">
            {approvals.length === 0 ? (
              <p className="muted" style={{ color: "#94a3b8" }}>No governance policies recorded.</p>
            ) : (
              approvals.map(app => (
                <div key={app._id || app.id} className="quantum-item" style={{ justifyContent: "space-between" }}>
                  <div>
                    <div style={{ color: "#f8fafc", fontWeight: "bold" }}>{app.title}</div>
                    <small style={{ color: "#94a3b8" }}>Risk Level: {app.risk || "Low"} | Max Exec: {app.maxDuration || "2h"}</small>
                  </div>
                  <span style={{ color: app.status === "Approved" ? "#4ade80" : "#facc15", fontWeight: "bold", fontSize: "0.85rem" }}>
                    ● {app.status || "Approved"}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
