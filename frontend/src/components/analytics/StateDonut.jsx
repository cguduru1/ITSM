// ./src/components/analytics/StateDonut.jsx
import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#4ECDC4", "#FF6B6B", "#F7B731", "#9C27B0", "#00A8FF", "#2ECC71"];

export default function StateDonut({ stateCounts }) {
  const data = useMemo(
    () => (stateCounts || []).map(s => ({ name: s._id, value: s.count })),
    [stateCounts]
  );

  if (!data.length) return <div style={{ color: "#999" }}>No data yet.</div>;

  return (
    <PieChart width={320} height={240}>
      <Pie
        data={data}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={80}
        label
      >
        {data.map((entry, idx) => (
          <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  );
}
