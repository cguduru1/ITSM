import React, { useState } from "react";
import { revokeAllocation } from "../../api/assetApi";

export default function AssetAllocationsTab({ allocations = [], assetId }) {
  const [items, setItems] = useState(allocations);

  async function handleRevoke(allocationId) {
    if (!window.confirm("Revoke this allocation?")) return;
    try {
      await revokeAllocation(allocationId);
      setItems(items.filter(a => a.allocationId !== allocationId));
      alert("Allocation revoked");
    } catch (err) {
      alert(err?.response?.data?.error || err?.message || "Failed to revoke");
    }
  }

  if (!items.length) return <div>No allocations</div>;

  return (
    <section>
      <h3>Allocations</h3>
      <div className="card">
        <table className="table">
          <thead><tr><th>License</th><th>User</th><th>Assigned At</th><th>Actions</th></tr></thead>
          <tbody>
            {items.map(a => (
              <tr key={a.allocationId}>
                <td><a href={`/licenses/${a.licenseId}`}>{a.licenseName || a.licenseId}</a></td>
                <td>{a.assignedTo || "-"}</td>
                <td>{a.assignedAt ? new Date(a.assignedAt).toLocaleString() : "-"}</td>
                <td><button className="btn btn-danger" onClick={() => handleRevoke(a.allocationId)}>Revoke</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
