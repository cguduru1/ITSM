import React, { useEffect, useState } from "react";
import apiClient from "../api/apiClient";
import KBPanel from "../components//kb/KBPanel";

// export default function KBAuditViewer() {
//   // 1. Initialize state as an empty array instead of null/undefined
//   const [logs, setLogs] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchAuditLogs = async () => {
//       try {
//         setLoading(true);
//         const res = await apiClient.get("/api/kb/audit-logs");
//         // 2. Ensure data is an array before setting state
//         setLogs(res.data || res || []);
//       } catch (err) {
//         console.error("Failed to load audit logs:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAuditLogs();
//   }, []);

  // if (loading) return <KBPanel title="Audit Trail">Loading audit logs...</KBPanel>;

//   return (
//     <KBPanel title="Audit Log">
//       <ul className="kb-audit-list">
//         {logs.map(l => (
//           <li key={l._id}>
//             <strong>{l.action}</strong> — {l.articleTitle}  
//             <br />
//             by {l.userName} at {new Date(l.timestamp).toLocaleString()}
//           </li>
//         ))}
//       </ul>
//     </KBPanel>
//   );
// }



// return (
//     <KBPanel title="Audit Trail">
//       <div className="kb-audit-container">
//         <h3>Recent Activity Logs</h3>
        
        
//         {/* 3. Safe check with optional chaining */}
//         {logs?.length === 0 ? (
//           <p>No audit activity recorded yet.</p>
//         ) : (
//           <ul className="kb-audit-list">
//             {logs?.map((log) => (
//               <li key={log._id || Math.random()} className="kb-audit-item">
//                 <strong>{log.title || "Article Update"}</strong>
//                 <span> — Version: {log.version || 1}</span>
//                 <p>Updated: {log.updatedAt ? new Date(log.updatedAt).toLocaleString() : "N/A"}</p>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </KBPanel>
//   );
// }

export default function KBAuditViewer() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get("/api/kb/audit");
        setLogs(res.data || res || []);
      } catch (err) {
        console.error("Failed to load audit logs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, []);

 return (
  <div className="quantum-panel">
    <KBPanel title="Audit Logs">
      <div style={{ padding: "16px" }}>
        <h2 style={{ marginBottom: "16px", color: "#38bdf8" }}>📋 Audit Logs</h2>

        {loading ? (
          <p style={{ color: "#94a3b8" }}>Loading logs...</p>
        ) : !logs || logs.length === 0 ? (
          <p style={{ color: "#64748b" }}>No audit records available.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {logs.map((log, index) => (
              <li key={log._id || log.id || index} style={cardStyle}>
                <div>
                  <strong style={{ color: "#facc15" }}>
                    {log.action || "Action"}
                  </strong>
                  <p style={{ color: "#e2e8f0", margin: "4px 0 0 0", fontSize: "14px" }}>
                    {log.message || log.details || "No details"}
                  </p>
                </div>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                  {log.userName || log.user || "System"} •{" "}
                  {log.timestamp
                    ? new Date(log.timestamp).toLocaleString()
                    : "Unknown date"}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </KBPanel>
  </div>
);
}

const cardStyle = {
  background: "#0f172a",           // dark background
  border: "1px solid #334155",     // subtle border
  borderLeft: "6px solid #4ECDC4", // teal accent stripe
  borderRadius: "8px",
  padding: "12px 16px",
  marginBottom: "12px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  color: "#f8fafc",
  boxShadow: "0 1px 3px rgba(0,0,0,0.3)"
};

