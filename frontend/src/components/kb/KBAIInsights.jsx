// src/components/kb/KBAIInsights.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../api/apiClient"; // Adjust path if needed
import KBPanel from "./KBPanel";
import "../../styles/cmdb.css";
import "../../styles/ticket.css";

export default function KBAIInsights({ insights: propInsights }) {
  const [insights, setInsights] = useState(propInsights || []);
  const [loading, setLoading] = useState(!propInsights);

  useEffect(() => {
    // Fetch insights if not directly passed as a prop
    if (!propInsights) {
      const fetchInsights = async () => {
        try {
          setLoading(true);
          const res = await apiClient.get("/api/kb/ai-insights");
          const data = res?.data || res || [];
          setInsights(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error("Failed to load AI insights:", err);
          setInsights([]);
        } finally {
          setLoading(false);
        }
      };

      fetchInsights();
    }
  }, [propInsights]);

  return (
    
  <div className="quantum-panel">
    <KBPanel title="AI Insights Overview">
        <div className="ticket-header">
      <h1>🤖 AI Insights</h1>
      <Link to="/kb" className="quantum-link" style={{ color: '#ffffff' }}>
                          ← Back to Dashboard
        </Link>
      </div>

        {loading ? (
          <p>Generating AI insights...</p>
        ) : !insights || insights.length === 0 ? (
          <p style={{ color: "#64748b" }}>No insights available at this time.</p>
        ) : (
          <ul className="kb-insight-list" style={{ listStyle: "none", padding: 0 }}>
            {insights.map((i, index) => (
              <li
                key={i.id || index}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0", 
                  borderRadius: "8px",
                  padding: "16px",
                  marginBottom: "12px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                }}
              >
                <strong style={{ color: "#0f172a", fontSize: "16px" }}>{i.title}</strong>
                <p style={{ color: "#475569", marginTop: "6px", marginBottom: 0 }}>{i.message}</p>
              </li>
            ))}
          </ul>
        )}
    </KBPanel>
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