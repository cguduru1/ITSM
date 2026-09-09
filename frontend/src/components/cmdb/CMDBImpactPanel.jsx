// src/components/cmdb/CMDBImpactPanel.jsx
import React from "react";

export default function CMDBImpactPanel({ impact }) {
  if (!impact) return null;

  return (
    <div className="cmdb-panel quantum">
      <h2>Downstream Impact</h2>
      <ul>
        {impact.downstream.map(ci => (
          <li key={ci._id}>
            {ci.name} ({ci.type}) · {ci.environment} · {ci.department}
          </li>
        ))}
      </ul>
    </div>
  );
}
