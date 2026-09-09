import { useEffect, useState } from "react";
// import api from "../api/api";
import apiClient from "../api/apiClient";


export default function CIChangeHistorySN({ id }) {
  const [changes, setChanges] = useState([]);

  useEffect(() => {
    api.get(`/api/cmdb/${id}/changes`).then(res => {
      setChanges(res.data || []);
    });
  }, [id]);

  return (
    <div className="sn-change-history">
      <h3>Change History</h3>

      {changes.length === 0 && <p>No change records found</p>}

      {changes.map(change => (
        <div key={change._id} className="sn-change-item">
          <div className="sn-change-header">
            <strong>{change.title}</strong>
            <span>{new Date(change.createdAt).toLocaleString()}</span>
          </div>

          <div className="sn-change-body">
            <p><strong>Type:</strong> {change.type}</p>
            <p><strong>Status:</strong> {change.status}</p>
            <p><strong>Requested By:</strong> {change.requested_by}</p>
            <p><strong>Description:</strong> {change.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
