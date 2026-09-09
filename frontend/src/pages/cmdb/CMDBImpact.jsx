import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
// import api from "../../api/api";
import apiClient from "../../api/apiClient";
import "../../styles/changeQuantum.css";
import "../../styles/cmdb.css"
import "../../styles/ticket.css"; 


export default function CMDBImpact({ ciId}) {
  const [impact, setImpact] = useState({ impacted: [], risk: 0 });

  // Map risk levels to badge styles
  const getRiskBadge = (risk) => {

    const riskValue = String(risk || "").toLowerCase();

    switch (riskValue) {
      case "high":
        return (
          <span className="quantum-badge quantum-badge-danger">
            🔴 High
          </span>
        );
      case "medium":
        return (
          <span className="quantum-badge quantum-badge-warning">
            ⚠️ Medium
          </span>
        );
      case "low":
        return (
          <span className="quantum-badge quantum-badge-success">
            ✅ Low
          </span>
        );
      default:
        return (
          <span className="quantum-badge quantum-badge-neutral">
            ℹ️ Unknown
          </span>
        );
    }
  };


  useEffect(() => {
    if (!ciId) return;
    api.get(`/api/impact/${ciId}`).then(res => setImpact(res.data));
  }, [ciId]);

   return (
    <section className="quantum-panel">
      <div className="ticket-header"> 
      <h1 >Impact Risk</h1>
      <Link to="/cmdb-dashboard" className="quantum-link" style={{ color: '#ffffff' }}>
                       ← Back to Dashboard
                     </Link>
      </div>
      <div className="quantum-card">
        {/* Risk badge with icon */}
        <p>
          Risk Level: {getRiskBadge(impact.risk)}
        </p>

        <h4 className="quantum-subtitle">Impacted CIs</h4>
        {impact.impacted && impact.impacted.length > 0 ? (
          <ul className="quantum-list">
            {impact.impacted.map((id) => (
              <li key={id} className="quantum-item">
                <span className="quantum-label">{id}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No impacted CIs found.</p>
        )}
      </div>
    </section>
  );
}