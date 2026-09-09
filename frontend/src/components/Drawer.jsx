import React from "react";

export default function Drawer({ open, onClose, children }) {
  return (
    <>
      <div className={`drawer-overlay ${open ? "show" : ""}`} onClick={onClose}></div>

      <div className={`drawer ${open ? "open" : ""}`}>
        <button className="drawer-close" onClick={onClose}>×</button>
        <div className="drawer-content">{children}</div>
      </div>

      <style jsx>{`
        .drawer-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.3);
          opacity: 0;
          pointer-events: none;
          transition: opacity .2s;
        }
        .drawer-overlay.show {
          opacity: 1;
          pointer-events: auto;
        }
        .drawer {
          position: fixed;
          top: 0;
          right: -600px;
          width: 600px;
          height: 100vh;
          background: #fff;
          box-shadow: -2px 0 6px rgba(0,0,0,0.1);
          transition: right .25s ease;
          overflow-y: auto;
          padding: 20px;
        }
        .drawer.open {
          right: 0;
        }
        .drawer-close {
          position: absolute;
          top: 12px;
          right: 12px;
          font-size: 24px;
          background: none;
          border: none;
          cursor: pointer;
        }
      `}</style>
    </>
  );
}
