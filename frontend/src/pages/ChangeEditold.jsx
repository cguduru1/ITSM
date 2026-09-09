import { useEffect, useState } from "react";
import api from "../api/api";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

export default function ChangeEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [change, setChange] = useState(null);

  useEffect(() => {
    api.get(`/changes/${id}`)
      .then((res) => setChange(res.data))
      .catch((err) => console.error("LOAD ERROR:", err));
  }, [id]);

  if (!change) {
    return (
      <MainLayout>
        <p>Loading...</p>
      </MainLayout>
    );
  }

  const saveChange = async () => {
    try {
      await api.put(`/changes/${id}`, change);
      alert("Change updated successfully");
      navigate("/changes");
    } catch (err) {
      console.error("UPDATE ERROR:", err);
      alert("Failed to update change");
    }
  };

  const deleteChange = async () => {
    if (!window.confirm("Delete this change?")) return;

    try {
      await api.delete(`/changes/${id}`);
      alert("Change deleted");
      navigate("/changes");
    } catch (err) {
      console.error("DELETE ERROR:", err);
      alert("Failed to delete change");
    }
  };

  return (
    <MainLayout>
      <div className="change-details-page">
        <h1>Edit Change</h1>

        {/* Title */}
        <div className="form-row">
          <label>Title</label>
          <input
            value={change.title}
            onChange={(e) => setChange({ ...change, title: e.target.value })}
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
          />
        </div>

        {/* Buttons */}
        <button className="btn-primary" onClick={saveChange}>
          Save
        </button>

        <button className="btn-danger" onClick={deleteChange}>
          Delete
        </button>
      </div>
    </MainLayout>
  );
}
