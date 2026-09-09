import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
// import api from "../api/api";
import apiClient from "../api/apiClient";


export default function AuditLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/admin/audit");
        setLogs(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, []);

  return (
    <MainLayout>
      <div className="audit-page">

        {/* Watermark */}
        <div className="page-watermark">
          <img src="/s3-watermark.png" alt="S3 Technologies" />
        </div>

        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Audit Logs</h1>
          <p className="page-subtitle">
            Track system activity, administrative actions, and security events
          </p>
        </div>

        {/* Audit Table */}
        <div className="audit-table-card">
          <table className="audit-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Action</th>
                <th>Module</th>
                <th>IP Address</th>
                <th>Date & Time</th>
              </tr>
            </thead>

            <tbody>
              {logs.map((log, i) => (
                <tr key={i}>
                  <td>{log.user || "System"}</td>
                  <td>{log.action}</td>
                  <td>{log.module}</td>
                  <td>{log.ip || "N/A"}</td>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </MainLayout>
  );
}
