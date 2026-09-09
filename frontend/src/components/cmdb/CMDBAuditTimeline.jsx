// src/components/cmdb/CMDBAuditTimeline.jsx
import React, { useEffect, useState } from "react";
import apiClient from "../../api/apiClient";

export default function CMDBAuditTimeline({ ciId }) {
  const [logs, setLogs] = useState([]); 

useEffect(() => {
    if (!ciId) return;

    apiClient
      .get(`/api/cmdb/${ciId}/audit`)
      .then((res) => {
        const responseData = res?.data ?? res;
        const auditList = Array.isArray(responseData)
          ? responseData
          : responseData?.data || responseData?.logs || responseData?.audit || [];

        setLogs(auditList);
      })
      .catch((err) => {
        console.error("Failed to fetch audit timeline:", err);
      });
  }, [ciId]); 

  return (
    <div className="quantum-panel">
      <div className="quantum-header">Audit Timeline</div>
      <div className="cmdb-timeline">
        {logs.length === 0 ? (
          <p style={{ color: "#888", padding: "10px 0" }}>No audit records found.</p>
        ) : (
          logs.map((l, idx) => (
            <div key={l._id || idx} className="cmdb-timeline-item">
              <div className="cmdb-timeline-dot" />
              <div className="cmdb-timeline-content">
                <div className="cmdb-timeline-title">
                  {l.action || "Action"} — {l.ciName || "CI"}
                </div>
                <div className="cmdb-timeline-meta">
                  {l.userName || l.user || "System"} ·{" "}
                  {l.timestamp ? new Date(l.timestamp).toLocaleString() : "Unknown date"}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
  
//  return (
//     <div className="quantum-panel">
//       <div className="quantum-header">Audit Timeline</div>
//       <div className="cmdb-timeline">
//         {logs.map(l => (
//           <div key={l._id} className="cmdb-timeline-item">
//             <div className="cmdb-timeline-dot" />
//             <div className="cmdb-timeline-content">
//               <div className="cmdb-timeline-title">
//                 {l.action} — {l.ciName}
//               </div>
//               <div className="cmdb-timeline-meta">
//                 {l.userName} · {new Date(l.timestamp).toLocaleString()}
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// } 
