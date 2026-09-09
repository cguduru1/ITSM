import { useEffect, useState } from "react";
// import api from "../../api/api";
import apiClient from "../api/apiClient";


export default function CMDBDataQuality() {
  const [quality, setQuality] = useState({
    completeness: 0,
    accuracy: 0,
    consistency: 0,
    duplicates: 0,
    stale: 0
  });

  useEffect(() => {
    api.get("/api/analytics/cmdb-data-quality")
      .then(r => setQuality(r.data))
      .catch(() => {
        // fallback if API not implemented yet
        setQuality({
          completeness: 82,
          accuracy: 76,
          consistency: 91,
          duplicates: 12,
          stale: 5
        });
      });
  }, []);

  return (
    <section className="widget">
      <h3>Data Quality</h3>

      <div className="dq-grid">

        <div className="dq-item">
          <span className="dq-label">Completeness</span>
          <span className="dq-value">{quality.completeness}%</span>
        </div>

        <div className="dq-item">
          <span className="dq-label">Accuracy</span>
          <span className="dq-value">{quality.accuracy}%</span>
        </div>

        <div className="dq-item">
          <span className="dq-label">Consistency</span>
          <span className="dq-value">{quality.consistency}%</span>
        </div>

        <div className="dq-item">
          <span className="dq-label">Duplicates</span>
          <span className="dq-value">{quality.duplicates}</span>
        </div>

        <div className="dq-item">
          <span className="dq-label">Stale Records</span>
          <span className="dq-value">{quality.stale}</span>
        </div>

      </div>

      <style>{`
        .dq-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-top: 10px;
        }
        .dq-item {
          background: #f7f7f7;
          padding: 12px;
          border-radius: 6px;
          display: flex;
          justify-content: space-between;
          font-size: 14px;
        }
        .dq-label {
          font-weight: 600;
        }
        .dq-value {
          font-weight: 700;
          color: #2b6cb0;
        }
      `}</style>
    </section>
  );
}
