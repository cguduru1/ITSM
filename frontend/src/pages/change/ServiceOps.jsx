import React, { useState, useEffect } from "react"; 
import { Bar, Pie, Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend } from "chart.js";
import { Link } from "react-router-dom";
import apiClient from "../../api/apiClient";
import "../../styles/changeQuantum.css";
import "../../styles/cmdb.css";
import "../../styles/ticket.css"; 

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend);

export default function ServiceOps() {
   // State hooks for each panel
  const [tasks, setTasks] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [automationRules, setAutomationRules] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("sla"); 

  // Example: fetch data from backend APIs
  useEffect(() => {
  async function fetchData() {
    try {
      const [taskRes, incidentRes, autoRes, analyticsRes] = await Promise.all([
        apiClient.get("/api/changes/serviceops/tasks"),       // 👈 Added /serviceops
        apiClient.get("/api/changes/serviceops/incidents"),   // 👈 Added /serviceops
        apiClient.get("/api/changes/serviceops/automation"),  // 👈 Added /serviceops
        apiClient.get("/api/changes/serviceops/analytics")    // 👈 Added /serviceops
      ]);

      setTasks(Array.isArray(taskRes.data) ? taskRes.data : []);
      setIncidents(Array.isArray(incidentRes.data) ? incidentRes.data : []);
      setAutomationRules(Array.isArray(autoRes.data) ? autoRes.data : []);
      setAnalytics(analyticsRes.data || null);

    } catch (err) {
      console.error("Failed to load ServiceOps data:", err);
    } finally {
      setLoading(false);
    }
  }
  fetchData();
}, []);

  // Example chart data for analytics
  const slaChartData = {
    labels: ["SLA Compliance", "Breaches"],
    datasets: [
      {
        label: "SLA Metrics",
        data: analytics ? [analytics.slaCompliance, analytics.slaBreaches] : [0, 0],
        backgroundColor: ["rgba(34,197,94,0.7)", "rgba(239,68,68,0.7)"],
        borderRadius: 6
      }
    ]
  };

  const incidentTrendData = {
    labels: analytics?.incidentTrend?.dates || [],
    datasets: [
      {
        label: "Incidents Over Time",
        data: analytics?.incidentTrend?.counts || [],
        borderColor: "rgba(59,130,246,0.8)",
        backgroundColor: "rgba(59,130,246,0.3)",
        tension: 0.3,
        fill: true
      }
    ]
  };

  const automationPieData = {
  labels: analytics?.automationKPIs?.labels || [],
  datasets: [
    {
      label: "Automation KPIs",
      data: analytics?.automationKPIs?.values || [],
      backgroundColor: [
        "rgba(34,197,94,0.7)",   // green
        "rgba(59,130,246,0.7)",  // blue
        "rgba(239,68,68,0.7)"    // red
      ]
    }
  ]
};

  return (
    <div className="quantum-page">
      {/* Header */}
      <div className="ticket-header"> 
      <header className="quantum-header">
        <h1>⚙️ Service Operations Workspace</h1>
        <p>Task execution without context switching</p>
        <Link to="/workspace/change" className="quantum-link" style={{ color: '#ffffff' }}>
          ← Back to Dashboard
        </Link>
      </header>
      </div>

      {/* Body Grid */}
      <div className="quantum-page-body quantum-grid">
        {loading ? (
          <p className="muted">Loading ServiceOps data...</p>
        ) : (
          <>
            {/* Task Board Panel */}
            <section className="quantum-panel">
              <h3 className="quantum-heading">Task Board</h3>
              <div className="quantum-card">
                {tasks.length === 0 ? (
                  <p className="muted">No tasks available.</p>
                ) : (
                  <ul className="quantum-list">
                    {tasks.map(t => (
                      <li key={t.id} className="quantum-item">
                        <span className="quantum-label">{t.title}</span>
                        <span className="quantum-value">{t.status}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            {/* Incident Panel */}
            <section className="quantum-panel">
              <h3 className="quantum-heading">Incident Queue</h3>
              <div className="quantum-card">
                {incidents.length === 0 ? (
                  <p className="muted">No active incidents.</p>
                ) : (
                  <ul className="quantum-list">
                    {incidents.map(i => (
                      <li key={i.id} className="quantum-item">
                        <span className="quantum-label">{i.summary}</span>
                        <span className="quantum-badge quantum-badge-warning">{i.priority}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            {/* Automation Panel */}
            <section className="quantum-panel">
              <h3 className="quantum-heading">Automation</h3>
              <div className="quantum-card">
                {automationRules.length === 0 ? (
                  <p className="muted">No automation rules configured.</p>
                ) : (
                  <ul className="quantum-list">
                    {automationRules.map(rule => (
                      <li key={rule.id} className="quantum-item">
                        <span className="quantum-label">{rule.name}</span>
                        <span className="quantum-value">{rule.action}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            {/* Analytics Panel with Tabs */}
            <section className="quantum-panel">
              <h3 className="quantum-heading">Ops Analytics</h3>

              {/* Tabs */}
              <div className="quantum-tabs">
                <button
                  className={`quantum-tab ${activeTab === "sla" ? "active" : ""}`}
                  onClick={() => setActiveTab("sla")}
                >
                  📊 SLA Metrics
                </button>
                <button
                  className={`quantum-tab ${activeTab === "incidents" ? "active" : ""}`}
                  onClick={() => setActiveTab("incidents")}
                >
                  📈 Incident Trend
                </button>
                <button
                  className={`quantum-tab ${activeTab === "automation" ? "active" : ""}`}
                  onClick={() => setActiveTab("automation")}
                >
                  🤖 Automation KPIs
                </button>
              </div>

              {/* Tab Content */}
              <div className="quantum-card">
                {activeTab === "sla" && <Bar data={slaChartData} />}
                {activeTab === "incidents" && <Line data={incidentTrendData} />}
                {activeTab === "automation" && <Pie data={automationPieData} />}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
