import { useState } from "react";
import CMDBDashboard from "../pages/cmdb/CMDBDashboard";
import CMDB from "../pages/CMDB";
import CMDBCharts from "../pages/cmdb/CMDBCharts";
import CMDBHeatmap from "../pages/cmdb/CMDBHeatmap";
import WorkspaceHeader from "../components/WorkspaceHeader";
import "../styles/workspace.css";


export default function CMDBWorkspace() {
  const [tab, setTab] = useState("dashboard");

  return (
    <div className="workspace-container">

      {/* HEADER */}
      <WorkspaceHeader
        title="CMDB Workspace"
        onAdd={() => console.log("Add CI clicked")}
      />

      {/* TABS */}
      <div className="workspace-tabs">
        <button onClick={() => setTab("dashboard")} className={tab === "dashboard" ? "active" : ""}>Dashboard</button>
        <button onClick={() => setTab("list")} className={tab === "list" ? "active" : ""}>List</button>
        <button onClick={() => setTab("charts")} className={tab === "charts" ? "active" : ""}>Charts</button>
        <button onClick={() => setTab("heatmap")} className={tab === "heatmap" ? "active" : ""}>Heatmap</button>
      </div>
      
      {/* ⭐ QUICK ACTIONS HERE ⭐ */}
      <div className="quick-actions">
        <button className="btn-secondary">Refresh</button>
        <button className="btn-secondary">Export</button>
        <button className="btn-secondary">Settings</button>
      </div>

      {/* CONTENT */}
      <div className="workspace-content">
        {tab === "dashboard" && <CMDBDashboard />}
        {tab === "list" && <CMDB />}
        {tab === "charts" && <CMDBCharts />}
        {tab === "heatmap" && <CMDBHeatmap />}
      </div>

    </div>
  );
}
