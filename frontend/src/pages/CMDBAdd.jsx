import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import "../styles/cmdb.css";
import "../styles/ticket.css";

const DEFAULT_CI = {
  name: "",
  ci_class: "Custom CI",
  operational_status: "Operational",
  asset_tag: "",
  location: "",
  environment: "Prod",
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
  justification_doc: null // file object
};

export default function CMDBAdd({ onCiAdded }) {
  const navigate = useNavigate();
  const [ci, setCi] = useState(DEFAULT_CI);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [mandatory, setMandatory] = useState({
    associated_change: false,
    justification_doc: false
  });
  const fileInputRef = useRef(null);

  // Example dropdown options — replace with API data if available
  const ENV_OPTIONS = ["Production", "Test", "Development", "Staging"];
  const STATUS_OPTIONS = ["Operational", "Non-Operational", "Retired"];
  const CRITICALITY_OPTIONS = ["Critical", "High", "Medium", "Low"];
  const MAINT_OPTIONS = ["Manual Entry", "Bulk Import", "API Sync"];
  const ASSIGNMENT_GROUPS = ["Platform Team", "Network Team", "Security Team", "Service Desk"];
  const MANAGERS = ["Alice Kumar", "Ravi Patel", "S. Mehta", "Automation Bot"];

// Conditional mandatory fields when status is not Operational
  useEffect(() => {
    const nonOp = ci.operational_status !== "Operational";
    setMandatory({
      associated_change: nonOp,
      justification_doc: nonOp
    });

    // If status becomes Operational, clear conditional errors
    if (!nonOp) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.associated_change;
        delete copy.justification_doc;
        return copy;
      });
    }
  }, [ci.operational_status]);

  // Basic validation rules
  const validate = () => {
    const e = {};

    if (!ci.name.trim()) e.name = "Name is required";
    if (!ci.environment) e.environment = "Environment is required";
    if (!ci.business_criticality) e.business_criticality = "Select criticality";
    if (ci.serial_number && ci.serial_number.length < 3) e.serial_number = "Serial number is too short";

    if (mandatory.associated_change && !ci.associated_change?.trim()) {
      e.associated_change = "Associated Change is required for non‑operational CIs";
    }

    if (mandatory.justification_doc && !ci.justification_doc) {
      e.justification_doc = "Justification document is required for non‑operational CIs";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setCi(prev => ({ ...prev, justification_doc: file }));
    setErrors(prev => {
      const copy = { ...prev };
      if (file) delete copy.justification_doc;
      return copy;
    });
  };

  const handleSubmit = async (ev) => {
  ev.preventDefault();
  if (!validate()) return;

  setLoading(true);

  try {
    // 1. Create a payload that includes 'type' expected by Mongoose
    const payload = {
      ...ci,
      type: ci.ci_class || "Custom CI"
    };

    if (ci.justification_doc) {
      const form = new FormData();
      
      // 2. Append all properties to FormData
      Object.keys(payload).forEach((key) => {
        if (key === "justification_doc") {
          if (ci.justification_doc) {
            form.append("justification_doc", ci.justification_doc);
          }
        } else {
          // Send non-null values
          form.append(key, payload[key] ?? "");
        }
      });

      // Pass form directly (Axios will automatically calculate the multipart header)
      await apiClient.post("/api/cmdb", form);
    } else {
      await apiClient.post("/api/cmdb", payload);
    }

    alert("CI created successfully");
    if (onCiAdded) onCiAdded();
    else navigate("/cmdb");
  } catch (err) {
    console.error("CREATE ERROR:", err);
    alert("Failed to create CI. Check console for details.");
  } finally {
    setLoading(false);
  }
};

  // small helper to update fields
  const update = (key, value) => {
    setCi(prev => ({ ...prev, [key]: value }));
    setErrors(prev => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  return (
    <div className="quantum-form-surface">
      <div className="ticket-header"> 
      <header className="quantum-form-header">
        <h1>Create Configuration Item</h1>
        <p>Register a new CI into the Quantum CMDB</p>
        <Link to="/cmdb-dashboard" className="quantum-link" style={{ color: '#ffffff' }}>
          ← Back to Dashboard
        </Link>
      </header>
      </div>

      <form className="quantum-form" onSubmit={handleSubmit} noValidate>
        <section className="quantum-section">
          <h2 className="section-title">General Info</h2>

          <div className="grid-2">
            <div className="field">
              <label className="field-label">Name <span className="required">*</span></label>
              <input
                name="name"
                className={`field-input ${errors.name ? "invalid" : ""}`}
                value={ci.name}
                onChange={(e) => update("name", e.target.value)}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "err-name" : undefined}
              />
              {errors.name && <div id="err-name" className="field-error">{errors.name}</div>}
            </div>

            <div className="field">
              <label className="field-label">CI Class</label>
              <input name="ci_class" className="field-input readonly" value={ci.ci_class} readOnly />
            </div>

            <div className="field">
              <label className="field-label">Operational Status</label>
              <select
                name="operational_status"
                className="field-select"
                value={ci.operational_status}
                onChange={(e) => update("operational_status", e.target.value)}
              >
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="field">
              <label className="field-label">Environment</label>
              <select
                name="environment"
                className={`field-select ${errors.environment ? "invalid" : ""}`}
                value={ci.environment}
                onChange={(e) => update("environment", e.target.value)}
              >
                {ENV_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              {errors.environment && <div className="field-error">{errors.environment}</div>}
            </div>

            <div className="field">
              <label className="field-label">Location</label>
              <input name="location" className="field-input" value={ci.location} onChange={(e) => update("location", e.target.value)} />
            </div>

            <div className="field">
              <label className="field-label">Asset Tag</label>
              <input name="asset_tag" className="field-input" value={ci.asset_tag} onChange={(e) => update("asset_tag", e.target.value)} />
            </div>

            <div className="field">
              <label className="field-label">Serial Number</label>
              <input name="serial_number" className={`field-input ${errors.serial_number ? "invalid" : ""}`} value={ci.serial_number} onChange={(e) => update("serial_number", e.target.value)} />
              {errors.serial_number && <div className="field-error">{errors.serial_number}</div>}
            </div>

            <div className="field">
              <label className="field-label">Manufacturer</label>
              <input name="manufacturer" className="field-input" value={ci.manufacturer} onChange={(e) => update("manufacturer", e.target.value)} />
            </div>

            <div className="field">
              <label className="field-label">Model ID</label>
              <input name="model_id" className="field-input" value={ci.model_id} onChange={(e) => update("model_id", e.target.value)} />
            </div>
          </div>
        </section>

        <section className="quantum-section">
          <h2 className="section-title">Ownership and Governance</h2>

          <div className="grid-2">
            <div className="field">
              <label className="field-label">Managed By</label>
              <select name="managed_by" className="field-select" value={ci.managed_by} onChange={(e) => update("managed_by", e.target.value)}>
                <option value="">— Select manager —</option>
                {MANAGERS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="field">
              <label className="field-label">Assignment Group</label>
              <select name="assignment_group" className="field-select" value={ci.assignment_group} onChange={(e) => update("assignment_group", e.target.value)}>
                <option value="">— Select group —</option>
                {ASSIGNMENT_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div className="field">
              <label className="field-label">Supported By</label>
              <input name="supported_by" className="field-input" value={ci.supported_by} onChange={(e) => update("supported_by", e.target.value)} />
            </div>

            <div className="field">
              <label className="field-label">Business Criticality</label>
              <select name="business_criticality" className={`field-select ${errors.business_criticality ? "invalid" : ""}`} value={ci.business_criticality} onChange={(e) => update("business_criticality", e.target.value)}>
                {CRITICALITY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.business_criticality && <div className="field-error">{errors.business_criticality}</div>}
            </div>
          </div>
        </section>

        <section className="quantum-section">
          <h2 className="section-title">Audit Trail</h2>

          <div className="grid-2">
            <div className="field">
              <label className="field-label">Maintenance Method</label>
              <select name="maintenance_method" className="field-select" value={ci.maintenance_method} onChange={(e) => update("maintenance_method", e.target.value)}>
                {MAINT_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="field">
              <label className="field-label">Last Attested</label>
              <input name="last_attested" className="field-input" type="datetime-local" value={ci.last_attested} onChange={(e) => update("last_attested", e.target.value)} />
            </div>

            <div className="field">
              <label className="field-label">Attested By</label>
              <input name="attested_by" className="field-input" value={ci.attested_by} onChange={(e) => update("attested_by", e.target.value)} />
            </div>

            <div className="field">
              <label className="field-label" style={{ color: mandatory.associated_change ? "#ff6b6b" : "inherit" }}>
                Associated Change {mandatory.associated_change && <span className="required">(Required)</span>}
              </label>
              <input name="associated_change" className={`field-input ${errors.associated_change ? "invalid" : ""}`} value={ci.associated_change} onChange={(e) => update("associated_change", e.target.value)} />
              {errors.associated_change && <div className="field-error">{errors.associated_change}</div>}
            </div>

            <div className="field">
              <label className="field-label" style={{ color: mandatory.justification_doc ? "#ff6b6b" : "inherit" }}>
                Justification Document {mandatory.justification_doc && <span className="required">(Required)</span>}
              </label>

              <div className="file-row">
                <input
                  ref={fileInputRef}
                  name="justification_doc"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                />
                {ci.justification_doc && <span className="file-name">{ci.justification_doc.name}</span>}
              </div>

              {errors.justification_doc && <div className="field-error">{errors.justification_doc}</div>}
            </div>
          </div>
        </section>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)} disabled={loading}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Saving..." : "Create CI"}
          </button>
        </div>
      </form>
    </div>
  );
}