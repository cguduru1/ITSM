import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../api/apiClient";
import "../../styles/changeQuantum.css";
import "../../styles/cmdb.css";
import "../../styles/ticket.css";  

export default function DevOpsModels() {
  const [models, setModels] = useState([]);
  const [newModel, setNewModel] = useState({ name: "", pipeline: "", status: "Active" });
  const [editingModel, setEditingModel] = useState(null);

  // Load models from backend
 useEffect(() => {
    apiClient.get("/api/devops-models")
      .then(res => {
        // Safe guard: Always check if incoming payload is an array
        setModels(Array.isArray(res.data) ? res.data : []);
      })
      .catch(err => {
        console.error("Failed to load models:", err);
        setModels([]); // Reset to empty array on 401/500 errors to prevent crashing
      });
  }, []);

  // Add model
  const addModel = async () => {
    if (!newModel.name || !newModel.pipeline) return;
    try {
      const res = await apiClient.post("/api/devops-models", newModel);
      setModels(Array.isArray(res.data) ? res.data : []);
      setNewModel({ name: "", pipeline: "", status: "Active" });
    } catch (err) {
      console.error("Failed to add model:", err);
    }
  };

  // Delete model
  const deleteModel = async (id) => {
    try {
      const res = await apiClient.delete(`/api/devops-models/${id}`);
      setModels(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to delete model:", err);
    }
  };

  // Save edit
  const saveEdit = async () => {
    if (!editingModel) return;
    try {
      const res = await apiClient.put(`/api/devops-models/${editingModel._id}`, editingModel);
      setModels(Array.isArray(res.data) ? res.data : []);
      setEditingModel(null);
    } catch (err) {
      console.error("Failed to save edit:", err);
    }
  };

  return (
    <div className="quantum-page">
      {/* Header */}
       <div className="ticket-header"> 
      <header className="quantum-header">
        <h1>⚙️ DevOps / Infrastructure Models</h1>
        <p>
          Model-driven change flows for CI/CD
        </p>
        <Link to="/workspace/change" className="quantum-link" style={{ color: '#ffffff' }}>
          ← Back to Dashboard
        </Link>
      </header>
      </div>

      {/* Body */}
      <div className="quantum-page-body quantum-grid">
        {/* Model Definitions Panel */}
        <section className="quantum-panel">
          <h3 className="quantum-heading">Model Definitions</h3>
          <div className="quantum-card">
            <table className="quantum-table">
              <thead>
                <tr>
                  <th>Model Name</th>
                  <th>Pipeline</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {models.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="muted" style={{ textAlign: "center", padding: "16px" }}>
                      No infrastructure models found or accessible.
                    </td>
                  </tr>
                ) : (
                  models.map(m => {
                    const isEditing = editingModel && editingModel._id === m._id;
                    return (
                      <tr key={m._id || m.id}>
                        <td>
                          {isEditing ? (
                            <input
                              className="quantum-input"
                              value={editingModel.name || ""}
                              onChange={(e) =>
                                setEditingModel({ ...editingModel, name: e.target.value })
                              }
                            />
                          ) : (
                            m.name
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <input
                              className="quantum-input"
                              value={editingModel.pipeline || ""}
                              onChange={(e) =>
                                setEditingModel({ ...editingModel, pipeline: e.target.value })
                              }
                            />
                          ) : (
                            m.pipeline
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <select
                              className="quantum-input"
                              value={editingModel.status || "Active"}
                              onChange={(e) =>
                                setEditingModel({ ...editingModel, status: e.target.value })
                              }
                            >
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                              <option value="Deprecated">Deprecated</option>
                            </select>
                          ) : (
                            m.status
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
                                onClick={() => setEditingModel(null)}
                              >
                                ✖ Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="quantum-flex" style={{ gap: "4px" }}>
                              <button
                                className="quantum-btn quantum-btn-warning"
                                onClick={() => setEditingModel({ ...m })}
                              >
                                ✏ Edit
                              </button>
                              <button
                                className="quantum-btn quantum-btn-danger"
                                onClick={() => deleteModel(m._id || m.id)}
                              >
                                🗑 Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Form for adding a new model */}
            <div className="quantum-flex" style={{ marginTop: "16px", gap: "8px" }}>
              <input
                className="quantum-input"
                placeholder="Model Name"
                value={newModel.name}
                onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
              />
              <input
                className="quantum-input"
                placeholder="Pipeline Path"
                value={newModel.pipeline}
                onChange={(e) => setNewModel({ ...newModel, pipeline: e.target.value })}
              />
              <select
                className="quantum-input"
                value={newModel.status}
                onChange={(e) => setNewModel({ ...newModel, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Deprecated">Deprecated</option>
              </select>
              <button className="quantum-btn quantum-btn-primary" onClick={addModel}>
                ➕ Add Model
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}