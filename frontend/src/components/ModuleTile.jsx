import React from "react";
import { useNavigate } from "react-router-dom";

export default function ModuleTile({ title, subtitle, link, color = "#58a6ff", icon = "🔹", disabled = false }) {
  const navigate = useNavigate();
  const onClick = () => { if (!disabled && link && link !== "#") navigate(link); };

  return (
    <div
      className={`quantum-module-tile ${disabled ? "disabled" : ""}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") onClick(); }}
      style={{ borderLeft: `4px solid ${color}` }}
      aria-disabled={disabled}
    >
      <div className="tile-icon">{icon}</div>
      <div className="tile-body">
        <div className="tile-title">{title}</div>
        <div className="tile-sub">{subtitle}</div>
      </div>
    </div>
  );
}
