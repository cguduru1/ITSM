// ./src/components/analytics/GanttChart.jsx
import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function GanttChart({ items }) {
  const data = useMemo(() => {
    return (items || []).map(i => ({
      name: i.title,
      category: i.category,
      state: i.state,
      start: new Date(i.start).getTime(),
      end: new Date(i.end).getTime(),
      duration: (new Date(i.end).getTime() - new Date(i.start).getTime()) / (1000 * 60 * 60) // hours
    }));
  }, [items]);

  if (!data.length) return <div style={{ color: "#999" }}>No scheduled changes.</div>;

  return (
    <BarChart
      width={900}
      height={400}
      data={data}
      layout="vertical"
      margin={{ top: 20, right: 20, left: 80, bottom: 20 }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis
        type="number"
        domain={["dataMin", "dataMax"]}
        tickFormatter={(ts) => new Date(ts).toLocaleString()}
      />
      <YAxis type="category" dataKey="name" width={200} />
      <Tooltip
        formatter={(value, name, props) => {
          if (name === "duration") return [`${value} hrs`, "Duration"];
          return value;
        }}
        labelFormatter={(label) => label}
      />
      <Bar
        dataKey="start"
        stackId="timeline"
        fill="transparent"
        stroke="transparent"
      />
      <Bar
        dataKey="duration"
        stackId="timeline"
        fill="#4ECDC4"
        name="Duration"
      />
    </BarChart>
  );
}
