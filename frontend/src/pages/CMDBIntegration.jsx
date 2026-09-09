// ./src/pages/CmdbIntegration.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/apiClient.js";
import "../styles/changeQuantum.css";
import "../styles/cmdb.css";
import "../styles/ticket.css"; 

export default function CmdbIntegration() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    // apiClient returns the parsed JSON directly, NOT res.data
    apiClient
      .get("/api/cmdb/assets")
      .then((data) => setAssets(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Failed to load assets:", err))
      .finally(() => setLoading(false));
  }, []);

   // Map asset types to Quantum badges + icons
  const getTypeBadge = (type) => {
    switch (type?.toLowerCase()) {
      case "server":
        return <span className="quantum-badge quantum-badge-success">🖥 Server</span>;
      case "network":
        return <span className="quantum-badge quantum-badge-warning">🌐 Network</span>;
      case "application":
        return <span className="quantum-badge quantum-badge-info">📦 Application</span>;
      case "database":
        return <span className="quantum-badge quantum-badge-danger">🗄 Database</span>;
      default:
        return <span className="quantum-badge quantum-badge-neutral">❓ {type || "Unknown"}</span>;
    }
  };

  return (
    <div className="quantum-page">
      {/* Header */}
      <div className="ticket-header"> 
      <header className="quantum-header">
        <h1>🔗 CMDB Integration</h1>
        <p>
          View assets and their dependency graph (dependsOn)
        </p>
        <Link to="/cmdb-dashboard" className="quantum-link" style={{ color: '#ffffff' }}>
                      ← Back to Dashboard
                  </Link>
      </header>
      </div>

      {/* Body */}
      <div className="quantum-page-body">
        {loading ? (
          <p className="muted">Loading asset dependencies...</p>
        ) : (
          <section className="quantum-panel">
            <h3 className="quantum-heading">Integration Assets</h3>
            <div className="quantum-card">
              <table className="quantum-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Tags</th>
                    <th>Depends On</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="muted" style={{ textAlign: "center" }}>
                        No integration assets found.
                      </td>
                    </tr>
                  ) : (
                    assets.map((a) => (
                      <tr key={a._id}>
                        <td>{a.name}</td>
                        <td>{getTypeBadge(a.type)}</td>
                        <td>{(a.tags || []).join(", ")}</td>
                        <td>{(a.dependsOn || []).join(", ")}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
