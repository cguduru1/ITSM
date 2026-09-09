// src/components/cmdb/CMDBAIAssistant.jsx
import React, { useEffect, useState } from "react";
import apiClient from "../../api/apiClient";
import "../../styles/cmdb.css";

export default function CMDBAIAssistant({ ciId }) {
  const [ai, setAi] = useState(null);

useEffect(() => {
    // 1. Guard against missing ciId
    if (!ciId) return;

    // 2. Use apiClient (not api)
    apiClient
      .get(`/api/cmdb/ai/${ciId}`)
      .then((res) => {
        // Safe unpacking for apiClient payloads
        const responseData = res?.data ?? res;
        const aiData = responseData?.data || responseData?.ai || responseData || null;
        setAi(aiData);
      })
      .catch((err) => {
        console.error("Failed to fetch AI assessment:", err);
      });
  }, [ciId]);

  if (!ai) return null;

   return (
    <div className="quantum-panel">
      <div className="quantum-header">AI Impact & Risk</div>

      <div className="quantum-row">
        <span className="quantum-label">Risk Score:</span>
        <span className="quantum-badge">
          <div className="risk-score">
          {ai.riskscore ?? "N/A"}
          </div>
        </span>
      </div>

      <div className="quantum-body">
        {ai.explanation || "No AI explanation provided."}
      </div>
    </div>
  );
}