// ./src/components/ModuleTile.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import '../styles/changeModule.css';

/**
 * ModuleTile
 * Props:
 *  - title, subtitle, link, color (accent), icon (string)
 */
export default function ModuleTile({ title, subtitle, link, color = "#556EE6", icon = "requests",disabled =false, required=null }) {
  const badge = disabled ? 'Locked' : null;
  const tooltip = disabled && required ? `Requires ${required.resource}:${required.action} permission` : '';

  const content = (
    <motion.div
      className={`module-tile ${disabled ? 'module-tile-disabled' : ''}`}
      style={{ borderLeft: `6px solid ${color}` }}
      whileHover={disabled ? {} : { y: -6, scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.995 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      aria-disabled={disabled}
      title={tooltip}
    >
      <div className="module-tile-icon" style={{ background: `${color}22` }}>
        <Icon name={icon} color={color} />
      </div>

      <div className="module-tile-body">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h3 className="module-tile-title">{title}</h3>
          {badge && <span className="tile-badge" aria-hidden>{badge}</span>}
        </div>
        <p className="module-tile-sub">{subtitle}</p>
      </div>

      <div className="module-tile-cta" aria-hidden>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M5 12h14M13 5l7 7-7 7" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </motion.div>
  );

  // If disabled, render a non-clickable div (but still keyboard focusable)
  if (disabled) {
    return (
      <div role="button" tabIndex={0} onKeyDown={() => {}} aria-label={`${title} (locked)`}>
        {content}
      </div>
    );
  }

  return (
    <Link to={link} className="module-tile-link" aria-label={title}>
      
      <motion.div className="module-tile" style={{ borderLeft: `6px solid ${color}` }} whileHover={{ y: -6, scale: 1.02 }}
        whileTap={{ scale: 0.995 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        layout>
        <div className="module-tile-icon" style={{ background: `${color}22` }}>
          <Icon name={icon} color={color} />
        </div>
        <div className="module-tile-body">
          <h3 className="module-tile-title">{title}</h3>
          <p className="module-tile-sub">{subtitle}</p>
        </div>
        <div className="module-tile-cta" aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M5 12h14M13 5l7 7-7 7" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </motion.div>
    </Link>
  );
}

/* Inline SVG icons - keep small and accessible */
function Icon({ name, color }) {
  const common = { width: 36, height: 36, viewBox: "0 0 24 24", fill: "none", "aria-hidden": true };
  switch (name) {
    case "calendar":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="16" rx="2" stroke={color} strokeWidth="1.6" />
          <path d="M16 3v4M8 3v4" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "analytics":
      return (
        <svg {...common}>
          <path d="M4 19v-7M10 19v-3M16 19v-11M22 19v-5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "timeline":
      return (
        <svg {...common}>
          <path d="M3 12h18M7 6v12M17 6v12" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "cmdb":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" stroke={color} strokeWidth="1.6" />
          <rect x="14" y="3" width="7" height="7" stroke={color} strokeWidth="1.6" />
          <rect x="3" y="14" width="7" height="7" stroke={color} strokeWidth="1.6" />
          <rect x="14" y="14" width="7" height="7" stroke={color} strokeWidth="1.6" />
        </svg>
      );
    case "admin":
      return (
        <svg {...common}>
          <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke={color} strokeWidth="1.6" />
          <path d="M19.4 15a7 7 0 00.6-3 7 7 0 00-.6-3l2.1-1.6-2-3.4-2.5 1a7 7 0 00-2.6-1.5L14 1h-4l-.9 3.5a7 7 0 00-2.6 1.5l-2.5-1-2 3.4L4.6 9A7 7 0 004 12c0 1 .2 2 .6 3l-2.1 1.6 2 3.4 2.5-1a7 7 0 002.6 1.5L10 23h4l.9-3.5a7 7 0 002.6-1.5l2.5 1 2-3.4L19.4 15z" stroke={color} strokeWidth="1.2" fill="none"/>
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M3 12h18M12 3v18" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
  }
}
