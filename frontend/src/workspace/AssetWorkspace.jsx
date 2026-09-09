import { useState } from "react";
import AssetDashboard from "../pages/assets/AssetDashboard";
import Assets from "../pages/Assets";
import AssetCharts from "../pages/assets/AssetCharts";
import AssetHeatmap from "../pages/assets/AssetHeatmap";
import AssetLifecycle from "../pages/AssetLifecycle";
import "../styles/workspace.css";


export default function AssetWorkspace() {
  const [tab, setTab] = useState("dashboard");

  return (
    <div className="workspace-container">

      <div className="workspace-header">
        <h1>Asset Workspace</h1>
        <button className="btn-primary">+ Add Asset</button>
      </div>

      <div className="workspace-tabs">
        <button onClick={() => setTab("dashboard")} className={tab === "dashboard" ? "active" : ""}>Dashboard</button>
        <button onClick={() => setTab("list")} className={tab === "list" ? "active" : ""}>List</button>
        <button onClick={() => setTab("charts")} className={tab === "charts" ? "active" : ""}>Charts</button>
        <button onClick={() => setTab("heatmap")} className={tab === "heatmap" ? "active" : ""}>Heatmap</button>
        <button onClick={() => setTab("lifecycle")} className={tab === "lifecycle" ? "active" : ""}>Lifecycle</button>
      </div>

      {/* ⭐ QUICK ACTIONS HERE ⭐ */}
      <div className="quick-actions">
        <button className="btn-secondary">Refresh</button>
        <button className="btn-secondary">Export</button>
        <button className="btn-secondary">Lifecycle Report</button>
      </div>

      <div className="workspace-content">
        {tab === "dashboard" && <AssetDashboard />}
        {tab === "list" && <Assets />}
        {tab === "charts" && <AssetCharts />}
        {tab === "heatmap" && <AssetHeatmap />}
        {tab === "lifecycle" && <AssetLifecycle />}
      </div>

    </div>
  );
}
