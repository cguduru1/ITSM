import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import "../../styles/changeQuantum.css";
import "../../styles/cmdb.css";
import "../../styles/ticket.css";


ChartJS.register(ArcElement, Tooltip, Legend);

export default function SuccessScore({ changes }) {
  // Example: changes = [{status:"Success"}, {status:"Failed"}, {status:"RolledBack"}]

  const { total, successCount, failCount, rollbackCount, successRate } = useMemo(() => {
    const total = changes?.length || 0;
    const successCount = changes?.filter(c => c.status === "Success").length || 0;
    const failCount = changes?.filter(c => c.status === "Failed").length || 0;
    const rollbackCount = changes?.filter(c => c.status === "RolledBack").length || 0;
    const successRate = total > 0 ? ((successCount / total) * 100).toFixed(1) : 0;

    return { total, successCount, failCount, rollbackCount, successRate };
  }, [changes]);

  // Chart data
  const chartData = {
    labels: ["Success", "Failed", "Rolled Back"],
    datasets: [
      {
        data: [successCount, failCount, rollbackCount],
        backgroundColor: ["#22c55e", "#ef4444", "#f59e0b"], // green, red, amber
        borderColor: ["#14532d", "#7f1d1d", "#78350f"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="quantum-page">
      <div className="ticket-header"> 
      <header className="quantum-header">
        <h1>🌌 Change Success Score</h1>
        <p>
          Predictive analytics and failure rate monitoring
        </p>
        <Link to="/workspace/change" className="quantum-link" style={{ color: '#ffffff' }}>
          ← Back to Dashboard
        </Link>

      </header>
      </div>

      <div className="quantum-page-body quantum-grid">

        {/* Trends Panel */}
        <section className="quantum-panel">
          <h3 className="quantum-heading">Trends</h3>
          <div className="quantum-card">
            <p>Total Changes: {total}</p>
            <p>Successful: {successCount}</p>
            <p>Failed: {failCount}</p>
            <p>Rolled Back: {rollbackCount}</p>
            <p>Success Rate: {successRate}%</p>
            <Pie data={chartData} />
          </div>
        </section>

        {/* Failure Rate Panel */}
        <section className="quantum-panel">
          <h3 className="quantum-heading">Failure Rate</h3>
          <div className="quantum-card">
            <p>{failCount} failed changes ({((failCount / total) * 100).toFixed(1)}%)</p>
            <p>{rollbackCount} rollbacks ({((rollbackCount / total) * 100).toFixed(1)}%)</p>
          </div>
        </section>
      </div>
    </div>
  );
}
