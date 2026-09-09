// ./src/components/analytics/RiskBar.jsx
import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";

export default function RiskBar({ riskDist }) {
  const data = useMemo(
    () =>
      (riskDist || []).map(r => ({
        riskLevel: r._id,
        count: r.count,
        avgScore: Math.round(r.avgScore || 0)
      })),
    [riskDist]
  );

  if (!data.length) return <div style={{ color: "#999" }}>No risk data yet.</div>;

  return (
    <BarChart width={320} height={240} data={data} margin={{ top: 16, right: 16, left: 0, bottom: 8 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="riskLevel" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="count" name="Count" fill="#8884d8" />
      <Bar dataKey="avgScore" name="Avg Score" fill="#82ca9d" />
    </BarChart>
  );
}
