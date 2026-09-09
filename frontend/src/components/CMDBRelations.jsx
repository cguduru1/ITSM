import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/apiClient";
import "../styles/cmdb.css";
import "../styles/changeQuantum.css";
import "../styles/ticket.css";


export default function CMDBRelations() {
  const [relations, setRelations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await apiClient.get("/api/cmdb-rel");
      const data = res?.data || res || [];
      setRelations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("REL ERROR:", err);
      setError("Failed to load relationships.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div style={{ padding: "20px" }}>Loading CI relationships...</div>;
  if (error) return <div style={{ padding: "20px", color: "red" }}>{error}</div>;

  return (
    <div className="quantum-page">
      <div className="ticket-header"> 
       <header className="quantum-header">
        <h2 className="quantum-title">🔗 CMDB CI Relationships</h2>
        <p className="quantum-subtitle">Visualize dependencies and connections</p>
        <Link to="/cmdb-dashboard" className="quantum-link" style={{ color: '#ffffff' }}>
          ← Back to Dashboard
        </Link>
      </header>
      </div>
      
     <div className="quantum-page-body quantum-grid">
        {relations.length === 0 ? (
          <p className="muted">No CI relationships found.</p>
        ) : (
          relations.map((rel) => (
            <section key={rel._id} className="quantum-panel">
              <h3 className="quantum-heading">{rel.name}</h3>
              <div className="quantum-card">
                {rel.relations && rel.relations.length > 0 ? (
                  rel.relations.map((r) => (
                    <div key={r._id} className="quantum-item">
                      <span className="quantum-label">{rel.name}</span>
                      <span className="quantum-arrow"> [{r.type}] → </span>
                      <span className="quantum-label">{r.target}</span>
                    </div>
                  ))
                ) : (
                  <p className="muted">No direct relationships.</p>
                )}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}