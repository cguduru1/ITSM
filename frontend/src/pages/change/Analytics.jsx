import React, { useEffect, useState } from "react";
import { Line, Bar, Pie } from "react-chartjs-2";
import api from "../../api/apiClient";
import "../../styles/changeQuantum.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend);

export default function Analytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/analytics/change-summary").then(res => setData(res.data)).catch(err => {
      console.error(err);
      // fallback mock
      setData({
        byDay: { labels: ["Mon","Tue","Wed","Thu","Fri"], values: [5,8,6,10,7] },
        byModel: { labels: ["Normal","Standard","Emergency","DevOps"], values: [40,25,20,15] },
        successRate: 87
      });
    });
  }, []);

  if (!data) return <div className="quantum-page"><div className="muted">Loading analytics…</div></div>;

  const line = {
    labels: data.byDay.labels,
    datasets: [{ label: "Changes", data: data.byDay.values, borderColor: "#58a6ff", backgroundColor: "rgba(88,166,255,0.12)" }]
  };

  const bar = {
    labels: data.byModel.labels,
    datasets: [{ label: "Count", data: data.byModel.values, backgroundColor: ["#556EE6","#4ECDC4","#FF6B6B","#9C27B0"] }]
  };

  const pie = {
    labels: ["Success", "Failure"],
    datasets: [{ data: [data.successRate, 100 - data.successRate], backgroundColor: ["#2E8B57","#FF6B6B"] }]
  };

  return (
    <div className="quantum-page">
      <div className="quantum-page-header">
        <h2>Change Analytics</h2>
        <p className="muted">KPIs, trends and success metrics</p>
      </div>

      <div className="quantum-page-body">
        <div className="quantum-card">
          <h3>Changes by day</h3>
          <Line data={line} />
        </div>

        <div className="quantum-card">
          <h3>By model</h3>
          <Bar data={bar} />
        </div>

        <div className="quantum-card">
          <h3>Success rate</h3>
          <Pie data={pie} />
          <div style={{ marginTop: 8 }}>Success Score: <strong>{data.successRate}%</strong></div>
        </div>
      </div>
    </div>
  );
}
