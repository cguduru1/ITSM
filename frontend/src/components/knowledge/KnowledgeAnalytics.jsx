// src/components/knowledge/KnowledgeAnalytics.jsx
import React from "react";
import { Bar } from "react-chartjs-2";

export default function KnowledgeAnalytics({ analytics }) {
  if (!analytics) return null;

  const statusLabels = analytics.byStatus.map(s => s._id);
  const statusCounts = analytics.byStatus.map(s => s.count);

  return (
    <div className="knowledge-card quantum">
      <h2>Knowledge Analytics</h2>
      <Bar
        data={{
          labels: statusLabels,
          datasets: [{ label: "Articles", data: statusCounts, backgroundColor: "#4ECDC4" }]
        }}
      />
    </div>
  );
}
