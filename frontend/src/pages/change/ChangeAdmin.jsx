import React from "react";
import "../../styles/changeQuantum.css";

export default function ChangeAdmin() {
  return (
    <div className="quantum-page">
      <div className="quantum-page-header">
        <h2>Change Admin</h2>
        <p className="muted">Roles, approvers and mappings</p>
      </div>

      <div className="quantum-page-body">
        <div className="quantum-card">
          <h3>Administration</h3>
          <p>Manage roles, approval groups and model mappings.</p>
        </div>
      </div>
    </div>
  );
}
