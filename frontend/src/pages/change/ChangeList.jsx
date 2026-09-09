import React from "react";
import "../../styles/changeQuantum.css";

export default function ChangeList() {
  return (
    <div className="quantum-page">
      <div className="quantum-page-header">
        <h2>Change Requests</h2>
        <p className="muted">List, filter and create change requests</p>
      </div>

      <div className="quantum-page-body">
        <div className="quantum-card">
          <h3>Requests table</h3>
          <p>Placeholder for a data table of change requests.</p>
        </div>
      </div>
    </div>
  );
}
