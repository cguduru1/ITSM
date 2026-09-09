import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
// import api from "../api/api";
import apiClient from "../api/apiClient";
import MainLayout from "../layouts/MainLayout";

export default function EditCI() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState("");

  const load = async () => {
      try {
        const res = await api.get(`/cmdb/${id}`);
        setForm(res.data);
      } catch (err) {
        console.error("LOAD ERROR:", err);
      }
  };

  useEffect(() => {
    load();
  }, [id]);

  const updateField = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const validate = () => {
    const err = {};
    if (!form.name) err.name = "Required";
    if (!form.operational_status) err.operational_status = "Required";
    if (!form.environment) err.environment = "Required";
    if (!form.category) err.category = "Required";
    setErrors(err);
    return Object.keys(err).length === 0;
  };
  
    const save = async () => {
    if (!validate()) return;

    try {
      await api.put(`/api/cmdb/${id}`, form);
      showToast("CI updated successfully");
      setTimeout(() => {
        window.location.href = "/cmdb";
      }, 1000);
    } catch (err) {
      console.error("SAVE ERROR:", err);
      showToast("Failed to update CI");
    }
  };

  const submit = async () => {
    try {
      await api.put(`/cmdb/${id}`, form);
      alert("CI updated successfully");
      window.location.href = "/cmdb";
    } catch (err) {
      console.error(err);
      alert("Failed to update CI");
    }
  };

  return (
    <MainLayout>
      <div className="page-container add-ci-page">
        <h1>Edit Configuration Item</h1>
        
        {toast && <div className="toast">{toast}</div>}

        <div className="ci-form-grid">

          {/* LEFT SIDE */}
          <div className="ci-form-left">

            <div className="form-row">
              <label>Name *</label>
              <input
                name="name"
                value={form.name || ""}
                onChange={updateField}
              />
              {errors.name && <div className="error-msg">{errors.name}</div>}
            </div>

            <div className="form-row">
              <label>Status *</label>
              <select
                name="operational_status"
                value={form.operational_status || ""}
                onChange={updateField}
              >
                <option value="">Select</option>
                <option value="Active">Active</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Retired">Retired</option>
                <option value="Down">Down</option>
              </select>
              {errors.operational_status && (
                <div className="error-msg">{errors.operational_status}</div>
              )}
            </div>

            <div className="form-row">
              <label>Environment *</label>
              <select
                name="environment"
                value={form.environment || ""}
                onChange={updateField}
              >
                <option value="">Select</option>
                <option value="Production">Production</option>
                <option value="Staging">Staging</option>
                <option value="QA">QA</option>
                <option value="Development">Development</option>
              </select>
              {errors.environment && (
                <div className="error-msg">{errors.environment}</div>
              )}
            </div>

            <div className="form-row">
              <label>Category *</label>
              <select
                name="category"
                value={form.category || ""}
                onChange={updateField}
              >
                <option value="">Select</option>
                <option value="Server">Server</option>
                <option value="Database">Database</option>
                <option value="Network">Network</option>
                <option value="Application">Application</option>
                <option value="Storage">Storage</option>
                <option value="Security">Security</option>
              </select>
              {errors.category && (
                <div className="error-msg">{errors.category}</div>
              )}
            </div>

            <div className="form-row">
              <label>Asset Tag</label>
              <input
                name="asset_tag"
                value={form.asset_tag || ""}
                onChange={updateField}
              />
            </div>

            <div className="form-row">
              <label>Serial Number</label>
              <input
                name="serial_number"
                value={form.serial_number || ""}
                onChange={updateField}
              />
            </div>

            <div className="form-row">
              <label>Managed By</label>
              <input
                name="managed_by"
                value={form.managed_by || ""}
                onChange={updateField}
              />
            </div>

            <div className="form-row">
              <label>Maintenance Method</label>
              <input
                name="maintenance_method"
                value={form.maintenance_method || ""}
                onChange={updateField}
              />
            </div>
          </div>

          <div className="ci-form-grid">

          {/* LEFT  SIDE — FORM */}
          <div className="ci-form-left">
            ... all form fields here ...
          </div>

          {/* RIGHT SIDE — PREVIEW */}
          <div className="ci-preview">
            <h3>CI Preview</h3>
            <div className="preview-box">
              <p><strong>Name:</strong> {form.name || "—"}</p>
              <p><strong>Status:</strong> {form.operational_status || "—"}</p>
              <p><strong>Environment:</strong> {form.environment || "—"}</p>
              <p><strong>Category:</strong> {form.category || "—"}</p>
              <p><strong>Asset Tag:</strong> {form.asset_tag || "—"}</p>
              <p><strong>Serial Number:</strong> {form.serial_number || "—"}</p>
              <p><strong>Managed By:</strong> {form.managed_by || "—"}</p>
              <p><strong>Maintenance Method:</strong> {form.maintenance_method || "—"}</p>
            </div>
          </div>

        </div>

        {/* Sticky Save Button */}
        <div className="sticky-save">
          <button className="btn-primary" onClick={save}>Save</button>
        </div>

      </div>
    </div>
    </MainLayout>
  );
}