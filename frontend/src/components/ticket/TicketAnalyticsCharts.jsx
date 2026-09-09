import React from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function TicketAnalyticsCharts({ analytics }) {
  if (!analytics) return null;

  // Pie chart: status distribution (Defaulting fields to 0 if missing)
  const pieData = {
    labels: ["Total", "Open", "Closed"],
    datasets: [
      {
        label: "Tickets",
        data: [analytics.total || 0, analytics.open || 0, analytics.closed || 0],
        backgroundColor: ["#3b82f6", "#22c55e", "#ef4444"]
      }
    ]
  };

  // Bar chart: priority distribution
  const barData = {
    labels: ["Low", "Medium", "High"],
    datasets: [
      {
        label: "Tickets by Priority",
        data: [analytics.low || 0, analytics.medium || 0, analytics.high || 0],
        backgroundColor: ["#10b981", "#3b82f6", "#ef4444"]
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" }
    }
  };

  // SAFE MAPS: Uses optional chaining and fallback empty arrays
  const statusLabels = (analytics?.byStatus || []).map(s => s._id || "Unknown");
  const statusCounts = (analytics?.byStatus || []).map(s => s.count || 0);

  const typeLabels = (analytics?.byType || []).map(t => t._id || "Unknown");
  const typeCounts = (analytics?.byType || []).map(t => t.count || 0);

  return (
    <div className="ticket-panel quantum">
      <h2>Analytics</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
        
        {/* Dynamic Status Bar Chart */}
        <div style={{ flex: "1 1 45%", minWidth: "300px" }}>
          <h4>By Status</h4>
          <Bar
            options={options}
            data={{
              labels: statusLabels,
              datasets: [{ label: "Tickets", data: statusCounts, backgroundColor: "#4ECDC4" }]
            }}
          />
        </div>

        {/* Global Overview Pie Chart */}
        <div style={{ flex: "1 1 45%", maxWidth: "400px" }}>
          <h4>Overview</h4>
          <Pie data={pieData} options={options} />
        </div>
      
        {/* Priority Bar Chart */}
        <div style={{ flex: "1 1 45%", maxWidth: "500px" }}>
          <h4>By Priority</h4>
          <Bar data={barData} options={options} />
        </div>

        {/* Dynamic Type Pie Chart */}
        <div style={{ flex: "1 1 45%", minWidth: "300px" }}>
          <h4>By Type</h4>
          <Pie
            options={options}
            data={{
              labels: typeLabels,
              datasets: [{ data: typeCounts, backgroundColor: ["#556EE6", "#4ECDC4", "#FF6B6B"] }]
            }}
          />
        </div>

      </div>
    </div>
  );
}
