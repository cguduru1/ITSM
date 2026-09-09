import React, { useEffect, useState } from "react";
import { getLicenses, createAllocation, getAssets } from "../../api/assetApi";

export default function AllocationForm() {
  const [licenses, setLicenses] = useState([]);
  const [assets, setAssets] = useState([]);
  const [form, setForm] = useState({ licenseId: "", assetId: "", assignedUserId: "" });

  useEffect(() => { getLicenses().then(r => setLicenses(r.data)); getAssets().then(r => setAssets(r.data)); }, []);

  const submit = async () => {
    if (!form.licenseId) return alert("Select license");
    if (!form.assetId && !form.assignedUserId) return alert("Select asset or user");
    await createAllocation(form);
    alert("Allocated");
    setForm({ licenseId: "", assetId: "", assignedUserId: "" });
  };

  return (
    <div className="page">
      <h1>Allocate License</h1>
      <label>License
        <select value={form.licenseId} onChange={e => setForm({...form, licenseId: e.target.value})}>
          <option value="">Select</option>
          {licenses.map(l => <option key={l.licenseId} value={l.licenseId}>{l.softwareName}</option>)}
        </select>
      </label>

      <label>Asset (optional)
        <select value={form.assetId} onChange={e => setForm({...form, assetId: e.target.value})}>
          <option value="">None</option>
          {assets.map(a => <option key={a.assetId} value={a.assetId}>{a.assetTag} — {a.assetName}</option>)}
        </select>
      </label>

      <label>Assigned User ID (optional)
        <input value={form.assignedUserId} onChange={e => setForm({...form, assignedUserId: e.target.value})} />
      </label>

      <button onClick={submit}>Allocate</button>
    </div>
  );
}
