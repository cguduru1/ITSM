import { useEffect, useState } from "react";
// import api from "../api/api";
import apiClient from "../api/apiClient";


export default function CIAuditLogViewerSN({ id }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get(`/api/cmdb/${id}/audit`).then(res => {
      setLogs(res.data || []);
    });
  }, [id]);

  return (
    <div className="sn-audit">
      <h3>Audit Log</h3>

      <div className="sn-audit-list">
        {logs.length === 0 && <p>No audit entries found</p>}

        {logs.map(log => (
          <div key={log._id} className="sn-audit-item">
            <div className="sn-audit-header">
              <strong>{log.action}</strong>
              <span>{new Date(log.timestamp).toLocaleString()}</span>
            </div>

            <div className="sn-audit-body">
              <p><strong>User:</strong> {log.user}</p>
              <p><strong>Details:</strong> {log.details}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
