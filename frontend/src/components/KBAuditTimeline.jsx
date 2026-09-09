import React, { useEffect, useState } from "react";
import KBPanel from "./KBPanel";
// import api from "../../api/api";
import apiClient from "../api/apiClient";


export default function KBAuditTimeline() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get("/api/kb/audit").then(res => setLogs(res.data));
  }, []);

  return (
    <KBPanel title="Audit Timeline">
      <div className="kb-timeline">
        {logs.map(l => (
          <div key={l._id} className="kb-timeline-item">
            <div className="kb-timeline-dot" />
            <div className="kb-timeline-content">
              <div className="kb-timeline-title">
                {l.action} — {l.articleTitle}
              </div>
              <div className="kb-timeline-meta">
                {l.userName} · {new Date(l.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </KBPanel>
  );
}
