// src/components/TopBar.jsx
import React, { useState, useRef, useEffect } from "react";
import IconButton from "@mui/material/IconButton";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useAppTheme } from "./ThemeProvider";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "./auth/AuthContext";

export default function TopBar() {
  const { theme, setTheme } = useAppTheme();
  const navigate = useNavigate();
  const { user, setUser, logout: contextLogout } = useAuth(); // expect AuthContext to expose these
  const [userOpen, setUserOpen] = useState(false);
  const userRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function onDocClick(e) {
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  async function handleLogout() {
    try {
      // If AuthContext exposes a logout helper that calls backend + clears state, use it
      if (typeof contextLogout === 'function') {
        await contextLogout();
      } else {
        // Fallback: call backend logout, clear client state
        try {
          await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
        } catch (e) {
          // ignore network errors; still clear client state
          console.warn('Logout API failed', e);
        }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        sessionStorage.clear();
        document.cookie = 'session=; Max-Age=0; path=/;';
        if (typeof setUser === 'function') setUser(null);
      }
    } finally {
      // Always navigate to login and replace history
      navigate('/login', { replace: true });
    }
  }

  return (
    <div className="topbar" role="banner">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontWeight: 700, color: "var(--primary)" }}>S3 Technologies</div>
        <input
          placeholder="Search tickets, assets, CIs..."
          style={{ padding: 8, borderRadius: 8, border: "1px solid #e6eef8", width: 420 }}
          aria-label="Global search"
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <IconButton
          aria-label="Toggle theme"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>

        <div ref={userRef} style={{ position: 'relative' }}>
          <button
            className="user-btn"
            aria-haspopup="true"
            aria-expanded={userOpen}
            onClick={() => setUserOpen(v => !v)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                background: "#0B5FFF",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              aria-hidden="true"
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'G'}
            </div>
            <span className="username" aria-hidden="true">{user?.name ?? 'Guest'}</span>
            <span aria-hidden="true">▾</span>
          </button>

          {userOpen && (
            <ul
              className="dropdown"
              role="menu"
              aria-label="User menu"
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 8px)',
                minWidth: 160,
                background: 'var(--bg)',
                borderRadius: 6,
                boxShadow: '0 8px 24px rgba(2,6,23,0.12)',
                padding: 8,
                zIndex: 1000,
                listStyle: 'none',
                margin: 0
              }}
            >
              <li role="none">
                <button
                  role="menuitem"
                  onClick={() => { setUserOpen(false); navigate('/profile'); }}
                  style={{ display: 'block', width: '100%', padding: 8, background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                >
                  Profile
                </button>
              </li>
              <li role="none">
                <button
                  role="menuitem"
                  onClick={() => { setUserOpen(false); handleLogout(); }}
                  style={{ display: 'block', width: '100%', padding: 8, background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                >
                  Logout
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
