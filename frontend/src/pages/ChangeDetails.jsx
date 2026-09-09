import React, { useEffect, useState, useCallback } from "react";
import api from "../api/api";
import { useParams } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

export default function ChangeDetails() {
  const { id } = useParams();
  const [change, setChange] = useState(null);
  const [impact, setImpact] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [riskScore, setRiskScore] = useState(null);
  const [sla, setSla] = useState(null);
  const [approvals, setApprovals] = useState([]);
  const [toState, setToState] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);

  const [newApproval, setNewApproval] = useState({
    approverGroup: "",
    decision: "Approved",
    comment: ""
  });

    const loadData = useCallback(async () => {
    if (!id) return;
    try {
      // Parallelized API requests with fallback handlers
      const [cRes, aRes, impRes, timeRes, riskRes, slaRes] = await Promise.allSettled([
        api.get(`/api/changes/${id}`),
        api.get(`/api/changes/${id}/approvals`),
        api.get(`/api/change-impact/${id}/impact`),
        api.get(`/api/changes/${id}/timeline`),
        api.get(`/api/change-risk/${id}/risk-score`),
        api.get(`/api/change-sla/${id}/sla`)
      ]);
    if (cRes.status === "fulfilled") setChange(cRes.value.data);
      if (aRes.status === "fulfilled") setApprovals(aRes.value.data || []);
      if (impRes.status === "fulfilled") setImpact(impRes.value.data);
      if (timeRes.status === "fulfilled") setTimeline(timeRes.value.data || []);
      if (riskRes.status === "fulfilled") setRiskScore(riskRes.value.data?.score ?? null);
      if (slaRes.status === "fulfilled") setSla(slaRes.value.data);
    } catch (err) {
      console.error("Error loading change details:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const transition = async () => {
    if (!toState) return;
    try {
      await api.post(`/api/changes/${id}/transition`, { toState, reason });
      setToState("");
      setReason("");
      loadData();
    } catch (err) {
      console.error("Transition failed:", err);
    }
  };

  const addApproval = async () => {
    if (!newApproval.approverGroup) return;
    try {
      await api.post(`/api/changes/${id}/approvals`, newApproval);
      setNewApproval({ approverGroup: "", decision: "Approved", comment: "" });
      loadData();
    } catch (err) {
      console.error("Add approval failed:", err);
    }
  };

  const predictRisk = async () => {
    try {
      await api.post("/api/change-risk/predict", { changeId: change?._id || id });
      loadData();
    } catch (err) {
      console.error("Predict risk failed:", err);
    }
  };

  const sendCabInvite = async () => {
    try {
      await api.put(`/api/changes/${id}`, { status: "Pending CAB Approval" });
      loadData();
    } catch (err) {
      console.error("CAB invite failed:", err);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 24, color: "#64748b" }}>
        <h3>Loading change details...</h3>
      </div>
    );
  }

  if (!change) {
    return (
      <div style={{ padding: 24, color: "#ef4444" }}>
        <h3>Change record not found.</h3>
      </div>
    );
  }

  const riskLevelClass = change.riskLevel
    ? change.riskLevel.toLowerCase().replace(/\s+/g, "-")
    : "normal";

  return (
    <div style={{ padding: 24, width: "100%", boxSizing: "border-box" }}>
      {/* HEADER ACTIONS & TITLE */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, color: "#1e293b" }}>{change.title || "Untitled Change"}</h1>
          <p style={{ margin: "4px 0 0", color: "#64748b" }}>
            State: <strong>{change.state || change.status || "Open"}</strong> | Requested By: {change.requestedBy || "N/A"}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }}
            onClick={() => window.open(`/api/change-report/${id}/pdf`, "_blank")}
          >
            Export PDF
          </button>
          <button
            style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#556EE6", color: "#fff", cursor: "pointer" }}
            onClick={sendCabInvite}
          >
            Send CAB Invite
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
        {/* LEFT COLUMN: MAIN DETAILS */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <h3 style={{ marginTop: 0 }}>Description</h3>
            <p style={{ color: "#475569" }}>{change.description || "No description provided."}</p>

            {change.plan && (
              <>
                <h3>Implementation Plan</h3>
                <p style={{ color: "#475569" }}>{change.plan}</p>
              </>
            )}

            {change.risk && (
              <>
                <h3>Risk & Assessment Details</h3>
                <p style={{ color: "#475569" }}>{change.risk}</p>
              </>
            )}
          </div>

          {/* STATE TRANSITIONS */}
          <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <h3 style={{ marginTop: 0 }}>State Transitions</h3>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <select
                value={toState}
                onChange={(e) => setToState(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #cbd5e1" }}
              >
                <option value="">Select next state</option>
                {["Assess", "Authorize", "Scheduled", "Implement", "Review", "Closed"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <input
                placeholder="Reason for change"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #cbd5e1", flex: 1 }}
              />

              <button
                onClick={transition}
                disabled={!toState}
                style={{
                  padding: "8px 16px",
                  borderRadius: 6,
                  border: "none",
                  background: toState ? "#10b981" : "#cbd5e1",
                  color: "#fff",
                  cursor: toState ? "pointer" : "not-allowed"
                }}
              >
                Transition
              </button>
            </div>
          </div>

          {/* APPROVALS */}
          <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <h3 style={{ marginTop: 0 }}>Approvals</h3>
            {approvals.length === 0 ? (
              <p style={{ color: "#94a3b8" }}>No approval records registered.</p>
            ) : (
              <ul style={{ paddingLeft: 20, color: "#334155" }}>
                {approvals.map((a) => (
                  <li key={a._id || a.id} style={{ marginBottom: 6 }}>
                    <strong>{a.approverGroup}</strong> — <span style={{ color: a.decision === "Approved" ? "#10b981" : "#ef4444" }}>{a.decision}</span> ({a.comment || "No comments"})
                  </li>
                ))}
              </ul>
            )}

            <h4 style={{ marginBottom: 8, marginTop: 16 }}>Add Approval</h4>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <input
                placeholder="Approver group"
                value={newApproval.approverGroup}
                onChange={(e) => setNewApproval({ ...newApproval, approverGroup: e.target.value })}
                style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #cbd5e1" }}
              />
              <select
                value={newApproval.decision}
                onChange={(e) => setNewApproval({ ...newApproval, decision: e.target.value })}
                style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #cbd5e1" }}
              >
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
              <input
                placeholder="Comment"
                value={newApproval.comment}
                onChange={(e) => setNewApproval({ ...newApproval, comment: e.target.value })}
                style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #cbd5e1", flex: 1 }}
              />
              <button
                onClick={addApproval}
                style={{ padding: "8px 16px", borderRadius: 6, border: "none", background: "#556EE6", color: "#fff", cursor: "pointer" }}
              >
                Save Approval
              </button>
            </div>
          </div>

          {/* IMPACT ANALYSIS */}
          <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <h3 style={{ marginTop: 0 }}>Impact Analysis</h3>
            {impact ? (
              <div>
                <h4>Affected CIs ({impact.cis?.length || 0})</h4>
                {impact.cis?.map((ci) => (
                  <div key={ci._id || ci.id} style={{ padding: 8, borderBottom: "1px solid #f1f5f9" }}>
                    <strong>{ci.name}</strong> ({ci.environment || "Env: N/A"}) — Status: {ci.operational_status || "Active"}
                  </div>
                ))}

                <h4>Affected Assets ({impact.assets?.length || 0})</h4>
                {impact.assets?.map((a) => (
                  <div key={a._id || a.id} style={{ padding: 8, borderBottom: "1px solid #f1f5f9" }}>
                    <strong>{a.name}</strong> ({a.type}) — Owner: {a.owner || "Unassigned"}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#94a3b8" }}>No impact assessment data loaded.</p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: SIDE METRICS & TIMELINE */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* RISK CARD */}
          <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <h3 style={{ marginTop: 0 }}>Risk Score</h3>
            <p style={{ fontSize: 24, fontWeight: 700, margin: "8px 0" }} className={`risk-${riskLevelClass}`}>
              {change.riskLevel || "Medium"} ({riskScore ?? change.riskScore ?? 0})
            </p>
            <button
              onClick={predictRisk}
              style={{ width: "100%", padding: "8px 0", borderRadius: 6, border: "none", background: "#f1f5f9", cursor: "pointer" }}
            >
              Predict Risk
            </button>
          </div>

          {/* SLA TIMER */}
          {sla && (
            <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <h3 style={{ marginTop: 0 }}>SLA Status</h3>
              <p><strong>Target:</strong> {sla.slaHours || 0} hours</p>
              <p><strong>Deadline:</strong> {sla.deadline ? new Date(sla.deadline).toLocaleString() : "N/A"}</p>
              <p style={{ color: sla.breached ? "#ef4444" : "#10b981", fontWeight: 600 }}>
                {sla.remaining > 0
                  ? `${Math.floor(sla.remaining / 3600000)} hours remaining`
                  : "SLA Breached"}
              </p>
            </div>
          )}

          {/* TIMELINE */}
          <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <h3 style={{ marginTop: 0 }}>Timeline</h3>
            {timeline.length === 0 ? (
              <p style={{ color: "#94a3b8" }}>No logs registered.</p>
            ) : (
              timeline.map((log) => (
                <div key={log._id || log.id} style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: 8, marginBottom: 8 }}>
                  <p style={{ margin: 0, fontWeight: 600 }}>{log.action}</p>
                  <p style={{ margin: "2px 0", color: "#64748b", fontSize: 13 }}>{log.details}</p>
                  <p style={{ margin: 0, color: "#94a3b8", fontSize: 11 }}>
                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : ""}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}