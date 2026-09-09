import React, { useState, useEffect } from "react"; 
import { Link } from "react-router-dom";
import apiClient from "../../api/apiClient";
import "../../styles/changeQuantum.css";
import "../../styles/cmdb.css";
import "../../styles/ticket.css"; 

export default function DecisionTables() {

  // State for rules
  const [rules, setRules] = useState([
    { id: 1, condition: "Priority = High", action: "Require CAB Approval", outcome: "Escalated" }
  ]);

  // State for new rule input
  const [newRule, setNewRule] = useState({ condition: "", action: "", outcome: "" });

   // Load rules from backend
  useEffect(() => {
  apiClient.get("/api/decision-tables")
    .then(res => {
      // Safely ensure we only save arrays into rules state
      setRules(Array.isArray(res.data) ? res.data : []);
    })
    .catch(err => console.error("Failed to load rules:", err));
}, []);

  // Add rule
  const addRule = async () => {
  if (!newRule.condition || !newRule.action || !newRule.outcome) return;
  try {
    const res = await apiClient.post("/api/decision-tables", newRule);
    setRules(Array.isArray(res.data) ? res.data : []);
    setNewRule({ condition: "", action: "", outcome: "" });
  } catch (err) {
    console.error("Failed to add rule:", err);
  }
};

  // Delete rule
  const deleteRule = async (id) => {
  try {
    const res = await apiClient.delete(`/api/decision-tables/${id}`);
    setRules(Array.isArray(res.data) ? res.data : []);
  } catch (err) {
    console.error("Failed to delete rule:", err);
  }
};


   return (
    <div className="quantum-page">
      {/* Header */}
      <div className="ticket-header"> 
      <header className="quantum-header">
        <h1>📊 Decision Tables</h1>
        <p>
          Define routing policies and dynamic approval flows
        </p>
       <Link to="/workspace/change" className="quantum-link" style={{ color: '#ffffff' }}>
                  ← Back to Dashboard
                </Link>
      </header>
      </div>

      {/* Body */}
      <div className="quantum-page-body quantum-grid">
        {/* Editor Panel */}
        <section className="quantum-panel">
          <h3 className="quantum-heading">Decision Table Editor</h3>
          <div className="quantum-card">
            <table className="quantum-table">
              <thead>
                <tr>
                  <th>Condition</th>
                  <th>Action</th>
                  <th>Outcome</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rules.map(rule => (
                  <tr key={rule.id}>
                    <td>{rule.condition}</td>
                    <td>{rule.action}</td>
                    <td>{rule.outcome}</td>
                    <td>
                      <button
                        className="quantum-btn quantum-btn-danger"
                        onClick={() => deleteRule(rule.id)}
                      >
                        ✖
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

        {/* Add new rule */}
            <div className="quantum-flex" style={{ marginTop: "12px", gap: "8px" }}>
              <input
                className="quantum-input"
                placeholder="Condition"
                value={newRule.condition}
                onChange={(e) => setNewRule({ ...newRule, condition: e.target.value })}
              />
              <input
                className="quantum-input"
                placeholder="Action"
                value={newRule.action}
                onChange={(e) => setNewRule({ ...newRule, action: e.target.value })}
              />
              <input
                className="quantum-input"
                placeholder="Outcome"
                value={newRule.outcome}
                onChange={(e) => setNewRule({ ...newRule, outcome: e.target.value })}
              />
              <button className="quantum-btn quantum-btn-primary" onClick={addRule}>
                ➕ Add Rule
              </button>
            </div>
          </div>
        </section>

        {/* Preview Panel */}
        <section className="quantum-panel">
          <h3 className="quantum-heading">Preview Outcomes</h3>
          <div className="quantum-card">
            {rules.length === 0 ? (
              <p className="muted">No rules defined yet.</p>
            ) : (
              <ul className="quantum-list">
                {rules.map(rule => (
                  <li key={rule.id} className="quantum-item">
                    <span className="quantum-label">{rule.condition}</span>
                    <span className="quantum-value">{rule.outcome}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
