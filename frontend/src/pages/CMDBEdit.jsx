//src/pages/CMDBEdit.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import { useAuth } from "../auth/AuthContext";
import "../styles/cmdb.css";

export default function CMDBEdit() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: "",
    ci_class: "Custom CI",
    operational_status: "Operational",
    environment: "Production",
    location: "",
    asset_tag: "",
    serial_number: "",
    manufacturer: "",
    model_id: "",
    managed_by: "",
    assignment_group: "",
    supported_by: "",
    business_criticality: "Low",
    maintenance_method: "Manual Entry",
    last_attested: "",
    attested_by: "",
    associated_change: "",
  });

  const [justificationDoc, setJustificationDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Example dropdown options — replace with API data if available
  const ENV_OPTIONS = ["Production", "Test", "Development", "Staging"];
  const STATUS_OPTIONS = ["Operational", "Non-Operational", "Retired"];
  const CRITICALITY_OPTIONS = ["Critical", "High", "Medium", "Low"];
  const MAINT_OPTIONS = ["Manual Entry", "Bulk Import", "API Sync"];
  const ASSIGNMENT_GROUPS = ["Platform Team", "Network Team", "Security Team", "Service Desk"];
  const MANAGERS = ["Alice Kumar", "Ravi Patel", "S. Mehta", "Automation Bot"];

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      
      try {
        const res = await apiClient.get(`/api/cmdb/${id}`);
        // alert("RAW AXIOS RES: " + JSON.stringify(res.data));

        // Extract data object
      // Apply the same unpacking strategy as fetchCis
      const responseData = res?.data ?? res;

      // Extract record if nested inside .data or .ci property, otherwise use directly
      const data = responseData?.data || responseData?.ci || responseData || {};
      console.log("Extracted Data:", data);

        // Normalize Environment values ("Prod" -> "Production")
          let envVal = data.environment || "Production";
          if (envVal === "Prod") envVal = "Production";

        console.log("EXACT DB RECORD KEYS:", data);
        
        // Format datetime-local string
        let formattedDate = "";
        if (data.last_attested) {
          try {
            formattedDate = new Date(data.last_attested).toISOString().slice(0, 16);
          } catch (e) {
            console.error("Invalid date value:", data.last_attested);
          }
        } 

        // Populate form state directly so inputs display data
        setForm({
          name: data.name ?? "",
          ci_class: data.ci_class || data.ciClass || "Custom CI",
          operational_status: data.operational_status ?? "Operational",
          environment: envVal,
          location: data.location ?? "",
          asset_tag: data.asset_tag ?? "",
          serial_number: data.serial_number ?? "",
          manufacturer: data.manufacturer ?? "",
          model_id: data.model_id ?? "",
          managed_by: data.managed_by ?? "",
          assignment_group: data.assignment_group ?? "",
          supported_by: data.supported_by ?? "",
          business_criticality: data.business_criticality ?? "Low",
          maintenance_method: data.maintenance_method ?? "Manual Entry",
          last_attested: formattedDate,
          attested_by: data.attested_by ?? "",
          associated_change: data.associated_change ?? "",
        });
      } catch (err) {
        console.error("Failed to fetch CI details:", err);
        setError("Failed to load CI details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail(); // Executing the function inside useEffect
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      if (justificationDoc) {
        const formData = new FormData();
        Object.keys(form).forEach((key) => {
          formData.append(key, form[key] ?? "");
        });
        formData.append("justification_doc", justificationDoc);

        await apiClient.put(`/api/cmdb/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await apiClient.put(`/api/cmdb/${id}`, form);
      }
      nav("/cmdb");
    } catch (err) {
      console.error("Failed to update CI:", err);
    }
  };

  const handleRemove = async () => {
    if (!window.confirm("Are you sure you want to delete this CI?")) return;
    try {
      await apiClient.delete(`/api/cmdb/${id}`);
      nav("/cmdb");
    } catch (err) {
      console.error("Failed to delete CI:", err);
    }
  };

  if (loading) return <div className="cmdb-root">Loading CI details...</div>;
  if (error) return <div className="cmdb-root">{error}</div>;

  return (

    <div className="quantum-form-surface">
      <header className="quantum-form-header">
        <h1 className="quantum-title">Edit Configuration Item</h1>
        <p className="quantum-subtitle">View and Edit CI into the Quantum CMDB</p>
      </header>


    <form className="quantum-form" onSubmit={handleUpdate} noValidate>
      {/* ================= GENERAL INFO ================= */}
      <section className="quantum-section">
        <h2 className="section-title">General Info</h2>

        <div className="grid-2">
          <div className="field">
            <label className="field-label">Name <span className="required">*</span></label>
            <input type="text" name="name" value={form.name} onChange={handleChange} required />
          </div>

          <div className="field">
            <label className="field-label">CI Class</label>
            <input type="text" name="ci_class" value={form.ci_class} onChange={handleChange} />
          </div>

          <div className="field">
            <label className="field-label">Operational Status</label>
            <select name="operational_status" value={form.operational_status} onChange={handleChange}>
              <option value="Operational">Operational</option>
              <option value="Non-Operational">Non-Operational</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Retired">Retired</option>
            </select>
          </div>

          <div className="field">
            <label className="field-label">Environment</label>
            <select name="environment" value={form.environment} onChange={handleChange}>
              <option value="Prod">Production</option>
              <option value="Staging">Staging</option>
              <option value="Development">Development</option>
              <option value="QA">QA</option>
            </select>
          </div>

          <div className="field">
            <label className="field-label">Location</label>
            <input type="text" name="location" value={form.location} onChange={handleChange} />
          </div>

          <div className="field">
            <label className="field-label">Asset Tag</label>
            <input type="text" name="asset_tag" value={form.asset_tag} onChange={handleChange} />
          </div>

          <div className="field">
            <label className="field-label">Serial Number</label>
            <input type="text" name="serial_number" value={form.serial_number} onChange={handleChange} />
          </div>

          <div className="field">
            <label className="field-label">Manufacturer</label>
            <input type="text" name="manufacturer" value={form.manufacturer} onChange={handleChange} />
          </div>
          <div className="field">
            <label className="field-label">Model ID</label>
            <input type="text" name="model_id" value={form.model_id} onChange={handleChange} />
          </div>
        </div>
      </section>
      
        {/* ================= OWNERSHIP & GOVERNANCE ================= */}
      <section className="quantum-section">
        <h2 className="section-title">Ownership and Governance</h2>

        <div className="grid-2">
          <div className="field">
            <label className="field-label">Managed By</label>
              <select name="managed_by" className="field-select" value={form.managed_by} onChange={handleChange}>
                <option value="">— Select manager —</option>
                {MANAGERS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
          </div>
          
          <div className="field">
            <label className="field-label">Assignment Group</label>
              <select name="assignment_group" className="field-select" value={form.assignment_group} onChange={handleChange}>
                <option value="">— Select group —</option>
                {ASSIGNMENT_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
          </div>

          <div className="field">
            <label className="field-label">Supported By</label>
            <input type="text" name="supported_by" value={form.supported_by} onChange={handleChange} />
          </div>

          <div className="field">
            <label className="field-label">Business Criticality</label>
              <select name="business_criticality" value={form.business_criticality} onChange={handleChange}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
          </div>
        </div>
      </section>

        {/* ================= AUDIT TRAIL ================= */}
      <section className="quantum-section">
        <h2 className="section-title">Audit Trail</h2>

        <div className="grid-2">
          <div className="field">
            <label className="field-label">Maintenance Method</label>
              <select name="maintenance_method" value={form.maintenance_method} onChange={handleChange}>
                <option value="Manual Entry">Manual Entry</option>
                <option value="Automated Discovery">Automated Discovery</option>
              </select>
          </div>

          <div className="field">
            <label className="field-label">Last Attested</label>
            <input type="datetime-local" name="last_attested" value={form.last_attested} onChange={handleChange} />
          </div>

          <div className="field">
            <label className="field-label">Attested By</label>
            <input type="text" name="attested_by" value={form.attested_by} onChange={handleChange} />
          </div>

          <div className="field">
            <label className="field-label"> Associated Change </label>
            <input type="text" name="associated_change" value={form.associated_change} onChange={handleChange} />
          </div>

          <div className="file-row">
            <label className="field-label">Justification Document</label>
            <input type="file" name="justification_doc" accept=".pdf,.doc,.docx,.txt" onChange={(e) => setJustificationDoc(e.target.files[0])} />
            {justificationDoc && <span className="file-name">{justificationDoc.name}</span>}
          </div>
        </div>
      </section>

        {/* ================= BUTTON ACTIONS ================= */}
      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={() => nav(-1)} disabled={loading}>
          Cancel
        </button>

        {user?.permissions?.cmdb?.includes("delete") && (
          <button type="button" className="btn-delete" onClick={handleRemove}>
            Delete
          </button>
        )}

        <button type="submit" className="btn primary">
          Update CI
        </button>
      </div>
    </form>
    </div>
  );
}