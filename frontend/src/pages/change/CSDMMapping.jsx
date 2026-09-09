import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../api/apiClient";
import "../../styles/changeQuantum.css";
import "../../styles/cmdb.css";
import "../../styles/ticket.css"; 

export default function CSDMMapping() {
   // State for mappings
  const [mappings, setMappings] = useState([
    { id: 1, ci: "Database Server", service: "Payroll App", risk: "High" }
  ]);

  const [newMapping, setNewMapping] = useState({ ci: "", service: "", risk: "Low" });
  const [editingMapping, setEditingMapping] = useState(null);

   // Load mappings from backend
  useEffect(() => {
    apiClient.get("/api/ci-mappings")
      .then(res => {
        setMappings(Array.isArray(res.data) ? res.data : []);
      })
      .catch(err => console.error("Failed to load mappings:", err));
  }, []);

  // Add mapping
 const addMapping = async () => {
    if (!newMapping.ci || !newMapping.service) return;
    try {
      const res = await apiClient.post("/api/ci-mappings", newMapping);
      setMappings(Array.isArray(res.data) ? res.data : []);
      setNewMapping({ ci: "", service: "", risk: "Low" });
    } catch (err) {
      console.error("Failed to add mapping:", err);
    }
  };

  // Delete mapping
   const deleteMapping = async (id) => {
    try {
      const res = await apiClient.delete(`/api/ci-mappings/${id}`);
      setMappings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to delete mapping:", err);
    }
  };

  // Save edit
  const saveEdit = async () => {
    if (!editingMapping) return;
    try {
      const res = await apiClient.put(`/api/ci-mappings/${editingMapping._id}`, editingMapping);
      setMappings(Array.isArray(res.data) ? res.data : []);
      setEditingMapping(null);
    } catch (err) {
      console.error("Failed to save edit:", err);
    }
  };

  // Compute business risk score (simple weighted logic)
  const computeRiskScore = () => {
    const weights = { Low: 1, Medium: 2, High: 3 };
    return mappings.reduce((sum, m) => sum + (weights[m.risk] || 0), 0);
  };

  const riskScore = computeRiskScore();
  const riskLevel = riskScore < 5 ? "Low" : riskScore < 10 ? "Medium" : "High";

  return (
    <div className="quantum-page">
      <div className="ticket-header"> 
      <header className="quantum-header">
        <h1>🔗 CI Mapping (CSDM)</h1>
        <p>
          Map CIs to Application and Technical Services
        </p>
        <Link to="/workspace/change" className="quantum-link" style={{ color: '#ffffff' }}>
                  ← Back to Dashboard
                </Link>
      </header>
      </div>

      <div className="quantum-page-body quantum-grid">
        {/* Mapping Tools */}
       <section className="quantum-panel">
          <h3 className="quantum-heading">Mapping Tools</h3>
          <div className="quantum-card">
            <table className="quantum-table">
              <thead>
                <tr>
                  <th>CI</th>
                  <th>Service</th>
                  <th>Risk</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mappings.map(m => {
                  const isEditing = editingMapping && editingMapping._id === m._id;
                  return (
                    <tr key={m._id || m.id}>
                      <td>
                        {isEditing ? (
                          <input
                            className="quantum-input"
                            value={editingMapping.ci}
                            onChange={(e) =>
                              setEditingMapping({ ...editingMapping, ci: e.target.value })
                            }
                          />
                        ) : (
                          m.ci
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            className="quantum-input"
                            value={editingMapping.service}
                            onChange={(e) =>
                              setEditingMapping({ ...editingMapping, service: e.target.value })
                            }
                          />
                        ) : (
                          m.service
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <select
                            className="quantum-input"
                            value={editingMapping.risk}
                            onChange={(e) =>
                              setEditingMapping({ ...editingMapping, risk: e.target.value })
                            }
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                          </select>
                        ) : (
                          m.risk
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <div className="quantum-flex" style={{ gap: "4px" }}>
                            <button className="quantum-btn quantum-btn-success" onClick={saveEdit}>
                              💾 Save
                            </button>
                            <button
                              className="quantum-btn quantum-btn-secondary"
                              onClick={() => setEditingMapping(null)}
                            >
                              ✖ Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="quantum-flex" style={{ gap: "4px" }}>
                            <button
                              className="quantum-btn quantum-btn-warning"
                              onClick={() => setEditingMapping({ ...m })}
                            >
                              ✏ Edit
                            </button>
                            <button
                              className="quantum-btn quantum-btn-danger"
                              onClick={() => deleteMapping(m._id || m.id)}
                            >
                              🗑 Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Add new mapping element layout section */}
            <div className="quantum-flex" style={{ marginTop: "16px", gap: "8px" }}>
              <input
                className="quantum-input"
                placeholder="Configuration Item (CI)"
                value={newMapping.ci}
                onChange={(e) => setNewMapping({ ...newMapping, ci: e.target.value })}
              />
              <input
                className="quantum-input"
                placeholder="Business Service"
                value={newMapping.service}
                onChange={(e) => setNewMapping({ ...newMapping, service: e.target.value })}
              />
              <select
                className="quantum-input"
                value={newMapping.risk}
                onChange={(e) => setNewMapping({ ...newMapping, risk: e.target.value })}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
              <button className="quantum-btn quantum-btn-primary" onClick={addMapping}>
                ➕ Add Mapping
              </button>
            </div>
          </div>
        </section>

        {/* Risk Aggregate Indicator Panel */}
        <section className="quantum-panel">
          <h3 className="quantum-heading">Impact Dashboard Summary</h3>
          <div className="quantum-card">
            <h4>Combined Risk Factor Level</h4>
            <div style={{ marginTop: "10px", padding: "12px", borderRadius: "6px", background: "rgba(255,255,255,0.05)", fontWeight: "bold" }}>
              Score: <span style={{ color: "#38bdf8" }}>{riskScore}</span> — Assessment Status:{" "}
              <span style={{ color: riskLevel === "High" ? "#ef4444" : riskLevel === "Medium" ? "#f59e0b" : "#10b981" }}>
                {riskLevel} Risk
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}