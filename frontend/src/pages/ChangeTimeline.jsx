// ./src/pages/ChangeTimeline.jsx
import React, { useEffect, useState } from "react";
import api from "../api/apiClient.js";
import GanttChart from "../components/analytics/GanttChart.jsx";

export default function ChangeTimeline() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get("/api/analytics/timeline-gantt").then(res => setItems(res.data || []));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Change Timeline (Gantt View)</h2>
      <p style={{ color: "#666" }}>Visual timeline of scheduled changes.</p>

      <GanttChart items={items} />
    </div>
  );
}
