// src/components/kb/KBAttachmentManager.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../api/apiClient"; // Adjust path if needed
import KBPanel from "./KBPanel";
import "../../styles/cmdb.css";
import "../../styles/ticket.css";

export default function KBAttachmentManager() {
  const [attachments, setAttachments] = useState([
    { id: 1, name: "HR_Policy_2024.pdf", size: "1.2 MB", type: "document" },
    { id: 2, name: "Troubleshooting.png", size: "450 KB", type: "image" },
    { id: 3, name: "TrainingVideo.mp4", size: "14.8 MB", type: "video" }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAttachments = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get("/api/kb/attachments");
        if (res?.data || Array.isArray(res)) {
          setAttachments(res.data || res);
        }
      } catch (err) {
        console.error("Failed to load attachments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttachments();
  }, []);

  const handleUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files).map((file, idx) => ({
      id: Date.now() + idx,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      type: file.type.includes("image") ? "image" : "document"
    }));

    setAttachments((prev) => [...newFiles, ...prev]);
  };

  const handleDelete = (id) => {
    setAttachments((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="quantum-panel">
    {/* <KBPanel title="Attachment Manager"> */}
      <div className="ticket-header">
        <h1>Attachment Manager</h1>
     <Link to="/kb" className="quantum-link" style={{ color: '#ffffff' }}>
             ← Back to Dashboard
           </Link>
         </div>

      <div style={{ padding: "16px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px"
          }}
        >
          <h2 style={{ margin: 0, color: "#38bdf8" }}>📂 File Attachments</h2>
          <label
            className="kb-btn"
            style={{
              cursor: "pointer",
              background: "#2563eb",
              color: "#ffffff",
              padding: "8px 16px",
              borderRadius: "6px",
              display: "inline-block"
            }}
          >
            Upload Attachment
            <input
              type="file"
              multiple
              onChange={handleUpload}
              style={{ display: "none" }}
            />
          </label>
        </div>

        {loading ? (
         <p style={{ color: "#94a3b8" }}> Loading files...</p>
        ) : attachments.length === 0 ? (
          <p style={{ color: "#64748b" }}>No attachments uploaded yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {attachments.map((file) => (
              <li key={file.id} style={cardStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span>
                    {file.name.endsWith(".png") || file.name.endsWith(".jpg")
                      ? "🖼️"
                      : file.name.endsWith(".mp4")
                      ? "🎬"
                      : "📄"}
                  </span>
                  <span style={{ fontWeight: 600, color: "#f8fafc" }}>{file.name}</span>
                  {file.size && (
                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>({file.size})</span>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(file.id)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#dc2626",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "600"
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    {/* </KBPanel> */}
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