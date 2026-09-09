// src/components/cmdb/CMDBCharts.jsx
import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const cardStyle = {
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: "8px",
  padding: "16px",
  color: "#f8fafc",
  boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
  overflow: "hidden"
};

const cardHeader = {
  marginBottom: "12px",
  fontSize: "16px",
  fontWeight: "600",
  color: "#38bdf8"
};

const chartWrapperStyle = {
  position: "relative",
  height: "180px",
  width: "100%"
};

// Added default parameter `= {}` to prevent undefined evaluation
export default function CMDBCharts({ analytics = {} }) {
  // Check specifically if data arrays exist inside analytics
  const byTypeArray = Array.isArray(analytics?.byType) ? analytics.byType : [];
  const byEnvArray = Array.isArray(analytics?.byEnv) ? analytics.byEnv : [];

  const typeLabels = byTypeArray.map(t => t?._id || "Unspecified");
  const typeCounts = byTypeArray.map(t => t?.count || 0);

  const envLabels = byEnvArray.map(e => e?._id || "Unspecified");
  const envCounts = byEnvArray.map(e => e?.count || 0);

  return (
    <section className="quantum-panel" style={{ width: "100%", overflow: "hidden" }}>
      <h2 style={{ color: "#38bdf8", marginBottom: "16px" }}>📊 CMDB Analytics</h2>

      <div
        className="cmdb-analytics-grid quantum-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "20px",
          width: "100%"
        }}
      >
        {/* BY TYPE CARD */}
        <div className="quantum-card" style={{ ...cardStyle, borderLeft: "6px solid #4ECDC4" }}>
          <h4 style={cardHeader}>By Type</h4>
          {typeLabels.length > 0 ? (
            <div style={chartWrapperStyle}>
              <Bar
                data={{
                  labels: typeLabels,
                  datasets: [
                    {
                      label: "CIs",
                      data: typeCounts,
                      backgroundColor: "#4ECDC4"
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { labels: { color: "#f8fafc", boxWidth: 10, font: { size: 10 } } }
                  },
                  scales: {
                    x: { ticks: { color: "#f8fafc", font: { size: 10 } }, grid: { color: "#334155" } },
                    y: { ticks: { color: "#f8fafc", font: { size: 10 } }, grid: { color: "#334155" } }
                  }
                }}
              />
            </div>
          ) : (
            <p style={{ color: "#94a3b8", fontSize: "14px" }}>No type data available</p>
          )}
        </div>

        {/* BY ENVIRONMENT CARD */}
        <div className="quantum-card" style={{ ...cardStyle, borderLeft: "6px solid #556EE6" }}>
          <h4 style={cardHeader}>By Environment</h4>
          {envLabels.length > 0 ? (
            <div style={chartWrapperStyle}>
              <Pie
                data={{
                  labels: envLabels,
                  datasets: [
                    {
                      data: envCounts,
                      backgroundColor: ["#556EE6", "#4ECDC4", "#FACC15", "#F87171"]
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "top",
                      labels: { color: "#f8fafc", boxWidth: 10, font: { size: 10 } }
                    }
                  }
                }}
              />
            </div>
          ) : (
            <p style={{ color: "#94a3b8", fontSize: "14px" }}>No environment data available</p>
          )}
        </div>
      </div>
    </section>
  );
}