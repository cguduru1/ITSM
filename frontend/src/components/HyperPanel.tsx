import React from "react";

export default function HyperPanel({
  title,
  subtitle,
  accent,
  children
}: {
  title: string;
  subtitle?: string;
  accent: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: 45,
        borderRadius: 40,
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(45px)",
        border: `2px solid ${accent}88`,
        boxShadow: `0 0 80px ${accent}55`,
        color: "#fff",
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.5s ease, box-shadow 0.5s ease"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-18px) scale(1.03)";
        e.currentTarget.style.boxShadow = `0 0 120px ${accent}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.boxShadow = `0 0 80px ${accent}55`;
      }}
    >
      {/* Hyperdrive energy ring */}
      <div
        style={{
          position: "absolute",
          top: "-60px",
          right: "-60px",
          width: 260,
          height: 260,
          borderRadius: "50%",
          border: `6px solid ${accent}55`,
          animation: "spinSlow 16s linear infinite"
        }}
      />

      <h2 style={{ margin: 0, fontSize: 32, color: accent }}>{title}</h2>
      {subtitle && (
        <p style={{ marginTop: 10, color: "#ccc", fontSize: 18 }}>{subtitle}</p>
      )}

      <div style={{ marginTop: 30 }}>{children}</div>
    </div>
  );
}
