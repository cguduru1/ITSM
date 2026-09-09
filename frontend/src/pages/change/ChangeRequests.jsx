// src/pages/change/ChangeRequest.js
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import apiClient from "../../api/apiClient";
import { useParams, Link } from "react-router-dom";
import "../../styles/changeQuantum.css";
import "../../styles/cmdb.css";
import "../../styles/ticket.css";

export default function ChangeRequests() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ci, setCi] = useState(null);
  
  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      title: "",
      description: "",
      model: "normal",
      status: "Draft",
      priority: "Medium"
    }
  }); 

  const [changes, setChanges] = useState([]);
  const [editingId, setEditingId] = useState(null);
  
  // UNIFIED PAGINATION STATES
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); 
  const itemsPerPage = 5;

   // 1. Fetch Change Requests safely
  // 1. Fetch Change Requests safely
  const loadChanges = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      queryParams.append("page", currentPage);
      queryParams.append("pageSize", itemsPerPage);
      
      const res = await apiClient.get(`/api/changes/${id}?${queryParams.toString()}`);
      const responseData = res?.data ?? res;
      
      const list = Array.isArray(responseData)
        ? responseData
        : responseData?.table || responseData?.data || responseData?.changes || [];
        
      setChanges(list); 
      setTotalPages(responseData?.totalPages || 1);
      
    } catch (err) {
      console.error("Error fetching changes:", err);
      setError(err?.message || "Failed to load records");
    } finally {
      setLoading(false);
    }
  };

  // DEPENDENCY TRACKING FIXED: Refetch when page modifications happen
  useEffect(() => {
    loadChanges();
  }, [id, currentPage]);

  // Edit Handler 
  const onEdit = (item) => {
    const recordId = item._id || item.id;
    setEditingId(recordId);
    setValue("title", item.title || "");
    setValue("description", item.description || "");
    setValue("model", item.model || item.type || "normal");
    setValue("status", item.status || "Draft");
    setValue("priority", item.priority || "Medium");
  };

  // Create or update
  const onSubmit = async (formData) => {
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        model: formData.model || "normal",
        type: formData.model || "normal",
        category: "Software",
        priority: formData.priority || "Medium",
        riskLevel: "Low",
        status: formData.status || "Draft"
      };

      if (editingId) {
        await apiClient.put(`/api/changes/${editingId}`, payload);
        setEditingId(null);
      } else {
        const res = await apiClient.post("/api/changes", payload);
        console.log("POST Response:", res.data);
      }

      reset({ title: "", description: "", model: "normal", status: "Draft", priority: "Medium" });
      await loadChanges();
    } catch (err) {
      console.error("Submission error:", err);
      alert("Error: " + (err.response?.data?.error || err.message));
    }
  };

  // 3. Delete change
  const onDelete = async (id) => {
    if (!window.confirm("Delete record?")) return;
    try {
      await apiClient.delete(`/api/changes/${id}`);
      await loadChanges();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // 4. Client Bindings
  const safeChanges = Array.isArray(changes) ? changes : [];
  const paginated = safeChanges; 

  return (
    <div className="quantum-page">
      {/* Header */}
      <div className="ticket-header"> 
      <header className="quantum-header">
        <h1>📑 Change Requests</h1>
        <p>
          Create, view, update and delete change requests
        </p>
        <Link to="/workspace/change" className="quantum-link" style={{ color: '#ffffff' }}>
                  ← Back to Dashboard
                </Link>
      </header>
      </div>

      {/* Vertical Form */}
     <form id="change-form" className="quantum-form" onSubmit={handleSubmit(onSubmit)}>
  <div className="quantum-card quantum-form-body">
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 24px" }}>
      
      {/* Field 1: Title */}
      <div className="quantum-form-row" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label className="quantum-label" style={{ color: "#ffffff", fontWeight: 500 }}>Title</label>
        <input
          {...register("title", { required: true })}
          className="quantum-input"
          placeholder="Enter title"
          style={{ width: "100%", boxSizing: "border-box" }}
        />
      </div>

      {/* Field 2: Description */}
      <div className="quantum-form-row" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label className="quantum-label" style={{ color: "#ffffff", fontWeight: 500 }}>Description</label>
        <textarea
          {...register("description")}
          rows={1}
          className="quantum-input"
          placeholder="Enter description"
          style={{ width: "100%", boxSizing: "border-box", resize: "vertical" }}
        />
      </div>

      {/* Field 3: Status */}
      <div className="quantum-form-row" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label className="quantum-label" style={{ color: "#ffffff", fontWeight: 500 }}>Status</label>
        <select {...register("status")} className="quantum-input" style={{ width: "100%", boxSizing: "border-box" }}>
          <option value="Draft">Draft</option>
          <option value="Requested">Requested</option>
          <option value="Authorize">Authorize</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Closed">Closed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Field 4: Model */}
      <div className="quantum-form-row" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label className="quantum-label" style={{ color: "#ffffff", fontWeight: 500 }}>Model</label>
        <select {...register("model")} className="quantum-input" style={{ width: "100%", boxSizing: "border-box" }}>
          <option value="normal">Normal</option>
          <option value="standard">Standard</option>
          <option value="emergency">Emergency</option>
          <option value="devops">DevOps</option>
        </select>
      </div>

      {/* Field 5: Priority (Spans across both columns) */}
      <div className="quantum-form-row" style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: "6px" }}>
        <label className="quantum-label" style={{ color: "#ffffff", fontWeight: 500 }}>Priority</label>
        <select {...register("priority")} className="quantum-input" style={{ width: "100%", boxSizing: "border-box" }}>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      {/* Submit Controls */}
      <div style={{ gridColumn: "span 2", textAlign: "center", paddingTop: "12px" }}>
        <button type="submit" className="quantum-btn quantum-btn-primary">
          {editingId ? "Update Change" : "Create Change"}
        </button>
        {editingId && (
          <button
            type="button"
            className="quantum-btn quantum-btn-secondary"
            onClick={() => {
              setEditingId(null);
              reset({
                title: "",
                description: "",
                model: "normal",
                status: "Draft",
                priority: "Medium"
              });
            }}
            style={{ marginLeft: "8px" }}
          >
            Cancel
          </button>
        )}
      </div>

    </div>
  </div>
</form>

      {/* Requests Table */}
      {/* Requests Table */}
      <div className="quantum-card">
        <h3 className="quantum-heading">Requests Details</h3>
        <table className="quantum-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Model</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((item) => {
              const recordId  = item._id || item.id;
              return (
                <tr key={recordId}>
                  <td>{item.title || item.name}</td>
                  <td>{item.description}</td>
                  <td>{item.model || item.type || "normal"}</td>
                  <td>{item.status || "Draft"}</td>
                  <td>{item.priority || "Medium"}</td>
                  <td>
                    <div className="quantum-flex" style={{ gap: "8px" }}>
                      <button className="quantum-btn quantum-btn-warning" onClick={() => onEdit(item)}>
                        ✏ Edit
                      </button>
                      <button className="quantum-btn quantum-btn-danger" onClick={() => onDelete(recordId)}>
                        🗑 Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {paginated.length === 0 && (
              <tr>
                <td colSpan="6" className="muted" style={{ textAlign: "center" }}>
                  No records
                </td>
              </tr>
            )}
          </tbody>
        </table>

         {/* Pagination */}
        <div className="pagination">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}>
            Prev
          </button>
          <span>
           Page {currentPage} of {totalPages}
          </span>
          <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}