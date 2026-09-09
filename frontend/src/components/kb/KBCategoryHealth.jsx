// src/components/kb/KBCategoryHealth.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../api/apiClient"; // Adjust path if needed
import KBPanel from "./KBPanel";
import "../../styles/cmdb.css";
import "../../styles/ticket.css";

export default function KBCategoryHealth({ analytics: propAnalytics }) {
  const [data, setData] = useState(propAnalytics || null);
  const [loading, setLoading] = useState(!propAnalytics);

  useEffect(() => {
    // If analytics prop isn't provided by a parent, fetch directly from API
    if (!propAnalytics) {
      const fetchCategoryHealth = async () => {
        try {
          setLoading(true);
          const res = await apiClient.get("/api/kb/analytics");
          setData(res?.data || res);
        } catch (err) {
          console.error("Failed to load category health data:", err);
          setData(null);
        } finally {
          setLoading(false);
        }
      };

      fetchCategoryHealth();
    }
  }, [propAnalytics]);

  // Safe fallback array
  const categories = data?.byCategory || data?.byStatus || [];

  return (
  <div className="quantum-panel">
    <div className="ticket-header">
      <h2 style={{ marginBottom: "16px", color: "#38bdf8" }}>📊 Category Health</h2>
      <Link to="/kb" className="quantum-link" style={{ color: '#ffffff' }}>
        ← Back to Dashboard
      </Link>
    </div>

      {loading ? (
        <p style={{ color: "#94a3b8" }}>Loading category statistics...</p>
      ) : categories.length === 0 ? (
        <p style={{ color: "#64748b" }}>No category health metrics available.</p>
      ) : (
        <div
          className="quantum-tile-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "20px"
          }}
        >
          {categories.map((cat, idx) => {
            const categoryName = cat._id || "Uncategorized";
            return (
              <div
                key={cat._id || `cat-${idx}`}
                className="quantum-card"
                style={cardStyle}
              >
                <h3 style={cardHeader}>{categoryName}</h3>
                <p style={itemStyle}>
                  Total Articles: <strong>{cat.count ?? 0}</strong>
                </p>
                <p style={itemStyle}>
                  Total Views: <strong>{cat.views ?? 0}</strong>
                </p>
                <p style={itemStyle}>
                  Avg Rating:{" "}
                  <strong>
                    {typeof cat.avgRating === "number" ? cat.avgRating.toFixed(1) : "N/A"}
                  </strong>
                </p>
                <p style={itemStyle}>
                  Helpful: <strong style={{ color: "#16a34a" }}>{cat.yesFeedback ?? 0}</strong>
                </p>
                <p style={itemStyle}>
                  Not Helpful: <strong style={{ color: "#dc2626" }}>{cat.noFeedback ?? 0}</strong>
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
);
} 

const cardStyle = {
  background: "#0f172a",          // dark panel background
  border: "1px solid #334155",    // subtle border
  borderLeft: "6px solid #4ECDC4",// green accent stripe on left
  borderRadius: "8px",
  padding: "20px",
  color: "#f8fafc",               // light text
  boxShadow: "0 1px 3px rgba(0,0,0,0.3)"
};

const cardHeader = {
  margin: "0 0 12px 0",
  fontSize: "18px",
  fontWeight: "600",
  color: "#38bdf8"
};

const itemStyle = {
  margin: "4px 0",
  fontSize: "14px",
  color: "#e2e8f0"
};

//   return (
//     <KBPanel title="Category Health Overview">
//       <div style={{ padding: "16px" }}>
//         <h2 style={{ marginBottom: "16px", color: "#1e293b" }}>📊 Category Health</h2>

//         {loading ? (
//           <p>Loading category statistics...</p>
//         ) : categories.length === 0 ? (
//           <p style={{ color: "#64748b" }}>No category health metrics available.</p>
//         ) : (
//           <div
//             className="kb-tile-grid"
//             style={{
//               display: "grid",
//               gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
//               gap: "16px"
//             }}
//           >
//             {categories.map((cat, idx) => {
//               const categoryName = cat._id || "Uncategorized";
//               return (
//                 <div
//                   key={cat._id || `cat-${idx}`}
//                   className="kb-tile quantum-tile"
//                   style={{
//                     background: "#ffffff",
//                     border: "1px solid #e2e8f0",
//                     borderRadius: "8px",
//                     padding: "16px",
//                     boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
//                   }}
//                 >
//                   <h3 style={{ margin: "0 0 12px 0", color: "#0f172a", fontSize: "18px" }}>
//                     {categoryName}
//                   </h3>
//                   <p style={itemStyle}>Total Articles: <strong>{cat.count ?? 0}</strong></p>
//                   <p style={itemStyle}>Total Views: <strong>{cat.views ?? 0}</strong></p>
//                   <p style={itemStyle}>
//                     Avg Rating:{" "}
//                     <strong>
//                       {typeof cat.avgRating === "number" ? cat.avgRating.toFixed(1) : "N/A"}
//                     </strong>
//                   </p>
//                   <p style={itemStyle}>Helpful: <strong style={{ color: "#16a34a" }}>{cat.yesFeedback ?? 0}</strong></p>
//                   <p style={itemStyle}>Not Helpful: <strong style={{ color: "#dc2626" }}>{cat.noFeedback ?? 0}</strong></p>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </KBPanel>
//   );
// }

// const itemStyle = {
//   margin: "4px 0",
//   fontSize: "14px",
//   color: "#475569"
// };