import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/apiClient";
import "../styles/changeQuantum.css";
import { Bar } from "react-chartjs-2";
import "../styles/cmdb.css";
import "../styles/ticket.css"; 

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";

// Register Chart.js components
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function AssetLifecycle() {
  const [lifecycle, setLifecycle] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Example: fetch lifecycle data from backend
  useEffect(() => {
    apiClient
      .get("/api/cmdb/lifecycle")
      .then(res => {
        // Ensure data is always converted to an array even if wrapped in res.data.data
        const dataArray = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

        setLifecycle(dataArray);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load lifecycle:", err);
        setError("Failed to load asset lifecycle data.");
        setLifecycle([]); // Fallback to empty array on error
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="dashboard-container" style={{ padding: "20px" }}>Loading lifecycle stages...</div>;
  }

  if (error) {
    return <div className="dashboard-container" style={{ padding: "20px", color: "red" }}>{error}</div>;
  }

  const safeLifecycle = Array.isArray(lifecycle) ? lifecycle : [];

  // Prepare line chart data
  const chartData = {
    labels: lifecycle.map(stage => stage.stage || stage._id || "Unknown"),
    datasets: [
      {
        label: "Asset Count Over Lifecycle",
        data: lifecycle.map(stage => stage.count ?? 0),
        borderColor: "rgba(54, 162, 235, 0.8)",
        backgroundColor: "rgba(54, 162, 235, 0.3)",
        tension: 0.3,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
      tooltip: { enabled: true }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

 return (
    <div className="quantum-page">
      {/* Header */}
      <div className="ticket-header"> 
      <header className="quantum-header">

        <h1>📦 Asset Lifecycle</h1>
        <p>Track stages and transitions</p>
         <Link to="/cmdb-dashboard" className="quantum-link" style={{ color: '#ffffff' }}>
                 ← Back to Dashboard
               </Link>
      </header>
      </div>

      {/* Body */}
      <div className="quantum-page-body quantum-grid">
        <section className="quantum-panel">
          <h3 className="quantum-heading">Lifecycle Stages</h3>
          <div className="quantum-card">
            {lifecycle.length === 0 ? (
              <p className="muted">No asset lifecycle data found.</p>
            ) : (
              lifecycle.map(stage => (
                <div key={stage._id || stage.stage} className="quantum-item">
                  <span className="quantum-label">
                    {stage._id || stage.stage || "Unknown"}:
                  </span>
                  <span className="quantum-value">{stage.count ?? 0}</span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Lifecycle Chart */}
        <section className="quantum-panel">
          <h3 className="quantum-heading">Lifecycle Timeline</h3>
          <div className="quantum-card">
            {lifecycle.length === 0 ? (
              <p className="muted">No chart data available.</p>
            ) : (
              <Line data={chartData} options={chartOptions} />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
