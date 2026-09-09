import React from "react";

export default function ContextRail({ open, onClose, children }: { open: boolean; onClose: () => void; children?: React.ReactNode }) {
  return (
    <div className={`slide-over ${open ? "open" : ""}`} role="dialog" aria-hidden={!open}>
      <div style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: 700 }}>Details</div>
        <button onClick={onClose}>Close</button>
      </div>
      <div style={{ padding: 16 }}>{children}</div>
    </div>
  );
}
