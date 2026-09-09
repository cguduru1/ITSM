// ./src/components/analytics/KpiStrip.jsx
import React, { useMemo } from "react";

export default function KpiStrip({ stateCounts, successStats }) {
  const totalChanges = useMemo(
    () => (stateCounts || []).reduce((sum, s) => sum + (s.count || 0), 0),
    [stateCounts]
  );

  const successRate = useMemo(() => {
    const s = Number(successStats.success || 0);
    const r = Number(successStats.rollback || 0);
    const total = s + r;
    if (!total) return 0;
    return Math.round((s / total) * 100);
  }, [successStats]);

  const highRiskCount = useMemo(
    () => (stateCounts || []).filter(s => s._id === "Implement" || s._id === "Review").reduce((sum, s) => sum + s.count, 0),
    [stateCounts]
  );

  return (
    <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
      <KpiCard label="Total Changes" value={totalChanges} />
      <KpiCard label="Success Rate" value={`${successRate}%`} />
      <KpiCard label="In-flight (Implement/Review)" value={highRiskCount} />
    </div>
  );
}

function KpiCard({ label, value }) {
  return (
    <div
      style={{
        flex: 1,
        background: "#fff",
        borderRadius: 8,
        padding: 12,
        border: "1px solid #eee"
      }}
    >
      <div style={{ fontSize: 12, color: "#888" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 600, marginTop: 4 }}>{value}</div>
    </div>
  );
}
