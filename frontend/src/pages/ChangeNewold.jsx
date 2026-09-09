import { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

export default function ChangeNew() {
  const navigate = useNavigate();

  const [change, setChange] = useState({
    title: "",
    description: "",
    status: "Open",
    requestedBy: ""
  });

  const saveChange = async () => {
    if (!change.title.trim()) return alert("Title is required");
    if (!change.requestedBy.trim()) return alert("Requested By is required");

    try {
      await api.post("/changes", change);
      alert("Change created successfully");
      navigate("/changes");
    } catch (err) {
      console.error("CREATE ERROR:", err);
      alert("Failed to create change");
    }
  };

  return (
    <MainLayout>
      <div className="change-details-page">
        <h1>Create Change</h1>

        {/* Title */}
        <div className="form-row">
          <label>Title</label>
          <input
            value={change.title}
            onChange={(e) => setChange({ ...change, title: e.target.value })}
            placeholder="Enter change title"
          />
        </div>

        {/* Description */}
        <div className="form-row">
          <label>Description</label>
          <textarea
            value={change.description}
            onChange={(e) =>
              setChange({ ...change, description: e.target.value })
            }
            placeholder="Describe the change request..."
          />
        </div>

        {/* Status */}
        <div className="form-row">
          <label>Status</label>
          <select
            value={change.status}
            onChange={(e) => setChange({ ...change, status: e.target.value })}
          >
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Requested By */}
        <div className="form-row">
          <label>Requested By</label>
          <input
            value={change.requestedBy}
            onChange={(e) =>
              setChange({ ...change, requestedBy: e.target.value })
            }
            placeholder="Team or person name"
          />
        </div>

        {/* Buttons */}
        <button className="btn-primary" onClick={saveChange}>
          Create Change
        </button>
      </div>
    </MainLayout>
  );
}
