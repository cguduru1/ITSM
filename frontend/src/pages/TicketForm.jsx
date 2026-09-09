import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import apiClient from "../api/apiClient";
import "../styles/ticket.css";

export default function TicketForm({ mode = "create" }) {
  const { user, currentUser } = useAuth();
  const activeUser = user || currentUser || JSON.parse(localStorage.getItem("user") || "{}");
  const { id } = useParams();
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ text: "", type: "" });

  const [caller, setCaller] = useState(currentUser?._id || "");

  const [configurationItem, setConfigurationItem] = useState("");
  const [cis, setCis] = useState([
  { id: "650c1f1e1f1e1f1e1f1e1f01", name: "Workstation-01" },
  { id: "650c1f1e1f1e1f1e1f1e1f02", name: "Laptop-042" },
  { id: "650c1f1e1f1e1f1e1f1e1f03", name: "VPN Gateway" },
  { id: "650c1f1e1f1e1f1e1f1e1f04", name: "Email Server" },
]);

  const [form, setForm] = useState({
    ticketType: "ITIncident",
    title: "",
    shortDescription: "",
    description: "",
    status: "New",
    state: "New",

    // Mandatory IT Fields
    caller: currentUser?._id || currentUser?.id || "",
    category: "Software",
    subcategory: "Email",
    configurationItem: "Workstation-01",

    // Lowercase Enums
    impact: "medium",
    urgency: "medium",
    priority: "P3",
    assignmentGroup: "",

    // Resolution fields
    resolutionCode: "",
    resolutionNotes: "",

    // HR Onboarding fields
    newHireName: "",
    targetStartDate: "",
    department: "",
    employmentType: "Full-Time",
    jobTitle: "",
    hiringManager: "",

    // Facilities fields
    location: "",
    floorSuiteRoom: "",
    maintenanceType: "Custodial",
    hazardsIdentified: false,
  });

  // Automatically update caller ID in form when logged-in user is loaded
  useEffect(() => {
    if (currentUser && (currentUser._id || currentUser.id)) {
      setForm((prev) => ({
        ...prev,
        caller: currentUser._id || currentUser.id,
      }));
    }
  }, [currentUser]);

  useEffect(() => {
  const userId = activeUser?._id || activeUser?.id;
  if (userId) {
    setForm((prev) => ({ ...prev, caller: userId }));
  }
}, [activeUser]);

  // Priority Matrix Calculator
  const calculatePriority = (impact, urgency) => {
    const key = `${impact.toLowerCase()}_${urgency.toLowerCase()}`;
    const matrix = {
      high_high: "P1",
      high_medium: "P2",
      medium_high: "P2",
      medium_medium: "P3",
      low_high: "P3",
      low_medium: "P4",
      low_low: "P4",
    };
    return matrix[key] || "P3";
  };

  const getCleanPriority = (val) => {
    if (!val) return "P3";
    if (val.includes("1") || val.toLowerCase().includes("critical")) return "P1";
    if (val.includes("2") || val.toLowerCase().includes("high")) return "P2";
    if (val.includes("3") || val.toLowerCase().includes("medium")) return "P3";
    if (val.includes("4") || val.toLowerCase().includes("low")) return "P4";
    return val;
  };

  // Generic Field Handler
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;

    setForm((prev) => {
      const updated = { ...prev, [name]: fieldValue };

      if (name === "status") updated.state = fieldValue;
      if (name === "state") updated.status = fieldValue;

      if (name === "impact" || name === "urgency") {
        const nextImpact = name === "impact" ? value : prev.impact;
        const nextUrgency = name === "urgency" ? value : prev.urgency;
        updated.priority = calculatePriority(nextImpact, nextUrgency);
      }

      return updated;
    });
  };

  // Load ticket data if editing
  useEffect(() => {
    if (mode === "edit" && id) {
      apiClient
        .get(`/api/tickets/${id}`)
        .then((res) => {
          const data = res?.data ?? res;
          setForm((prev) => ({
            ...prev,
            ...data,
            title: data.title || data.shortDescription || "",
            status: data.status || data.state || "New",
            caller: data.caller?._id || data.caller || currentUser?._id || currentUser?.id || "",
            impact: data.impact ? data.impact.charAt(0).toUpperCase() + data.impact.slice(1) : "Medium",
            urgency: data.urgency ? data.urgency.charAt(0).toUpperCase() + data.urgency.slice(1) : "Medium",
            resolutionCode: data.resolution?.code || data.resolutionCode || "",
            resolutionNotes: data.resolution?.notes || data.resolutionNotes || "",
          }));
        })
        .catch((err) => {
          console.error("Failed to load ticket:", err);
          setFeedback({ text: "❌ Failed to load ticket data", type: "error" });
        });
    }
  }, [mode, id, currentUser]);

  //   useEffect(() => {
  //   // Fetch CMDB items from backend
  //   // fetch("/api/cmdb")
  //   //   .then((res) => res.json())
  //   //   .then((data) => setCis(data));

  //     apiClient.get("/api/configuration-items")
  //       .then((res) => {
  //       // Ensure you target the array in the response object
  //       const data = res.data?.cis || res.data?.items || res.data || [];
  //       setCis(Array.isArray(data) ? data : []);
  // })
  // .catch(() => setCis([]));
  // }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback({ text: "", type: "" });

    // Resolve caller ID strictly to pass required rule
  const callerId = 
    form.caller || 
    currentUser?._id || 
    currentUser?.id || 
    activeUser?._id || 
    activeUser?.id || 
    JSON.parse(localStorage.getItem("user") || "{}")._id;
    
  if (!callerId) {
    setFeedback({
      text: "❌ Unable to identify logged-in user. Please re-login.",
      type: "error",
    });
    setSaving(false);
    return;
  }

    const currentStatus = form.status || form.state;

    // 1. Mandatory Assignment Group Guard
    if (currentStatus !== "New" && !form.assignmentGroup.trim()) {
      setFeedback({
        text: "❌ Assignment Group is required when moving ticket out of 'New' status.",
        type: "error",
      });
      setSaving(false);
      return;
    }

    // 2. Mandatory Resolution Fields Guard
    if (currentStatus === "Resolved" && (!form.resolutionCode || !form.resolutionNotes.trim())) {
      setFeedback({
        text: "❌ Resolution Code and Resolution Notes are mandatory when state is Resolved.",
        type: "error",
      });
      setSaving(false);
      return;
    }

    // Sanitize Configuration Item: Only send if it matches a valid 24-character ObjectId format
    const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
    const sanitizedCI = isValidObjectId(form.configurationItem) ? form.configurationItem : undefined;

    // Build sanitized nested resolution object
    const resolutionPayload = (form.resolutionCode && form.resolutionNotes)
      ? { code: form.resolutionCode, notes: form.resolutionNotes }
      : undefined;

      // Helper to extract clean capitalized enum ("2 - Medium" -> "Medium", "medium" -> "Medium")
    const formatEnum = (val) => {
      if (!val) return "Medium";
      const str = String(val).split("-").pop().trim();
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    // Helper to capitalize the first letter (e.g., "medium" -> "Medium")
    const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "Medium";

    // Helper to clean up casing (e.g. "medium" -> "Medium")
    const cleanCapitalize = (str) => {
      if (!str) return "Medium";
      const clean = str.split("-").pop().trim();
      return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
    };

    // Determine the correct string format based on the form's active ticket type
    let finalImpact = cleanCapitalize(form.impact);
    let finalUrgency = cleanCapitalize(form.urgency);

    if (form.ticketType === "ITIncident") {
      // ITIncidents explicitly need the numbered prefix matrix values
      finalImpact = form.impact.toLowerCase().includes("high") ? "1 - High" : form.impact.toLowerCase().includes("low") ? "3 - Low" : "2 - Medium";
      finalUrgency = form.urgency.toLowerCase().includes("high") ? "1 - High" : form.urgency.toLowerCase().includes("low") ? "3 - Low" : "2 - Medium";
    }

    const payload = {
      ...form,
      caller: callerId,
    impact: finalImpact,
    urgency: finalUrgency,
    priority: getCleanPriority(form.priority),
    shortDescription: form.shortDescription || form.title || "",
    configurationItem: form.configurationItem || cis[0]?.id || "650c1f1e1f1e1f1e1f1e1f01",
    ...(resolutionPayload && { resolution: resolutionPayload }),
    };

    try {
      if (mode === "edit" && id) {
        await apiClient.put(`/api/tickets/${id}`, payload);
        setFeedback({ text: "✅ Ticket updated successfully", type: "success" });
      } else {
        await apiClient.post("/api/tickets", payload);
        setFeedback({ text: "✅ Ticket created successfully", type: "success" });
      }
      setTimeout(() => navigate("/api/tickets"), 2000);
    } catch (err) {
      console.error("Failed to save ticket:", err);
      const errDetail = err.response?.data?.error || err.message || "Failed to save ticket";
      setFeedback({ text: `❌ ${errDetail}`, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ticket-panel quantum">
      <div className="ticket-header">
      <h1>{mode === "edit" ? "✏️ Edit Ticket" : "➕ Create Ticket"}</h1>
      <Link to="/ticketdashboard" className="quantum-link" style={{ color: '#ffffff' }}>
          ← Back to Dashboard
      </Link> 
      </div>

      {feedback.text && (
        <div style={{ padding: "10px 14px", background: feedback.type === "error" ? "#7f1d1d" : "#065f46", color: feedback.type === "error" ? "#fca5a5" : "#a7f3d0", borderRadius: "6px", marginBottom: "1rem" }}>
          {feedback.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-card">
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>Module / Ticket Type</label>
          <select name="ticketType" value={form.ticketType} onChange={handleChange} style={inputStyle}>
            <option value="ITIncident">IT Incident</option>
            <option value="HROnboarding">HR Onboarding</option>
            <option value="FacilitiesWorkOrder">Facilities Work Order</option>
          </select>
        </div>

        <label style={{ display: "block", marginBottom: "12px 0 4px 0" }}>Title *</label>
        <input name="title" value={form.title} onChange={handleChange} placeholder="Title" style={{ ...inputStyle}} required />

        <label style={{ display: "block", margin: "12px 0 4px 0" }}>Description *</label>
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" style={{ ...inputStyle, minHeight: "80px" }} required />

        <label style={{ display: "block", margin: "12px 0 4px 0" }}>Status</label>
        <select name="status" value={form.status} onChange={handleChange} style={selectStyle}>
          <option value="New">New</option>
          <option value="Assess">Assess</option>
          <option value="Authorize">Authorize</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Implement">Implement</option>
          <option value="Review">Review</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>

        <label style={{ display: "block", margin: "12px 0 4px 0" }}>Priority</label>
        <select name="priority" value={form.priority} onChange={handleChange} style={selectStyle}>
          <option value="P1">Critical</option>
          <option value="P2">High</option>
          <option value="P3">Medium</option>
          <option value="P4">Low</option>
        </select>

        {/* IMPACT FIELD */}
        <div style={{ marginTop: "12px" }}>
          <label htmlFor="impact">Impact *</label>
          <select
            id="impact"
            name="impact"
            value={form.impact}
            onChange={handleChange}
            className="form-select"
            required
          >
            <option value="1 - High">High</option>
            <option value="2 - Medium">Medium</option>
            <option value="3 - Low">Low</option>
          </select>
        </div>

        {/* URGENCY FIELD */}
        <div style={{ marginTop: "12px" }}>
          <label htmlFor="urgency">Urgency *</label>
          <select
            id="urgency"
            name="urgency"
            value={form.urgency}
            onChange={handleChange}
            className="form-select"
            required
          >
            <option value="1 - High">High</option>
            <option value="2 - Medium">Medium</option>
            <option value="3 - Low">Low</option>
          </select>
        </div>

        {/* IT INCIDENT SPECIFIC FIELDS */}
        {form.ticketType === "ITIncident" && (
          <fieldset className="incident-fieldset">
            <legend className="incident-legend">IT Incident Details</legend>
            <div className = "row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "12px" }}>
              <div className="col">
                <label>Requested By *</label>
                <input type="text" name="caller" value={activeUser?.name || activeUser?.email || activeUser?.username || "Guest User"} onChange={handleChange} placeholder="Requested By" style={{ ...inputStyle, backgroundColor: "#f1f5f9", cursor: "not-allowed" }} required readOnly />
                <input type="hidden" name="caller" value={form.caller || activeUser?._id || activeUser?.id || ""} />
              </div>
              <div className="col">
                <label htmlFor="configurationItem">Configuration Item</label>
                <select name="configurationItem" value={form.configurationItem} onChange={handleChange} style={selectStyle} required>
                  <option value="">-- Select CI --</option>
                  {cis.map((ci) => (
                    <option key={ci._id || ci.id} value={ci._id || ci.id}>
                      {ci.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label>Category *</label>
                <input name="category" value={form.category} onChange={handleChange} style={inputStyle} required />
              </div>
              <div>
                <label>Subcategory *</label>
                <input name="subcategory" value={form.subcategory} onChange={handleChange} style={inputStyle} required />
              </div>
            </div>
          </fieldset>
        )}

        {/* HR ONBOARDING SPECIFIC FIELDS */}
        {form.ticketType === "HROnboarding" && (
            <fieldset className="incident-fieldset">
            <legend style={legendStyle}>HR Onboarding Details</legend>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", marginBottom: "6px" }}>New Hire Name *</label>
              <input name="newHireName" value={form.newHireName} onChange={handleChange} placeholder="e.g. Jane Doe" style={inputStyle} required />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "12px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px" }}>Target Start Date</label>
                <input type="date" name="targetStartDate" value={form.targetStartDate} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px" }}>Department</label>
                <input name="department" value={form.department} onChange={handleChange} placeholder="e.g. Engineering" style={inputStyle} />
              </div>
              <div className="form-row">
                <label htmlFor="location">Location *</label>
                <input
                  id="location"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-row">
                <label htmlFor="jobTitle">Job Title *</label>
                <input
                  id="jobTitle"
                  name="jobTitle"
                  value={form.jobTitle}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px" }}>Employment Type</label>
                <select name="employmentType" value={form.employmentType} onChange={handleChange} style={selectStyle}>
                  <option value="Full-Time">Full-Time</option>
                  <option value="Part-Time">Part-Time</option>
                  <option value="Contractor">Contractor</option>
                  <option value="Intern">Intern</option>
                </select>
              </div>
              <div>
                 <label htmlFor="hiringManager">Hiring Manager</label>
                <input
    id="hiringManager"
    name="hiringManager"
    type="text"
    value={form.hiringManager}
    onChange={handleChange}
    className="form-input"
    placeholder="Enter Hiring Manager"
    required
  />
              </div>

            </div>
          </fieldset>
        )}

        {/* FACILITIES WORK ORDER SPECIFIC FIELDS */}
        {form.ticketType === "FacilitiesWorkOrder" && (
          <fieldset className="incident-fieldset">
            <legend style={legendStyle}>Facilities Work Order Details</legend>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "12px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px" }}>Location / Building *</label>
                <input name="location" value={form.location} onChange={handleChange} placeholder="e.g. Building A" style={inputStyle} required />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px" }}>Floor / Suite / Room</label>
                <input name="floorSuiteRoom" value={form.floorSuiteRoom} onChange={handleChange} placeholder="e.g. 3rd Floor, Room 302" style={inputStyle} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", alignItems: "center" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px" }}>Maintenance Type</label>
                <select name="maintenanceType" value={form.maintenanceType} onChange={handleChange} style={selectStyle}>
                  <option value="Custodial">Custodial</option>
                  <option value="HVAC">HVAC / Air Conditioning</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Structural">Structural</option>
                </select>
              </div>
              <div style={{ paddingTop: "20px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input type="checkbox" name="hazardsIdentified" checked={form.hazardsIdentified} onChange={handleChange} />
                  <span>Hazards Identified</span>
                </label>
              </div>
            </div>
          </fieldset>
        )}

        {/* ASSIGNMENT GROUP (Required when state moves beyond 'New') */}
        {form.status !== "New" && (
          <div style={{ marginTop: "12px" }}>
            <label style={{ display: "block", marginBottom: "4px" }}>Assignment Group *</label>
            <input name="assignmentGroup" value={form.assignmentGroup} onChange={handleChange} placeholder="e.g. Service Desk Tier 1" style={inputStyle} required />
          </div>
        )}

        {/* RESOLUTION SECTION (Required when 'Resolved') */}
        {(form.status === "Resolved" || form.state === "Resolved") && (
          <fieldset className="incident-fieldset">
            <legend style={{ ...legendStyle, color: "#15803d" }}>Resolution Section</legend>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", marginBottom: "6px" }}>Resolution Code *</label>
              <select name="resolutionCode" value={form.resolutionCode} onChange={handleChange} style={selectStyle} required>
                <option value="">Select Code...</option>
                <option value="Solved (Permanently)">Solved (Permanently)</option>
                <option value="Solved (Workaround)">Solved (Workaround)</option>
                <option value="Duplicate">Duplicate</option>
                <option value="Not Solved">Not Solved</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px" }}>Resolution Notes *</label>
              <textarea name="resolutionNotes" value={form.resolutionNotes} onChange={handleChange} placeholder="Detail the fix applied..." style={{ ...inputStyle, minHeight: "70px" }} required />
            </div>
          </fieldset>
        )}

        <button type="submit" disabled={saving} className="quantum-btn" style={{ marginTop: "16px", width: "100%", padding: "10px", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
          {saving ? "Saving…" : mode === "edit" ? "Update Ticket" : "Add Ticket"}
        </button>
      </form>
    </div>
  );
}

const selectStyle = {
  background: "#ffffff",
  color: "#0f172a",
  padding: "8px 12px",
  borderRadius: "6px",
  border: "1px solid #cbd5e1",
  width: "100%",
  boxSizing: "border-box",
};

const inputStyle = {
  padding: "8px 12px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  width: "100%",
  marginBottom: "10px",
  boxSizing: "border-box",
};

const fieldsetStyle = {
  border: "1px solid #ccc",
  borderRadius: "6px",
  padding: "12px",
  marginBottom: "16px",
  backgroundColor: "#f9f9f9",
};

const legendStyle = {
  fontWeight: "bold",
  fontSize: "1rem",
  color: "#333",
  padding: "0 6px",
};