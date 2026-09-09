// ./src/components/analytics/TimelineChart.jsx
import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function TimelineChart({ timeline, granularity = "day" }) {
  const data = (timeline || []).map(t => ({
    bucket: t.bucket,
    count: t.count
  }));

  if (!data.length) return <div style={{ color: "#999" }}>No timeline data yet.</div>;

  return (
    <LineChart width={360} height={240} data={data} margin={{ top: 16, right: 16, left: 0, bottom: 8 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="bucket" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="count" stroke="#4ECDC4" strokeWidth={2} dot={{ r: 3 }} />
    </LineChart>
  );
}
