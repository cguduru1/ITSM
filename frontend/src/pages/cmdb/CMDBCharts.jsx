import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/cmdb.css";
import "../../styles/changeQuantum.css";
import "../../styles/ticket.css";  
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from "chart.js";
import apiClient from "../../api/apiClient";


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function CMDBCharts() {
  const [statusData, setStatusData] = useState([]);
  const [environmentData, setEnvironmentData] = useState([]);
  const [attestationTrend, setAttestationTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("status");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        // ✅ Replaced 'api' with 'apiClient' and added missing '/api' prefix
        const [statusRes, envRes, trendRes] = await Promise.allSettled([
          apiClient.get("/api/analytics/cmdb-status"),
          apiClient.get("/api/analytics/cmdb-environment"),
          apiClient.get("/api/analytics/cmdb-attestation-trend")
        ]);

        const extractData = (res) => {
          if (res.status === "fulfilled") {
            const data = res.value?.data || res.value;
            return Array.isArray(data) ? data : [];
          }
          return [];
        };

        setStatusData(extractData(statusRes));
        setEnvironmentData(extractData(envRes));
        setAttestationTrend(extractData(trendRes));
      } catch (err) {
        console.error("Failed to load CMDB charts:", err);
        setError("Failed to load analytics data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading CMDB charts & analytics...</div>;
  }

  if (error) {
    return <div style={{ padding: "20px", color: "red" }}>{error}</div>;
  }

  // BAR CHART — CI by Status
  const barChartData = {
    labels: statusData.map((s) => s._id || "Unknown"),
    datasets: [
      {
        label: "CI Count",
        data: statusData.map((s) => s.count ?? 0),
        backgroundColor: "#2563eb"
      }
    ]
  };

  // PIE CHART — CI by Environment
  const pieChartData = {
    labels: environmentData.map((e) => e._id || "Unassigned"),
    datasets: [
      {
        data: environmentData.map((e) => e.count ?? 0),
        backgroundColor: ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]
      }
    ]
  };

  // LINE CHART — Attestation Trend
  const lineChartData = {
    labels: attestationTrend.map((t) => t.month || t._id || "N/A"),
    datasets: [
      {
        label: "Attestations",
        data: attestationTrend.map((t) => t.count ?? 0),
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.3)"
      }
    ]
  };

  return (
    <div className="quantum-page">
      {/* Header */}
      <div className="ticket-header"> 
      <header className="quantum-header">
        <h1>📈 CMDB Charts & Analytics</h1>
        <p>Visual insights into CI health and operations</p>
        <Link to="/cmdb-dashboard" className="quantum-link" style={{ color: '#ffffff' }}>
                      ← Back to Dashboard
                  </Link> 
      </header>
      </div>

      {/* Tabs */}
      <div className="quantum-tabs">
        <button
          className={`quantum-tab ${activeTab === "status" ? "active" : ""}`}
          onClick={() => setActiveTab("status")}
        >
          📊 Operational Status
        </button>
        <button
          className={`quantum-tab ${activeTab === "environment" ? "active" : ""}`}
          onClick={() => setActiveTab("environment")}
        >
          🌍 Environment
        </button>
        <button
          className={`quantum-tab ${activeTab === "trend" ? "active" : ""}`}
          onClick={() => setActiveTab("trend")}
        >
          📈 Attestation Trend
        </button>
      </div>

      {/* Body */}
      <div className="quantum-page-body">
        {activeTab === "status" && (
          <section className="quantum-panel">
            <h3 className="quantum-heading">CI by Operational Status</h3>
            <div className="quantum-card">
              <Bar data={barChartData} />
            </div>
          </section>
        )}

        {activeTab === "environment" && (
          <section className="quantum-panel">
            <h3 className="quantum-heading">CI by Environment</h3>
            <div className="quantum-card">
              <Pie data={pieChartData} />
            </div>
          </section>
        )}

        {activeTab === "trend" && (
          <section className="quantum-panel">
            <h3 className="quantum-heading">Attestation Trend</h3>
            <div className="quantum-card">
              <Line data={lineChartData} />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}