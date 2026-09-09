import React from "react";

interface KPICardProps {
  title: string;
  value: string | number;
  color: string;
  icon?: string;
  glow?: boolean;
  quantum?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  color,
  icon = "⚡",
  glow = true,
  quantum = true
}) => {
  return (
    <div
      style={{
        padding: quantum ? 34 : 24,
        borderRadius: quantum ? 34 : 20,
        background: quantum
          ? `linear-gradient(135deg, ${color}AA, ${color}55)`
          : color,
        backdropFilter: quantum ? "blur(30px)" : "blur(10px)",
        border: quantum ? `1px solid ${color}99` : "none",
        boxShadow: glow
          ? `0 0 ${quantum ? 70 : 25}px ${color}`
          : "none",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        gap: quantum ? 14 : 8,
        cursor: "pointer",
        transition: "transform 0.4s ease, box-shadow 0.4s ease",
        textShadow: quantum ? "0 0 12px rgba(255,255,255,0.6)" : "none",
        position: "relative",
        overflow: "hidden"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-16px)";
        e.currentTarget.style.boxShadow = `0 0 ${quantum ? 100 : 40}px ${color}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = glow
          ? `0 0 ${quantum ? 70 : 25}px ${color}`
          : "none";
      }}
    >
      {/* Quantum floating glow orb */}
      {quantum && (
        <div
          style={{
            position: "absolute",
            top: "-20px",
            right: "-20px",
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: `${color}55`,
            filter: "blur(40px)",
            animation: "pulseOrb 6s infinite alternate"
          }}
        />
      )}

      {/* Icon */}
      <div style={{ fontSize: quantum ? 46 : 32 }}>{icon}</div>

      {/* Title */}
      <div
        style={{
          fontSize: quantum ? 20 : 14,
          opacity: 0.9,
          fontWeight: 500
        }}
      >
        {title}
      </div>

      {/* Value */}
      <div
        style={{
          fontSize: quantum ? 40 : 24,
          fontWeight: 900
        }}
      >
        {value}
      </div>
    </div>
  );
};

export default KPICard;
