import { useState } from "react";
import ChangeDashboard from "../pages/change/ChangeDashboard";
import Changes from "../pages/Changes";
import ChangeCharts from "../pages/change/ChangeCharts";
import ChangeHeatmap from "../pages/change/ChangeHeatmap";
import ChangeCalendar from "../pages/ChangeCalendar";
import "../styles/workspace.css";



export default function ChangeWorkspace() {
  const [tab, setTab] = useState("dashboard");

  return (
    <div className="workspace-container">

      <div className="workspace-header">
        <h1>Change Workspace</h1>
        <button className="btn-primary">+ New Change</button>
      </div>

      <div className="workspace-tabs">
        <button onClick={() => setTab("dashboard")} className={tab === "dashboard" ? "active" : ""}>Dashboard</button>
        <button onClick={() => setTab("list")} className={tab === "list" ? "active" : ""}>List</button>
        <button onClick={() => setTab("charts")} className={tab === "charts" ? "active" : ""}>Charts</button>
        <button onClick={() => setTab("heatmap")} className={tab === "heatmap" ? "active" : ""}>Heatmap</button>
        <button onClick={() => setTab("calendar")} className={tab === "calendar" ? "active" : ""}>Calendar</button>
      </div>

      {/* ⭐ QUICK ACTIONS HERE ⭐ */}
      <div className="quick-actions">
        <button className="btn-secondary">Refresh</button>
        <button className="btn-secondary">Export</button>
        <button className="btn-secondary">Risk Matrix</button>
      </div>

      <div className="workspace-content">
        {tab === "dashboard" && <ChangeDashboard />}
        {tab === "list" && <Changes />}
        {tab === "charts" && <ChangeCharts />}
        {tab === "heatmap" && <ChangeHeatmap />}
        {tab === "calendar" && <ChangeCalendar />}
      </div>

    </div>
  );
}
