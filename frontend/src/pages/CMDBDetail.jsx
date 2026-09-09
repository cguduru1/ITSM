//src/pages/CMDBDetail.jsx
import React, { useEffect, useState } from "react";
import apiClient from "../api/apiClient";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "../styles/cmdb.css";

// Ensure sub-components are imported or stubbed
import CMDBRelationshipEditor from "../components/cmdb/CMDBRelationshipEditor";
import CMDBAIAssistant from "../components/cmdb/CMDBAIAssistant";
import CMDBAuditTimeline from "../components/cmdb/CMDBAuditTimeline";

export default function CMDBDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [ci, setCi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDetail = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

      try {
        const res = await apiClient.get(`/api/cmdb/${id}`);
        const responseData = res?.data ?? res;
        const ciData = responseData?.data || responseData?.ci || responseData || {};
        setCi(ciData);
      } catch (err) {
        console.error("Failed to fetch CI details:", err);
        setError("Failed to load CI details.");
      } finally {
        setLoading(false);
      }
  };
  
  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleApproval = async (action) => {
    try {
      await apiClient.post(`/api/cmdb/${ci._id}/${action}`);
      await fetchDetail();
    } catch (err) {
      console.error(`Failed to ${action} CI:`, err);
    }
  };

  if (loading) return <div style={{ padding: 20, color: "#fff" }}>Loading item details...</div>;
  if (error) return <div style={{ padding: 20, color: "red" }}>{error}</div>;
  if (!ci) return <div style={{ padding: 20, color: "#fff" }}>CI not found.</div>;


return (
  <div className="quantum-container">
    <Link to="/cmdb" className="quantum-link">← Back to CMDB Explorer</Link>

    <div className="quantum-header">
      {ci.name || "Unnamed Configuration Item"}
      <div className="quantum-meta">ID: {ci._id}</div>
    </div>

    {/* Grid layout */}
    <div
      className="quantum-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
        gap: "20px",
        alignItems: "start",
      }}
    >
      {/* Overview */}
      <div className="cmdb-panel quantum" style={{ backgroundColor: "#1e293b", color: "#f8fafc", padding: "20px", borderRadius: "8px" }}>
        <div className="quantum-header" style={{ color: "#38bdf8" }}>Overview</div>
        <table style={{ width: "100%", borderSpacing: "8px" }}>
          <tbody>
            <tr><td><strong>Name:</strong></td><td>{ci.name || "N/A"}</td></tr>
            <tr><td><strong>Environment:</strong></td><td>{ci.environment || "N/A"}</td></tr>
            <tr><td><strong>Asset Tag:</strong></td><td>{ci.asset_tag || "N/A"}</td></tr>
            <tr><td><strong>Status:</strong></td><td>{ci.operational_status || "Operational"}</td></tr>
            <tr><td><strong>Criticality:</strong></td><td>{ci.business_criticality || "Normal"}</td></tr>
            <tr><td><strong>Managed By:</strong></td><td>{ci.managed_by || "Unassigned"}</td></tr>
          </tbody>
        </table>
      </div>

      {/* Audit Timeline */}
      <div className="cmdb-panel quantum" style={{ backgroundColor: "#0f172a", color: "#e2e8f0", padding: "16px", borderRadius: "8px" }}>
        <div className="quantum-header" style={{ color: "#38bdf8" }}>Audit Timeline</div>
        <CMDBAuditTimeline ciId={id} />
      </div>

      {/* Dependencies */}
      <div className="cmdb-panel quantum" style={{ backgroundColor: "#0f172a", color: "#e2e8f0", padding: "16px", borderRadius: "8px", overflowY: "auto" }}>
        <div className="quantum-header" style={{ color: "#38bdf8" }}>Dependencies</div>
        <ul style={{ paddingLeft: "20px" }}>
          {ci.dependencies?.length ? ci.dependencies.map(dep => (
            <li key={dep._id || dep}>{dep.name || dep}</li>
          )) : <li>No upstream dependencies</li>}
        </ul>
      </div>

      {/* Downstream Dependents */}
      <div className="cmdb-panel quantum" style={{ backgroundColor: "#0f172a", color: "#e2e8f0", padding: "16px", borderRadius: "8px", overflowY: "auto" }}>
        <div className="quantum-header" style={{ color: "#38bdf8" }}>Downstream Dependents</div>
        <ul style={{ paddingLeft: "20px" }}>
          {ci.dependents?.length ? ci.dependents.map(dep => (
            <li key={dep._id || dep}>{dep.name || dep}</li>
          )) : <li>No downstream dependents</li>}
        </ul>
      </div>

      {/* Relationship Editor */}
      <div className="cmdb-panel quantum" style={{ backgroundColor: "#1e293b", color: "#f8fafc", padding: "20px", borderRadius: "8px" }}>
        <div className="quantum-header" style={{ color: "#38bdf8" }}>Relationship Editor</div>
        <CMDBRelationshipEditor ciId={id} />
      </div>

      {/* AI Impact & Risk */}
      <div className="cmdb-panel quantum" style={{ backgroundColor: "#0f172a", color: "#f8fafc", padding: "20px", borderRadius: "8px" }}>
        <div className="quantum-header" style={{ color: "#facc15" }}>AI Impact & Risk</div>
        <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#facc15" }} className="risk-score">
          Risk Score: {ci.riskScore ?? "N/A"}
        </div>
        <CMDBAIAssistant ciId={id} />
      </div>
    </div>

    {/* Pending Approval */}
    {ci.operational_status === "InReview" && user?.permissions?.cmdb?.includes("approve") && (
      <div className="cmdb-panel quantum" style={{ backgroundColor: "#1e293b", color: "#f8fafc", padding: "20px", borderRadius: "8px", marginTop: "20px" }}>
        <div className="quantum-header" style={{ color: "#38bdf8" }}>Pending Change</div>
        <pre style={{ backgroundColor: "#0f172a", padding: "12px", borderRadius: "6px", color: "#e2e8f0" }}>
          {JSON.stringify(ci.associated_change || {}, null, 2)}
        </pre>
        <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
          <button onClick={() => handleApproval("approve")}>Approve</button>
          <button onClick={() => handleApproval("reject")}>Reject</button>
        </div>
      </div>
    )}
  </div>
);
}