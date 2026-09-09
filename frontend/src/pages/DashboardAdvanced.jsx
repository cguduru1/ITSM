import { io } from "socket.io-client";
import { useEffect, useState } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
// import api from "../api/api";
import apiClient from "../api/apiClient";
import TicketsByCategory from "../components/charts/TicketsByCategory";
import TicketsByPriority from "../components/charts/TicketsByPriority";
import AgentPerformance from "../components/charts/AgentPerformance";
import DepartmentWorkload from "../components/charts/DepartmentWorkload";
import TicketTrend from "../components/charts/TicketTrend";
import MainLayout from "../layouts/MainLayout";
import { Link } from "react-router-dom";


export default function DashboardAdvanced() {
  // -----------------------------
  // STATE VARIABLES
  // -----------------------------
  const [summary, setSummary] = useState({});
  const [categoryData, setCategoryData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);
  const [agentData, setAgentData] = useState([]);
  const [deptData, setDeptData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [byCategory, setByCategory] = useState([]);
  const [byPriority, setByPriority] = useState([]);
  const [trends, setTrends] = useState([]);

  // -----------------------------
  // CLEAN DATA (removes nulls)
  // -----------------------------
  const cleanData = (data) =>
    data.filter((d) => d && d._id && d.count !== undefined);

  // -----------------------------
  // CHART OPTIONS
  // -----------------------------
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" }
    }
  };

  const colors = ["#3A3D98", "#4F8BFF", "#2ECC71", "#FFC107", "#E91E63", "#9C27B0"];

  // -----------------------------
  // API CALLS + SOCKET
  // -----------------------------
  useEffect(() => {
api.get("/analytics/cmdb-summary").then((r) => setSummary(r.data));
api.get("/analytics/category").then((r) => setCategoryData(r.data));
api.get("/analytics/priority").then((r) => setPriorityData(r.data));
api.get("/analytics/agents").then((r) => setAgentData(r.data));
api.get("/analytics/departments").then((r) => setDeptData(r.data));
api.get("/analytics/trends").then((r) => setTrendData(r.data));

    const socket = io("http://localhost:4000");
    socket.on("dashboard:update", (data) => setSummary(data));

    return () => socket.disconnect();
  }, []);

  // -----------------------------
  // CHART DATA OBJECTS
  // -----------------------------
  const categoryChartData = {
    labels: cleanData(categoryData).map((c) => c._id),
    datasets: [
      {
        data: cleanData(categoryData).map((c) => c.count),
        backgroundColor: colors
      }
    ]
  };

  const priorityChartData = {
    labels: cleanData(priorityData).map((p) => p._id),
    datasets: [
      {
        data: cleanData(priorityData).map((p) => p.count),
        backgroundColor: colors
      }
    ]
  };

  const agentChartData = {
    labels: cleanData(agentData).map((a) => a._id),
    datasets: [
      {
        data: cleanData(agentData).map((a) => a.count),
        backgroundColor: colors
      }
    ]
  };

  const deptChartData = {
    labels: cleanData(deptData).map((d) => d._id),
    datasets: [
      {
        data: cleanData(deptData).map((d) => d.count),
        backgroundColor: colors
      }
    ]
  };

  const trendChartData = {
    labels: cleanData(trendData).map((t) => t._id),
    datasets: [
      {
        label: "Tickets",
        data: cleanData(trendData).map((t) => t.count),
        borderColor: "#3A3D98",
        fill: false
      }
    ]
  };

  // -----------------------------
  // UI LAYOUT
  // -----------------------------
  return (
    <MainLayout>
    <div className="dashboard-container">

      {/* HEADER */}
      <header className="dashboard-header">
      </header>
            {/* Watermark */}
      <div className="page-watermark">
        <img src="/s3-watermark.png" alt="S3 Technologies" />
      </div>
 {/* Navigation CARDS */}
<section className="module-links">
  <h2>Modules</h2>

  <div className="module-grid">

    <a className="module-card" href="/cmdb">
      <h3>CMDB</h3>
      <p>View CIs, relationships, dependencies</p>
    </a>

    <a className="module-card" href="/assets">
      <h3>Assets</h3>
      <p>Lifecycle, reports, import/export</p>
    </a>

    <a className="module-card" href="/changes">
      <h3>Changes</h3>
      <p>Calendar, heatmap, approvals</p>
    </a>

    <a className="module-card" href="/cmdb-dashboard">
      <h3>CMDB Dashboard</h3>
      <p>CI health, infra status, relationships</p>
    </a>

    <a className="module-card" href="/asset-dashboard">
      <h3>Asset Dashboard</h3>
      <p>Lifecycle, utilization, depreciation</p>
    </a>

    <a className="module-card" href="/change-dashboard">
      <h3>Change Dashboard</h3>
      <p>Change volume, risk, approvals</p>
    </a>

  </div>
</section>



    </div>
    </MainLayout>
  );
}
