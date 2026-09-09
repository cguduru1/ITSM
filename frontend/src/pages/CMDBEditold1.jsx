//src/pages/CMDBEdit.jsx
import React, { useEffect, useState } from "react";
// import api from "../api/api";
import apiClient from "../api/apiClient";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "../styles/cmdb.css";

export default function CMDBEdit() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({});

  useEffect(() => {
    if (!id) return;
    apiClient.get(`/cmdb/${id}`)
      .then(res => setForm(res.data))
      .catch(err => console.error("Failed to fetch CI:", err));
  }, [id]);

  const save = async () => {
    try {
      await apiClient.put(`/api/cmdb/${id}`, form);
      nav("/cmdb");
    } catch (err) {
      console.error("Failed to update CI:", err);
    }
  };

  const remove = async () => {
    try {
      await apiClient.delete(`/api/cmdb/${id}`);
      nav("/cmdb");
    } catch (err) {
      console.error("Failed to delete CI:", err);
    }
  };

  return (
    <div className="cmdb-root">
      <div className="cmdb-header">
        <h1>Edit CI</h1>
      </div>

      <div className="cmdb-panel quantum">
        <input 
          placeholder="Name"
          value={form.name || ""} 
          onChange={e => setForm({ ...form, name: e.target.value })} 
        />
        <input 
          placeholder="Type"
          value={form.type || ""} 
          onChange={e => setForm({ ...form, type: e.target.value })} 
        />
        <input 
          placeholder="Environment"
          value={form.environment || ""} 
          onChange={e => setForm({ ...form, environment: e.target.value })} 
        />
        <input 
          placeholder="Department"
          value={form.department || ""} 
          onChange={e => setForm({ ...form, department: e.target.value })} 
        />
        <input 
          placeholder="Criticality"
          value={form.criticality || ""} 
          onChange={e => setForm({ ...form, criticality: e.target.value })} 
        />

        <button className="cmdb-btn" onClick={save}>
          Update
        </button>

        {/* Optional chain user checks to prevent undefined crashes */}
        {user?.permissions?.cmdb?.includes("delete") && (
          <button className="cmdb-link danger" onClick={remove}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
