import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HeatMap from "react-heatmap-grid";
import apiClient from "../../api/apiClient";
import "./cmdbHeatmap.css";
import "../../styles/cmdb.css";
import "../../styles/changeQuantum.css";
import "../../styles/ticket.css"; 

export default function CMDBHeatmap() {
  // ✅ 1. Declare 'cis' and matrix state variables at top-level
  const [cis, setCis] = useState([]);
  const [matrix, setMatrix] = useState([]);
  const [xLabels, setXLabels] = useState([]);
  const [yLabels, setYLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // ✅ 2. Use apiClient consistently
        const res = await apiClient.get("/api/cmdb"); 
        const data = res?.data || res || [];

        const ciList = Array.isArray(data) ? data : [];
        setCis(ciList);

      } catch (err) {
        console.error("HEATMAP ERROR:", err);
        setError("Failed to load heatmap data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper to determine CSS status class safely
  const getHealthClass = (ci) => {
    if (ci.healthStatus) return ci.healthStatus.toLowerCase();
    const score = ci.health_score ?? 100;
    if (score >= 80) return "teal";
    if (score >= 50) return "yellow";
    return "red";
  };

  if (loading) {
    return <div className="cmdb-heatmap-container" style={{ padding: "20px" }}>Loading CMDB Heatmap...</div>;
  }

  if (error) {
    return <div className="cmdb-heatmap-container" style={{ padding: "20px", color: "#ef4444" }}>{error}</div>;
  }

  return (
     <div className="quantum-page">
      {/* Header */}
      <div className="ticket-header">
      <header className="quantum-header">
        <h1>📊 CMDB Heatmap</h1>
        <p>
          Visualizing CI health, environment distribution, and risk clusters
        </p>
        <Link to="/cmdb-dashboard" className="quantum-link" style={{ color: '#ffffff' }}>
                         ← Back to Dashboard
                       </Link>
      </header>
      </div>

      {/* ✅ 3. Safely map over declared 'cis' array */}
     <div className="quantum-page-body quantum-grid">
        <section className="quantum-panel">
          <h3 className="quantum-heading">Configuration Items</h3>
          <div className="quantum-card quantum-flex">
            {cis.length === 0 ? (
              <p className="muted">No CIs available for heatmap display.</p>
            ) : (
              cis.map((ci) => (
                <div
                  key={ci._id || ci.id}
                  className={`quantum-item ${getHealthClass(ci)}`}
                >
                  {ci.name || "Unnamed CI"}
                </div>
              ))
            )}
          </div>
        </section>

      {/* ⭐ Legend */}
      {/* Legend */}
        <section className="quantum-panel">
          <h3 className="quantum-heading">Heatmap Legend</h3>
          <div className="quantum-card">
            <ul className="quantum-list">
              <li><span className="quantum-badge quantum-badge-success">🟩 Healthy CI</span></li>
              <li><span className="quantum-badge quantum-badge-warning">🟨 Warning / Attention Needed</span></li>
              <li><span className="quantum-badge quantum-badge-danger">🟥 Critical / High Risk</span></li>
            </ul>
          </div>
        </section>

      {/* Matrix Heatmap */}
        {matrix.length > 0 && xLabels.length > 0 && (
          <section className="quantum-panel">
            <h3 className="quantum-heading">Matrix View</h3>
            <div className="quantum-card">
              <HeatMap
                xLabels={xLabels}
                yLabels={yLabels}
                data={matrix}
                squares
                height={40}
                width={60}
                xLabelsLocation={"bottom"}
                yLabelWidth={120}
                cellStyle={(background, value, min, max) => ({
                  background: `rgba(37, 99, 235, ${max > 0 ? value / max : 0.1})`,
                  color: max > 0 && value > max * 0.6 ? "#fff" : "#000",
                  borderRadius: "4px",
                  margin: "2px"
                })}
                cellRender={(value) => value && <span>{value}</span>}
              />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
