import React, { useEffect, useState } from "react";
import { getAssetAudit } from "../../api/assetApi";

export default function AssetAuditTab({ assetId }) {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getAssetAudit(assetId)
      .then(r => { if (mounted) setAudits(r.data || []); })
      .catch(() => { if (mounted) setAudits([]); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [assetId]);

  if (loading) return <div>Loading audit…</div>;
  if (!audits.length) return <div>No audit entries</div>;

  return (
    <section>
      <h3>Audit trail</h3>
      <div className="card">
        <ul className="audit-list">
          {audits.map(a => (
            <li key={a._id}>
              <div className="audit-meta">
                <strong>{a.actionType}</strong> — <span className="muted">{a.changedBy}</span> <span className="muted">• {new Date(a.changedAt).toLocaleString()}</span>
              </div>
              <pre className="audit-data">{a.newValue || a.oldValue}</pre>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
