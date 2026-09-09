import React from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import apiClient from "../../api/apiClient";
import "../../styles/changeQuantum.css";
import "../../styles/cmdb.css";

export default function NormalChange() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: { title: "", description: "", template: "" }
  });

  const onSubmit = async (formData) => {
    // 1. Construct payload with valid Mongoose status enum value
    const payload = {
    title: formData.title,
    description: formData.description,
    template: formData.template,
    type: "Normal",
    state: "Draft",
    status: "Open",
    priority: "Medium",
    riskLevel: "Low",
    requestedBy: "Admin User"
  };

    console.log("Submitting payload to backend:", payload);

    const token = localStorage.getItem("token") || localStorage.getItem("accessToken");

    try {
      const response = await fetch("http://localhost:4000/api/changes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      // 2. Parse response safely
      const rawText = await response.text();
      let resData;
      try {
        resData = JSON.parse(rawText);
      } catch {
        resData = { rawResponse: rawText };
      }

      if (!response.ok) {
        console.error("Backend Stack Trace / Error Details:", resData);
        throw new Error(
          resData?.message || resData?.error || `Server returned status ${response.status}`
        );
      }

      alert("Change created: " + (resData.title || payload.title));
    } catch (err) {
      console.error("Submission Error:", err);
      alert(`Backend Error: ${err.message}`);
    }
  };

  const onError = (formErrors) => {
    console.warn("Validation failed:", formErrors);
  };

  return (
    <div className="quantum-page">
      {/* Header */}
      <div className="ticket-header">
      <header className="quantum-header">
        <h1>📝 Normal Change</h1>
        <p>
          Create and manage Normal change templates
        </p>
        <Link to="/workspace/change" className="quantum-link" style={{ color: '#ffffff' }}>
                  ← Back to Dashboard
                </Link>
      </header>
      </div>

      {/* Form */}
      <form
        id="normal-change-form"
        className="quantum-form"
        onSubmit={handleSubmit(onSubmit, onError)}
      >
        <div className="quantum-card quantum-form-body">
          {/* Title */}
          <div className="quantum-form-row">
            <label className="quantum-label">
              Title <span className="quantum-required">*</span>
            </label>
            <input
              {...register("title", { required: "Title is required" })}
              className="quantum-input"
              placeholder="Enter title"
            />
            {errors.title && (
              <span className="quantum-error">{errors.title.message}</span>
            )}
          </div>

          {/* Template */}
          <div className="quantum-form-row">
            <label className="quantum-label">Template</label>
            <select {...register("template")} className="quantum-input">
              <option value="">Select template</option>
              <option value="Template 1">Template 1</option>
              <option value="Template 2">Template 2</option>
            </select>
          </div>

          {/* Description */}
          <div className="quantum-form-row">
            <label className="quantum-label">Description</label>
            <textarea
              {...register("description")}
              rows={4}
              className="quantum-input"
              placeholder="Enter detailed description"
            />
          </div>

          {/* Submit */}
          <div className="quantum-form-actions">
            <button
              type="submit"
              className="quantum-btn quantum-btn-primary"
              form="normal-change-form"
            >
              ➕ Create
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}