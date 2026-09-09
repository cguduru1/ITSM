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
import "./assetCharts.css";

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

export default function AssetCharts() {
  const [categories, setCategories] = useState([]);
  const [aging, setAging] = useState([]);
  const [depreciation, setDepreciation] = useState([]);

  useEffect(() => {
    api.get("/analytics/asset-categories").then((res) => setCategories(res.data));
    api.get("/analytics/asset-aging").then((res) => setAging(res.data));
    api.get("/analytics/asset-depreciation").then((res) => setDepreciation(res.data));
  }, []);

  // PIE CHART — Asset Categories
  const pieData = {
    labels: categories.map((c) => c._id),
    datasets: [
      {
        data: categories.map((c) => c.count),
        backgroundColor: ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]
      }
    ]
  };

  // BAR CHART — Asset Aging
  const barData = {
    labels: aging.map((a) => a.range),
    datasets: [
      {
        label: "Assets",
        data: aging.map((a) => a.count),
        backgroundColor: "#2563eb"
      }
    ]
  };

  // LINE CHART — Depreciation Trend
  const lineData = {
    labels: depreciation.map((d) => d.year),
    datasets: [
      {
        label: "Depreciation Value",
        data: depreciation.map((d) => d.value),
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.3)"
      }
    ]
  };

  return (
    <div className="asset-charts-container">

      <h2 className="charts-title">Asset Analytics</h2>

      <div className="chart-card">
        <h3>Asset Category Distribution</h3>
        <Pie data={pieData} />
      </div>

      <div className="chart-card">
        <h3>Asset Aging Breakdown</h3>
        <Bar data={barData} />
      </div>

      <div className="chart-card">
        <h3>Depreciation Trend</h3>
        <Line data={lineData} />
      </div>

    </div>
  );
}
