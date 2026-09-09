import React from "react";
import { NavLink } from "react-router-dom";

export default function QuantumSidebar({ module }) {
  if (module !== "change") return null;

  const links = [
    { to: "/workspace/change", label: "Overview" },
    { to: "/changes/list", label: "Change Requests" },
    { to: "/changes/normal", label: "Normal Change" },
    { to: "/changes/standard", label: "Standard Change" },
    { to: "/changes/emergency", label: "Emergency Change" },
    { to: "/changes/devops", label: "DevOps Models" },
    { to: "/changes/csdm", label: "CI Mapping CSDM" },
    { to: "/changes/risk", label: "Risk Engine" },
    { to: "/changes/conflicts", label: "Conflict Detection" },
    { to: "/changes/decisions", label: "Decision Tables" },
    { to: "/changes/ops", label: "Service Ops" },
    { to: "/changes/cab", label: "CAB Workbench" },
    { to: "/changes/success", label: "Success Score" },
    { to: "/changes/admin", label: "Admin" }
  ];

  return (
    <aside className="quantum-sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">🔄</div>
        <div className="brand-text">Change Workspace</div>
      </div>

      <nav className="sidebar-nav">
        {links.map(l => (
          <NavLink key={l.to} to={l.to} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            {l.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
