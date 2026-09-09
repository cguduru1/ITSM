import React, { useState } from "react";

export function ITIncidentForm({ onSubmit }) {
  const [form, setForm] = useState({
    state: "New",
    impact: "3 - Low",
    urgency: "3 - Low",
    assignmentGroup: "",
    resolution: { code: "", notes: "" },
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}>
      {/* State Selection */}
      <select value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}>
        <option value="New">New</option>
        <option value="In Progress">In Progress</option>
        <option value="On Hold">On Hold</option>
        <option value="Resolved">Resolved</option>
        <option value="Closed">Closed</option>
      </select>

      {/* Mandatory Assignment Group validation check */}
      {form.state !== "New" && (
        <div>
          <label className="required">Assignment Group *</label>
          <input 
            type="text" 
            required 
            value={form.assignmentGroup} 
            onChange={(e) => setForm({ ...form, assignmentGroup: e.target.value })} 
          />
        </div>
      )}

      {/* UI POLICY: Hidden until State === 'Resolved' */}
      {form.state === "Resolved" && (
        <fieldset className="resolution-section border p-4 my-4">
          <legend className="font-bold">Resolution Details</legend>
          
          <label>Resolution Code *</label>
          <select 
            required
            value={form.resolution.code} 
            onChange={(e) => setForm({ ...form, resolution: { ...form.resolution, code: e.target.value } })}
          >
            <option value="">Select Code...</option>
            <option value="Solved (Permanently)">Solved (Permanently)</option>
            <option value="Solved (Workaround)">Solved (Workaround)</option>
            <option value="Duplicate">Duplicate</option>
          </select>

          <label>Resolution Notes *</label>
          <textarea 
            required 
            value={form.resolution.notes} 
            onChange={(e) => setForm({ ...form, resolution: { ...form.resolution, notes: e.target.value } })} 
          />
        </fieldset>
      )}

      <button type="submit">Submit Incident</button>
    </form>
  );
}