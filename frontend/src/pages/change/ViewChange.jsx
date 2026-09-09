import React, { useEffect, useState } from "react";
import api from "../../api/apiClient";
import "../../styles/changeQuantum.css";
import { useNavigate } from "react-router-dom";

export default function ViewChange() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    api.get("/changes").then(res => { if (mounted) { setItems(res.data); setLoading(false); } }).catch(() => setLoading(false));
    return () => { mounted = false; };
  }, []);

  const onDelete = async (id) => {
    if (!window.confirm("Delete this change?")) return;
    try {
      await api.delete(`/changes/${id}`);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  return (
    <div className="quantum-page">
      <div className="quantum-page-header">
        <h2>Change Requests</h2>
        <p className="muted">View, edit or delete change requests</p>
      </div>

      <div className="quantum-page-body">
        <div className="quantum-card" style={{ gridColumn: "1 / -1" }}>
          {loading && <div className="muted">Loading…</div>}
          {!loading && items.length === 0 && <div className="muted">No changes</div>}
          {items.map(item => (
            <div key={item.id} className="list-row">
              <div>
                <div className="tile-title">{item.title}</div>
                <div className="muted">{item.model} • {new Date(item.createdAt).toLocaleString()}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => navigate(`/workspace/change/normal/${item.id}`)}>View</button>
                <button onClick={() => navigate(`/workspace/change/normal/${item.id}/edit`)}>Edit</button>
                <button onClick={() => onDelete(item.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
  