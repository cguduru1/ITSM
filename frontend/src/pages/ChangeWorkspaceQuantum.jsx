// ./src/pages/ChangeWorkspaceQuantum.jsx
import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import "../styles/changeQuantum.css";
import QuantumSidebar from "../components/QuantumSidebar";

export default function ChangeWorkspaceQuantum() {
  const navigate = useNavigate();

  const sections = [
    {
      title: "Core Architecture & Models",
      tiles: [
        { label: "Normal Change", link: "/changes/normal", icon: "🔄" },
        { label: "Standard Change", link: "/changes/standard", icon: "📋" },
        { label: "Emergency Change", link: "/changes/emergency", icon: "⚡" },
        { label: "DevOps / Infra Models", link: "/changes/devops", icon: "💻" },
        { label: "CI Mapping (CSDM)", link: "/changes/csdm", icon: "🧩" }
      ]
    },
    {
      title: "Automation & Risk Governance",
      tiles: [
        { label: "Risk Assessment Engine", link: "/changes/risk", icon: "📊" },
        { label: "Conflict Detection", link: "/changes/conflicts", icon: "🚨" },
        { label: "Decision Tables", link: "/changes/decisions", icon: "🗂️" }
      ]
    },
    {
      title: "Operations & Review",
      tiles: [
        { label: "Service Ops Workspace", link: "/changes/ops", icon: "🛠️" },
        { label: "CAB Workbench", link: "/changes/cab", icon: "👥" },
        { label: "Change Success Score", link: "/changes/success", icon: "📈" }
      ]
    }
  ];

 return (
    <div className="quantum-workspace-root">
      <QuantumSidebar module="change" />
      <main className="quantum-main">
        <header className="quantum-main-header">
          <div>
            <h1 className="quantum-main-title">Change Management Workspace</h1>
            <p className="quantum-main-sub">Models, risk governance, operations and CAB</p>
          </div>
        </header>

        <section className="quantum-main-body">
          <Outlet />
        </section>
      </main>
    </div>
  );
}