import { useEffect, useState } from "react";
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
// import api from "../../api/api";
import apiClient from "../../api/apiClient";
import "./changeCharts.css";

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

export default function ChangeCharts() {
  const [changeTypes, setChangeTypes] = useState([]);
  const [riskLevels, setRiskLevels] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);

  useEffect(() => {
    api.get("/analytics/change-types").then((res) => setChangeTypes(res.data));
    api.get("/analytics/change-risk").then((res) => setRiskLevels(res.data));
    api.get("/analytics/change-monthly-trend").then((res) => setMonthlyTrend(res.data));
  }, []);

  // PIE CHART — Change Types
  const pieData = {
    labels: changeTypes.map((t) => t._id),
    datasets: [
      {
        data: changeTypes.map((t) => t.count),
        backgroundColor: ["#2563eb", "#10b981", "#f59e0b", "#ef4444"]
      }
    ]
  };

  // BAR CHART — Risk Levels
  const barData = {
    labels: riskLevels.map((r) => r._id),
    datasets: [
      {
        label: "Changes",
        data: riskLevels.map((r) => r.count),
        backgroundColor: "#2563eb"
      }
    ]
  };

  // LINE CHART — Monthly Trend
  const lineData = {
    labels: monthlyTrend.map((m) => m.month),
    datasets: [
      {
        label: "Changes per Month",
        data: monthlyTrend.map((m) => m.count),
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.3)"
      }
    ]
  };

  return (
    <div className="change-charts-container">

      <h2 className="charts-title">Change Management Analytics</h2>

      <div className="chart-card">
        <h3>Change Types Distribution</h3>
        <Pie data={pieData} />
      </div>

      <div className="chart-card">
        <h3>Risk Level Breakdown</h3>
        <Bar data={barData} />
      </div>

      <div className="chart-card">
        <h3>Monthly Change Trend</h3>
        <Line data={lineData} />
      </div>

    </div>
  );
}
