// src/components/kb/KBBookmarksPanel.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../api/apiClient"; // Adjust relative path if needed
import KBPanel from "./KBPanel";

export default function KBBookmarksPanel({ bookmarks: propBookmarks }) {
  const [bookmarks, setBookmarks] = useState(propBookmarks || []);
  const [loading, setLoading] = useState(!propBookmarks);

  useEffect(() => {
    // Fetch bookmarks if not directly provided via props
    if (!propBookmarks) {
      const fetchBookmarks = async () => {
        try {
          setLoading(true);
          const res = await apiClient.get("/api/kb/bookmarks");
          const data = res?.data || res || [];
          setBookmarks(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error("Failed to load bookmarks:", err);
          setBookmarks([]);
        } finally {
          setLoading(false);
        }
      };

      fetchBookmarks();
    }
  }, [propBookmarks]);

  return (
  <div className="quantum-panel">
    <KBPanel title="Bookmarks Overview">
      <div style={{ padding: "16px" }}>
        <h2 style={{ marginBottom: "16px", color: "#38bdf8" }}>🔖 Your Bookmarked Articles</h2>

        {loading ? (
          <p style={{ color: "#94a3b8" }}>Loading bookmarks...</p>
        ) : !bookmarks || bookmarks.length === 0 ? (
          <p style={{ color: "#64748b" }}>You haven't bookmarked any articles yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {bookmarks.map((b) => {
              const articleId = b._id || b.id;
              return (
                <li key={articleId} style={cardStyle}>
                  <Link
                    to={`/kb/${articleId}`}
                    style={{
                      color: "#38bdf8",
                      fontWeight: 600,
                      textDecoration: "none"
                    }}
                  >
                    📄 {b.title || "Untitled Article"}
                  </Link>
                  {b.category && (
                    <span style={badgeStyle}>{b.category}</span>
                  )}
                </li>
              );
            })}
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
  alignItems: "center",
  justifyContent: "space-between",
  color: "#f8fafc",
  boxShadow: "0 1px 3px rgba(0,0,0,0.3)"
};

const badgeStyle = {
  fontSize: "12px",
  background: "#1e293b",
  color: "#facc15",                // yellow text for contrast
  padding: "2px 8px",
  borderRadius: "4px",
  fontWeight: "600"
};
