import { useEffect, useState } from "react";
import api from "../api/api";
import { useParams, useNavigate } from "react-router-dom";

export default function AssetEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    category: "",
    status: "In-Stock",
    assignedTo: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchAsset() {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get(`/api/assets/${id}`);
        // Unwraps nested { success: true, data: {...} } or raw object payloads
        const rawData = res.data?.data || res.data;

        if (isMounted && rawData) {
          setForm({
            name: rawData.assetTag || rawData.name || rawData.assetId || "",
            category: rawData.category || rawData.type || "",
            status: rawData.status || "In-Stock",
            assignedTo: rawData.assignedTo || rawData.owner || "",
            description: rawData.description || "",
          });
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.error || err.response?.data?.message || err.message || "Failed to load asset details."
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (id) fetchAsset();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const save = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put(`/api/assets/${id}`, form);
      navigate("/assets");
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || "Failed to update asset.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
        Loading asset details…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "2rem" }}>
        <div style={{ padding: "1rem", backgroundColor: "#fef2f2", color: "#b91c1c", borderRadius: "6px", border: "1px solid #fecaca", marginBottom: "1rem" }}>
          Error: {error}
        </div>
        <button
          onClick={() => navigate("/assets")}
          style={{ padding: "6px 16px", borderRadius: "4px", border: "1px solid #cbd5e1", backgroundColor: "#ffffff", cursor: "pointer" }}
        >
          Back to Assets List
        </button>
      </div>
    );
  }

 return (
    <div className="page" style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", margin: 0, color: "#0f172a" }}>
          Edit Asset
        </h1>
        <button
          onClick={() => navigate("/assets")}
          style={{ padding: "6px 14px", borderRadius: "4px", border: "1px solid #cbd5e1", backgroundColor: "#ffffff", cursor: "pointer" }}
        >
          Cancel
        </button>
      </div>

      <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: "1rem", backgroundColor: "#ffffff", padding: "1.5rem", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
        <div>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: "600", color: "#475569" }}>
            Asset Name / Tag:
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "4px" }}
            required
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: "600", color: "#475569" }}>
            Category:
          </label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "4px" }}
          >
            <option value="Hardware">Hardware</option>
            <option value="Software">Software</option>
            <option value="Network">Network</option>
            <option value="Peripheral">Peripheral</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: "600", color: "#475569" }}>
            Status:
          </label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "4px" }}
          >
            <option value="In-Stock">In-Stock</option>
            <option value="Active">Active</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Retired">Retired</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: "600", color: "#475569" }}>
            Assigned To:
          </label>
          <input
            type="text"
            value={form.assignedTo}
            onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
            style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "4px" }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: "600", color: "#475569" }}>
            Description:
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "4px" }}
          />
        </div>

        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
          <button
            type="submit"
            disabled={saving}
            style={{ padding: "8px 16px", borderRadius: "4px", border: "none", backgroundColor: saving ? "#93c5fd" : "#2563eb", color: "#ffffff", fontWeight: "600", cursor: saving ? "not-allowed" : "pointer" }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}