// ./src/pages/ChangeList.jsx
import React, { useEffect, useState } from "react";
// import { getChanges, deleteChange } from "../lib/changeApi.js";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";


export default function ChangeList() {
  const [changes, setChanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const res = await apiClient.get("/api/changes");
      // Handle both array responses and object-wrapped responses (e.g. res.data or res)
      const data = Array.isArray(res) ? res : res?.data || res?.changes || [];
      setChanges(data);
    } catch (err) {
      console.error("Failed to fetch changes:", err);
      setChanges([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (!window.confirm("Delete this change request?")) return;
    try {
      await apiClient.del(`/api/changes/${id}`);
      load();
    } catch (err) {
      console.error("Failed to delete change request:", err);
      alert("Failed to delete change request.");
    }
  };

  if (loading) {
    return <div>Loading change requests...</div>;
  }

  return (
    <div>
      <h2>Change Requests</h2>
      <button onClick={() => navigate("/changes/new")}>Add Change</button>

      {changes.length === 0 ? (
        <p>No change requests found.</p>
      ) : (
        <ul>
          {changes.map((c) => (
          <li key={c._id || c.id}>
            <strong>{c.title}</strong> — {c.state || c.status || "New"}
            <button onClick={() => navigate(`/changes/${c._id || c.id}`)}>View</button>
            <button onClick={() => navigate(`/changes/edit/${c._id || c.id}`)}>Edit</button>
            <button onClick={() => remove(c._id || c.id)}>Delete</button>
          </li>
        ))}
      </ul>
      )}
    </div>
  );
}
