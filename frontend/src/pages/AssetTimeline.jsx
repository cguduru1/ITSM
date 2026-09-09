import { useEffect, useState } from "react";
import api from "../api/api";
import { useParams } from "react-router-dom";

export default function AssetTimeline() {
  const { id } = useParams();
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get(`/assets/${id}/timeline`).then((res) => setLogs(res.data));
  }, [id]);

  return (
    <div className="page">
      <h1>Asset Timeline</h1>

      {logs.map((l) => (
        <div key={l._id} className="timeline-item">
          <p><b>{l.action}</b></p>
          <p>{l.oldValue} → {l.newValue}</p>
          <p>{l.updatedBy}</p>
          <p>{new Date(l.createdAt).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
