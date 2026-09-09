import { useEffect, useState } from "react";
// import api from "../api/api";
import apiClient from "../api/apiClient";


export default function CIRiskMatrixSN() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get("/api/cmdb").then(res => {
      setItems(Array.isArray(res.data) ? res.data : res.data.table);
    });
  }, []);

  const getRisk = (ci) => {
    const score = ci.health_score || 100;
    if (score >= 80) return "Low";
    if (score >= 50) return "Medium";
    return "High";
  };

  const matrix = { Low: [], Medium: [], High: [] };
  items.forEach(ci => matrix[getRisk(ci)].push(ci));

  return (
    <div className="sn-risk-matrix">
      <h2>CI Risk Matrix</h2>

      <div className="sn-risk-grid">
        {["Low", "Medium", "High"].map(level => (
          <div key={level} className={`sn-risk-cell sn-risk-${level.toLowerCase()}`}>
            <h3>{level} Risk</h3>
            {matrix[level].map(ci => (
              <p key={ci._id}>{ci.name}</p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
