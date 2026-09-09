export default function KPICard({ title, value, color, icon }) {
  return (
    <div
      style={{
        padding: 24,
        borderRadius: 20,
        background: color,
        color: "#fff",
        boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        cursor: "pointer",
        transition: "transform 0.25s ease"
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-6px)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
    >
      <div style={{ fontSize: 32 }}>{icon}</div>
      <div style={{ fontSize: 14, opacity: 0.9 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
    </div>
  );
}
