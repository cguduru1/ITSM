// src/components/TopBar.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";        // ✅ FIXED IMPORT
import { logout as apiLogout } from "../services/auth";

export default function TopBar({ user: userProp }) {
  const navigate = useNavigate();
  const auth = useAuth();

  // // If AuthProvider has not initialized yet
  // if (!auth) {
  //   return (
  //     <header className="topbar" role="banner">
  //       <div className="brand">S3 Technologies</div>
  //     </header>
  //   );
  // }

    // Safely extract context properties, fallback if auth context isn't fully ready yet
  const ctxUser = auth?.user ?? null;
  const setUser = auth?.setUser ?? null;
  const contextLogout = auth?.logout ?? null;

  // Prioritize direct props -> context user -> localStorage cache backup
  const user = userProp || ctxUser || JSON.parse(localStorage.getItem("user") || "{}");

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const userRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    function onDocClick(e) {
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserOpen(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  async function handleLogout() {
    try {
      if (typeof contextLogout === "function") {
        await contextLogout();
      } else {
        try {
          await apiLogout();
        } catch (err) {
          console.warn("Logout API failed", err);
        }
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");  
        sessionStorage.clear();
        document.cookie = "session=; Max-Age=0; path=/;";
        if (typeof setUser === "function") setUser(null);
      }
    } finally {
      navigate("/login", { replace: true });
    }
  }

  return (
    <header className="topbar" role="banner" style={{ display: "flex", justifyContent: "between", alignItems: "center", padding: "0 16px" }}>
      <div className="brand">S3 Technologies</div>

      <div className="top-controls" style={{ display: "flex", alignItems: "center", gap: "16px", marginLeft: "auto" }}>
        
        {/* <button
          id="themeToggle"
          className="icon-btn"
          aria-label="Toggle dark mode"
          aria-pressed={theme === "dark"}
          onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
        >
          {theme === "dark" ? "🌙" : "☀️"}
        </button> */}

        <div className="notif-wrapper" style={{ position: "relative" }}>
          <button
            id="notifBtn"
            className="icon-btn"
            aria-label={`Notifications, ${user?.unreadNotifications ?? 0} unread`}
            aria-haspopup="true"
            aria-expanded={notifOpen}
            onClick={() => setNotifOpen((v) => !v)}
          >
            🔔
            {(user?.unreadNotifications ?? 0) > 0 && (
              <span className="badge">{user.unreadNotifications}</span>
            )}
          </button>

          {notifOpen && (
            <div
              className="dropdown notif-dropdown"
              role="menu"
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 8px)",
                minWidth: 220,
                zIndex: 1000,
              }}
            >
              <div className="dropdown-item">
                You have {user?.unreadNotifications ?? 0} unread notifications
              </div>
              <div className="dropdown-item">
                <a href="/notifications">View all</a>
              </div>
            </div>
          )}
        </div>
        {/* 🆔 Displays the User ID explicitly in the top-right control header stream
      {user && (user._id || user.id) && (
        <span 
          style={{ 
            fontSize: "12px", 
            opacity: 0.7, 
            fontFamily: "monospace", 
            background: "rgba(0,0,0,0.05)", 
            padding: "4px 8px", 
            borderRadius: "4px",
            color: "var(--text-main, #475569)" 
          }}
        >
          ID: {user._id || user.id}
        </span>
      )} */}

        <div className="user-menu" ref={userRef} style={{ position: "relative", display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            id="userBtn"
            className="user-btn"
            aria-haspopup="true"
            aria-expanded={userOpen}
            onClick={() => setUserOpen((v) => !v)}
          >
            <span className="avatar">👤</span>
            <span className="username">{user?.name ?? "Guest"}</span>
            <span>▾</span>
          </button>

           {/* 🚪 Quick Direct Logout Button */}
        <button
          onClick={handleLogout}
          style={{
            background: "#ef4444",
            color: "#fff",
            border: "none",
            padding: "6px 12px",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "500",
            whiteSpace: "nowrap"
          }}
        >
          Logout
        </button>

          {userOpen && (
            <ul
              className="dropdown"
              role="menu"
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 8px)",
                minWidth: 160,
                background: "var(--bg)",
                borderRadius: 6,
                boxShadow: "0 8px 24px rgba(2,6,23,0.12)",
                padding: 8,
                zIndex: 1000,
                listStyle: "none",
                margin: 0,
              }}
            >
              <li>
                <button
                  role="menuitem"
                  onClick={() => {
                    setUserOpen(false);
                    navigate("/profile");
                  }}
                  className="dropdown-btn"
                >
                  Profile
                </button>
              </li>

              <li>
                <button
                  role="menuitem"
                  onClick={() => {
                    setUserOpen(false);
                    navigate("/settings");
                  }}
                  className="dropdown-btn"
                >
                  Settings
                </button>
              </li>

              <li>
                <button
                  role="menuitem"
                  onClick={() => {
                    setUserOpen(false);
                    handleLogout();
                  }}
                  className="dropdown-btn"
                >
                  Logout
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>
    </header>
  );
}
