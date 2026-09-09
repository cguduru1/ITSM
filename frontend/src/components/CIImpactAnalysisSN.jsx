import { useEffect, useState } from "react";
// import api from "../api/api";
import apiClient from "../api/apiClient";


export default function CIImpactAnalysisSN({ id }) {
  const [impact, setImpact] = useState(null);

  useEffect(() => {
    api.post("/api/cmdb/impact", { ciId: id }).then(res => {
      setImpact(res.data);
    });
  }, [id]);

  if (!impact) return <p>Loading impact analysis...</p>;

  return (
    <div className="sn-impact">
      <h3>Impact Analysis</h3>

      <div className="sn-impact-summary">
        <p><strong>Risk Level:</strong> {impact.risk}</p>
        <p><strong>Impact Score:</strong> {impact.impactScore}</p>
      </div>

      <div className="sn-impact-grid">
        <div className="sn-impact-card">
          <h4>Dependencies</h4>
          {impact.affected.dependencies.map(d => (
            <p key={d._id}>{d.name}</p>
          ))}
        </div>

        <div className="sn-impact-card">
          <h4>Dependents</h4>
          {impact.affected.dependents.map(d => (
            <p key={d._id}>{d.name}</p>
          ))}
        </div>

        <div className="sn-impact-card">
          <h4>Assets</h4>
          {impact.affected.assets.map(a => (
            <p key={a._id}>{a.asset_tag}</p>
          ))}
        </div>

        <div className="sn-impact-card">
          <h4>Changes</h4>
          {impact.affected.changes.map(c => (
            <p key={c._id}>{c.title}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
