import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../api/apiClient";
import "../../styles/changeQuantum.css";
import "../../styles/cmdb.css";
import "../../styles/ticket.css";  

export default function EmergencyChange() {
  const [changes, setChanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newChange, setNewChange] = useState({
    title: "",
    approver: "",
    status: "Pending",
    rollback: ""
  });

  const [editingChange, setEditingChange] = useState(null);

  useEffect(() => {
    fetchEmergencyChanges();
  }, []);

  const fetchEmergencyChanges = async () => {
    setLoading(true);
    try {
      // ✅ Use /api/change/emergency (matching your server.js route mount)
      const res = await apiClient.get("/api/changes/emergency");
      const data = res.data || res;

      setChanges(Array.isArray(data) ? data : data.changes || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch emergency changes:", err);
      setError("Failed to load emergency action records.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChange = async () => {
    if (!newChange.title.trim() || !newChange.approver.trim()) {
      alert("Title and Approver are required fields.");
      return;
    }
    try {
      await apiClient.post("/api/changes/emergency", newChange);
      setNewChange({ title: "", approver: "", status: "Pending", rollback: "" });
      fetchEmergencyChanges();
      alert("Emergency change request logged successfully!");
    } catch (err) {
      console.error("Failed to create emergency change:", err);
      alert("Error adding new emergency change entry.");
    }
  };

  const handleSaveEdit = async () => {
    if (!editingChange.title.trim() || !editingChange.approver.trim()) {
      alert("Fields cannot be left empty.");
      return;
    }
    const targetId = editingChange._id || editingChange.id;
    try {
      await apiClient.put(`/api/changes/emergency/${targetId}`, editingChange);
      setEditingChange(null);
      fetchEmergencyChanges();
    } catch (err) {
      console.error("Failed to save inline update:", err);
      alert("Error saving updates to the server.");
    }
  };

  const handleDeleteChange = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) {
      return;
    }
    try {
      await apiClient.delete(`/api/changes/emergency/${id}`);
      fetchEmergencyChanges();
    } catch (err) {
      console.error("Failed to delete record:", err);
      alert("Error processing deletion request.");
    }
  };

  if (loading) {
    return (
      <div className="quantum-page" style={{ padding: "20px", color: "#38bdf8" }}>
        Loading emergency logs...
      </div>
    );
  }

   if (error) {
    return (
      <div className="quantum-page">
        <div className="quantum-card quantum-error">{error}</div>
      </div>
    );
  }

  return (
  <div className="quantum-page">
    <div className="ticket-header"> 
    <header className="quantum-header">
      <h1>🚨 Emergency Change</h1>
      <p>
        Fast track emergency changes and approvals
      </p>
      <Link to="/workspace/change" className="quantum-link" style={{ color: '#ffffff' }}>
        ← Back to Dashboard
      </Link>
    </header>
    </div>

    <div className="quantum-page-body quantum-grid">
        <section className="quantum-panel">
          <h3 className="quantum-heading">Emergency Actions</h3>
          <div className="quantum-card">
            <table className="quantum-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Approver</th>
                  <th>Status</th>
                  <th>Rollback Plan</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {changes.map((c) => (
                  <tr key={c._id || c.id}>
                    <td>
                      {editingChange?._id === c._id ? (
                        <input
                          className="quantum-input"
                          value={editingChange.title}
                          onChange={(e) =>
                            setEditingChange({ ...editingChange, title: e.target.value })
                          }
                        />
                      ) : (
                        c.title
                      )}
                    </td>
                    <td>
                      {editingChange?._id === c._id ? (
                        <input
                          className="quantum-input"
                          value={editingChange.approver}
                          onChange={(e) =>
                            setEditingChange({ ...editingChange, approver: e.target.value })
                          }
                        />
                      ) : (
                        c.approver?.name || c.approver
                      )}
                    </td>
                    <td>{c.status}</td>
                    <td>{c.rollback || c.rollbackPlan}</td>
                    <td>
                      {editingChange?._id === c._id ? (
                        <>
                          <button className="quantum-btn quantum-btn-success" onClick={handleSaveEdit}>
                            💾 Save
                          </button>
                          <button
                            className="quantum-btn quantum-btn-secondary"
                            onClick={() => setEditingChange(null)}
                          >
                            ✖ Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="quantum-btn quantum-btn-warning"
                            onClick={() => setEditingChange(c)}
                          >
                            ✏ Edit
                          </button>
                          <button
                            className="quantum-btn quantum-btn-danger"
                            onClick={() => handleDeleteChange(c._id)}
                          >
                            🗑 Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

        {/* Add new emergency change */}
            <div className="quantum-flex" style={{ marginTop: "12px", gap: "8px" }}>
              <input
                className="quantum-input"
                placeholder="Change Title"
                value={newChange.title}
                onChange={(e) => setNewChange({ ...newChange, title: e.target.value })}
              />
              <input
                className="quantum-input"
                placeholder="Approver"
                value={newChange.approver}
                onChange={(e) => setNewChange({ ...newChange, approver: e.target.value })}
              />
              <input
                className="quantum-input"
                placeholder="Rollback Plan"
                value={newChange.rollback}
                onChange={(e) => setNewChange({ ...newChange, rollback: e.target.value })}
              />
              <button className="quantum-btn quantum-btn-primary" onClick={handleCreateChange}>
                ➕ Add Change
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}