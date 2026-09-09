// ./src/components/analytics/CiImpactChart.jsx
import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function CiImpactChart({ data }) {
  if (!data || !data.length) return <div style={{ color: "#999" }}>No CI impact data.</div>;

  return (
    <BarChart width={360} height={240} data={data} margin={{ top: 16, right: 16, left: 0, bottom: 40 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="ciName" angle={-30} textAnchor="end" height={60} />
      <YAxis />
      <Tooltip />
      <Bar dataKey="count" name="Changes" fill="#FF6B6B" />
    </BarChart>
  );
}
