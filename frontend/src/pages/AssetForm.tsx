import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createAsset } from "../api/assets";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../styles/assets.css";
import "../styles/ticket.css";

export default function AssetForm() {
  const [formData, setFormData] = useState({
    assetTag: "",
    category: "Hardware",
    status: "In-Stock",
    description: "",
    assignedTo: "",
    relationship: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.assetTag.trim()) {
      setError("Asset Tag is required.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await createAsset({
        assetTag: formData.assetTag.trim(),
        modelId: "MOD-1001",
        category: formData.category,
        status: formData.status,
        description: formData.description.trim(),
        assignedTo: formData.assignedTo.trim(),
        relationship: formData.relationship.trim(),
      });

      setSuccessMsg(`Asset "${formData.assetTag.trim()}" created successfully!`);
      toast.success("Asset created successfully!");
      setTimeout(() => navigate("/assets"), 1500);
    } catch (err: any) {
      console.error("Failed to create asset:", err);
      setError(err.response?.data?.error || err.message || "Failed to create asset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto my-10 p-8 bg-white rounded-xl border border-slate-200 shadow-lg">
      <div className="ticket-header"> 
      <h1>Create New Asset</h1>
      <Link to="/assets" className="quantum-link" style={{ color: '#ffffff' }}>
        ← Back to Dashboard
      </Link>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg text-sm shadow-sm">
          ✅ {successMsg}
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-300 text-rose-800 rounded-lg text-sm shadow-sm">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={submit} className="quantum-card">
  <table className="quantum-table">
    <tbody>
      <tr>
        <td className="quantum-label">Asset Tag *</td>
        <td>
          <input
            type="text"
            name="assetTag"
            value={formData.assetTag}
            onChange={handleChange}
            placeholder="e.g. AST-1001"
            disabled={loading}
            className="quantum-input"
            required
          />
        </td>
      </tr>
      <tr>
        <td className="quantum-label">Category</td>
        <td>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            disabled={loading}
            className="quantum-select"
          >
            <option value="Hardware">Hardware</option>
            <option value="Software">Software</option>
            <option value="Network">Network</option>
            <option value="Peripheral">Peripheral</option>
          </select>
        </td>
      </tr>
      <tr>
        <td className="quantum-label">Status</td>
        <td>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            disabled={loading}
            className="quantum-select"
          >
            <option value="In-Stock">In-Stock</option>
            <option value="Active">Active</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Retired">Retired</option>
          </select>
        </td>
      </tr>
      <tr>
        <td className="quantum-label">Assigned To (Owner)</td>
        <td>
          <input
            type="text"
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleChange}
            placeholder="e.g. John Doe"
            disabled={loading}
            className="quantum-input"
          />
        </td>
      </tr>
      <tr>
        <td className="quantum-label">Relationship / Connected CI</td>
        <td>
          <input
            type="text"
            name="relationship"
            value={formData.relationship}
            onChange={handleChange}
            placeholder="e.g. Connected to Server-01"
            disabled={loading}
            className="quantum-input"
          />
        </td>
      </tr>
      <tr>
        <td className="quantum-label">Description</td>
        <td>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter comprehensive asset details..."
            rows={4}
            disabled={loading}
            className="quantum-textarea"
          />
        </td>
      </tr>
    </tbody>
  </table>

  <div className="quantum-actions">
    <button
      type="button"
      onClick={() => navigate("/assets")}
      className="quantum-btn quantum-btn-secondary"
    >
      Cancel
    </button>
    <button
      type="submit"
      disabled={loading || !formData.assetTag.trim()}
      className="quantum-btn quantum-btn-primary"
    >
      {loading ? "Creating..." : "Save Asset"}
    </button>
  </div>
</form>

    </div>
  );
}
