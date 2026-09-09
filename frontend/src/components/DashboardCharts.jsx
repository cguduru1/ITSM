import React, { useMemo } from "react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip as ChartJSTooltip,
  Legend,
  Filler
} from "chart.js";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar as RechartsBar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip
} from "recharts";

// 1. Register required Chart.js modules
ChartJS.register(
  LineElement,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  ChartJSTooltip,
  Legend,
  Filler
);

const COLORS = ['#4ECDC4','#FF6B6B','#F7B731','#9C27B0','#00A8FF'];

export default function DashboardCharts({ stateCounts = [], stats = {} }) {
  // Safe default evaluations for stats props
  const trend = stats?.trend || [0, 0, 0, 0, 0, 0, 0];
  const categories = stats?.categories || [0, 0, 0, 0];
  const total = stats?.total || 0;
  const breached = stats?.breached || 0;
  const onTime = Math.max(0, total - breached);

  const pieData = useMemo(() => {
    return (stateCounts || []).map((s) => ({
      state: s._id || s.state || "Unknown",
      count: s.count || 0
    }));
  }, [stateCounts]);

  // Chart.js configurations
  const lineData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Tickets Created",
        data: trend,
        borderColor: "#4F8BFF",
        backgroundColor: "rgba(79,139,255,0.2)",
        tension: 0.4,
        fill: true
      }
    ]
  };

  const barData = {
    labels: ["Incident", "Service Request", "Change", "Problem"],
    datasets: [
      {
        label: "Ticket Categories",
        data: categories,
        backgroundColor: ["#3A3D98", "#4F8BFF", "#2ECC71", "#FFC107"]
      }
    ]
  };

  const donutData = {
    labels: ["Breached", "On Time"],
    datasets: [
      {
        data: [breached, onTime],
        backgroundColor: ["#FF4D4D", "#2ECC71"]
      }
    ]
  };

 return (
    <div
      className="charts-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: 20
      }}
    >
      <div className="chart-card" style={{ background: "#fff", padding: 20, borderRadius: 12 }}>
        <h3 style={{ margin: "0 0 16px", color: "#334155" }}>Weekly Ticket Trend</h3>
        <Line data={lineData} />
      </div>

      <div className="chart-card" style={{ background: "#fff", padding: 20, borderRadius: 12 }}>
        <h3 style={{ margin: "0 0 16px", color: "#334155" }}>Ticket Categories</h3>
        <Bar data={barData} />
      </div>

      <div className="chart-card" style={{ background: "#fff", padding: 20, borderRadius: 12 }}>
        <h3 style={{ margin: "0 0 16px", color: "#334155" }}>SLA Breach Ratio</h3>
        <Doughnut data={donutData} />
      </div>

      <div style={{ background: "#fff", padding: 20, borderRadius: 12 }}>
        <h4 style={{ margin: "0 0 12px", color: "#334155" }}>State Distribution</h4>
        <PieChart width={300} height={220}>
          <Pie
            data={pieData.length ? pieData : [{ state: "None", count: 1 }]}
            dataKey="count"
            nameKey="state"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {pieData.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <RechartsTooltip />
        </PieChart>

        <h4 style={{ margin: "16px 0 12px", color: "#334155" }}>Risk Distribution</h4>
        <BarChart
          width={300}
          height={200}
          data={[
            { risk: "Low", count: 10 },
            { risk: "Medium", count: 5 },
            { risk: "High", count: 2 }
          ]}
        >
          <XAxis dataKey="risk" />
          <YAxis />
          <RechartsBar dataKey="count" fill="#8884d8" />
        </BarChart>
      </div>
    </div>
  );
}
