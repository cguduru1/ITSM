// ./src/components/analytics/RiskHeatmap.jsx
import React, { useMemo } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, CartesianGrid } from "recharts";

export default function RiskHeatmap({ heatmap }) {
  const data = useMemo(
    () =>
      (heatmap || []).map(h => ({
        category: h.category || "Uncategorized",
        ciName: h.ciName || "Unknown CI",
        avgRisk: Math.round(h.avgRisk || 0),
        count: h.count || 0
      })),
    [heatmap]
  );

  if (!data.length) return <div style={{ color: "#999" }}>No heatmap data yet.</div>;

  // map categories and CI names to numeric axes
  const categories = Array.from(new Set(data.map(d => d.category)));
  const cis = Array.from(new Set(data.map(d => d.ciName)));

  const mapped = data.map(d => ({
    x: categories.indexOf(d.category) + 1,
    y: cis.indexOf(d.ciName) + 1,
    z: d.avgRisk,
    labelX: d.category,
    labelY: d.ciName
  }));

  return (
    <ScatterChart width={360} height={260} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
      <CartesianGrid />
      <XAxis
        type="number"
        dataKey="x"
        tickFormatter={idx => categories[idx - 1]}
        name="Category"
        domain={[1, categories.length]}
      />
      <YAxis
        type="number"
        dataKey="y"
        tickFormatter={idx => cis[idx - 1]}
        name="CI"
        domain={[1, cis.length]}
      />
      <ZAxis type="number" dataKey="z" range={[50, 400]} name="Avg Risk" />
      <Tooltip
        cursor={{ strokeDasharray: "3 3" }}
        formatter={(value, name, props) => {
          if (name === "z") return [`${value}`, "Avg Risk"];
          return value;
        }}
        labelFormatter={(label, payload) => {
          const p = payload && payload[0];
          return p ? `${p.payload.labelX} / ${p.payload.labelY}` : "";
        }}
      />
      <Scatter data={mapped} fill="#FF6B6B" />
    </ScatterChart>
  );
}
