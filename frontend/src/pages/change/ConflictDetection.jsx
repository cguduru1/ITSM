import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { createPortal } from "react-dom";
import { io } from "socket.io-client";
import "../../styles/cmdb.css";
import "../../styles/changeQuantum.css";
import "../../styles/ticket.css";  

/* Portal dropdown component with outside click listener */
function PortalDropdown({ anchorRect, options = [], onSelect, onClose }) {
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!anchorRect) return;

    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [anchorRect, onClose]);

  if (!anchorRect) return null;

  const style = {
    position: "absolute",
    top: anchorRect.bottom + window.scrollY + 6,
    left: anchorRect.left + window.scrollX,
    minWidth: Math.max(220, anchorRect.width),
    zIndex: 99999,
    background: "#07101a",
    borderRadius: 8,
    boxShadow: "0 8px 30px rgba(2,6,23,0.6)",
    padding: 8,
    border: "1px solid rgba(255,255,255,0.1)"
  };

  return createPortal(
    <div ref={dropdownRef} style={style} role="menu">
      {options.map((o) => (
        <div
          key={o.id}
          onClick={() => onSelect(o)}
          style={{
            padding: "8px 12px",
            color: "#e6eef8",
            cursor: "pointer",
            borderRadius: 4,
            transition: "background 0.2s"
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#1e293b")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          {o.label}
        </div>
      ))}
    </div>,
    document.body
  );
}

export default function ConflictDetection() {
  const [dropdownAnchor, setDropdownAnchor] = useState(null);
  const [activeConflict, setActiveConflict] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef(null);

   // 1. DEFINE CALLBACK FIRST SO EFFECT CAN CONSUME IT SAFELY 👇
  const closeDropdown = useCallback(() => {
    setDropdownAnchor(null);
    setActiveConflict(null);
  }, []);

  const dropdownOptions = [
    { id: "resolve", label: "Auto-Reschedule Change" },
    { id: "override", label: "Force Override Warning" },
    { id: "dismiss", label: "Dismiss Conflict Alert" }
  ];

  useEffect(() => {
    // Establish connection with fallback support
    const socket = io("http://localhost:4000", {
      path: "/realtime",
      transports: ["websocket", "polling"], // Try WebSocket first, fallback to polling
      withCredentials: true,
      autoConnect: true
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      setSocketConnected(true);
    });

    socket.on("connect_error", (err) => {
      console.warn("Socket connection error (falling back to polling):", err.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setSocketConnected(false);
    });

    // Clean up connection when unmounting to prevent ghost websockets
    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
      socket.disconnect();
    };
  }, []);
  
  // 3. Scroll & resize listener (now safely references closeDropdown above)
  useEffect(() => {
    if (!dropdownAnchor) return;
    window.addEventListener("scroll", closeDropdown, true);
    window.addEventListener("resize", closeDropdown);
    return () => {
      window.removeEventListener("scroll", closeDropdown, true);
      window.removeEventListener("resize", closeDropdown);
    };
  }, [dropdownAnchor, closeDropdown]);

  const openDropdown = (e, conflict) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setDropdownAnchor(rect);
    setActiveConflict(conflict);
  };

  const onSelect = (opt) => {
    if (activeConflict && socketRef.current) {
      socketRef.current.emit("conflict:action", {
        conflictId: activeConflict.id || activeConflict._id,
        action: opt.id
      });
    }
    closeDropdown();
  };

  return (
    <div className="quantum-page">
      {/* Header */}
      <div className="ticket-header"> 
      <header className="quantum-header">
        <h1>⚡ Conflict Detection</h1>
        <p>
          Live scheduling conflicts and blackout detection
        </p>
       <Link to="/workspace/change" className="quantum-link" style={{ color: '#ffffff' }}>
                  ← Back to Dashboard
                </Link>
      </header>
      </div>

      {/* Body */}
      <div className="quantum-page-body quantum-grid">
        <section className="quantum-panel">
          <h3 className="quantum-heading">Live Conflicts</h3>
          <div className="quantum-card">
            {/* Status + Clear */}
            <div className="quantum-flex quantum-justify-between quantum-align-center">
              <span
                className={
                  socketConnected
                    ? "quantum-badge quantum-badge-success"
                    : "quantum-badge quantum-badge-danger"
                }
              >
                {socketConnected ? "● Live" : "○ Disconnected"}
              </span>
              <button
                className="quantum-btn quantum-btn-secondary"
                onClick={() => setConflicts([])}
              >
                Clear
              </button>
            </div>

            {/* Conflict List */}
            <div style={{ marginTop: "12px" }}>
              {conflicts.length === 0 ? (
                <p className="muted">No conflicts detected</p>
              ) : (
                <ul className="quantum-list">
                  {conflicts.map((c, i) => (
                    <li
                      key={c.id || c._id || `conflict-${i}`}
                      className="quantum-item quantum-flex quantum-justify-between quantum-align-center"
                    >
                      <div>
                        <div className="quantum-label">
                          {c.title || "Untitled Conflict"}
                        </div>
                        <div className="muted">
                          {c.details || "No details provided"}
                        </div>
                      </div>
                      <button
                        className="quantum-btn quantum-btn-primary"
                        onClick={(e) => openDropdown(e, c)}
                      >
                        Actions
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Portal Dropdown */}
      <PortalDropdown
        anchorRect={dropdownAnchor}
        options={dropdownOptions}
        onSelect={onSelect}
        onClose={closeDropdown}
      />
    </div>
  );
}