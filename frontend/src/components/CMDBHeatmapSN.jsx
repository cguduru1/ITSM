import { useEffect, useState } from "react";
// import api from "../api/api";
import apiClient from "../api/apiClient";
import "../../styles/badges.css";

export default function CMDBHeatmapSN() {
  const [items, setItems] = useState([]);
  const [cis, setCis] = useState([]);     // FIXED

  useEffect(() => {
    api.get("/api/cmdb").then(res => {
      const list = Array.isArray(res.data) ? res.data : res.data.table;
      setItems(list);
      setCis(list); // FIXED
    });
  }, []);

  const getColor = (status) => {
    if (status === "Down") return "#e63946";
    if (status === "Maintenance") return "#ffb703";
    if (status === "Retired") return "#6c757d";
    return "#2a9d8f"; // Active
  };

  return (
    <div className="sn-heatmap">
      <h2 className="heatmap-title">CMDB Heatmap</h2>
            <div className="heatmap-legend">
  <strong>Heatmap Color Legend</strong>
  <ul>
    <li><span className="legend-box teal"></span> Healthy CI</li>
    <li><span className="legend-box yellow"></span> Warning / Attention Needed</li>
    <li><span className="legend-box red"></span> Critical / High Risk</li>
  </ul>
</div>

      {/* AI Heatmap */}
      <div className="cmdb-heatmap">
        {cis.map(ci => (
          <div
            key={ci._id}
            className={`heatmap-item ${ci.healthStatus?.toLowerCase()}`}
          >
            {ci.name}

            {/* Anomaly Badge — FIXED */}
            {ci.isAnomaly && <span className="badge-red">!</span>}
          </div>
        ))}
      </div>

      <div className="sn-heatmap-grid">
        {items.map(ci => (
          <div
            key={ci._id}
            className="sn-heatmap-cell"
            style={{ background: getColor(ci.operational_status) }}
          >
            {ci.name}
          </div>
        ))}
      </div>
    </div>
  );
}
