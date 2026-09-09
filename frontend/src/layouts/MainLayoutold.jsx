import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function MainLayout({ children }) {
  const [dark, setDark] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  const navigate = useNavigate();
  const username = "Chandra";

  return (
    <div className={`layout-container ${dark ? "dark-mode" : ""}`}>

      {/* HEADER */}
      <header className="page-header">

        {/* LEFT LOGO */}
        <img src="/s3-logo.png" alt="S3 Technologies" className="page-logo" />

        {/* CENTER SEARCH */}
        <div className="global-search">
          <i className="ri-search-line"></i>
          <input type="text" placeholder="Search tickets, assets, CIs..." />
        </div>

        {/* RIGHT ICONS */}
        <div className="topbar-right">

          {/* DARK MODE */}
          <button className="icon-btn" onClick={() => setDark(!dark)}>
            <i className="ri-moon-line"></i>
          </button>

          {/* NOTIFICATIONS */}
          <div className="notif-wrapper">
            <button className="icon-btn" onClick={() => setShowNotif(!showNotif)}>
              <i className="ri-notification-3-line"></i>
            </button>

            {showNotif && (
              <div className="notif-dropdown">
                <div className="notif-item">New ticket assigned</div>
                <div className="notif-item">Asset updated</div>
                <div className="notif-item">Change request pending</div>
              </div>
            )}
          </div>

          {/* PROFILE */}
          <div className="user-profile" onClick={() => setShowProfile(!showProfile)}>
            <img src="/profile.png" className="profile-pic" />
            <span className="username">{username}</span>

            {showProfile && (
              <div className="profile-dropdown">
                <div className="dropdown-item">My Profile</div>
                <div className="dropdown-item">Settings</div>
                <div className="dropdown-item" onClick={() => navigate("/login")}>
                  Logout
                </div>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="sidebar-logo">
          <img src="/s3-logo.png" alt="S3 Technologies" />
        </div>

        <nav className="sidebar-nav">

            <NavLink to="/chatbot" className="nav-item">
            <i className="ri-robot-line"></i>
            <span>Chatbot</span>
          </NavLink>

          <NavLink to="/dashboard" className="nav-item">
            <i className="ri-dashboard-line"></i>
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/tickets" className="nav-item">
            <i className="ri-ticket-line"></i>
            <span>Tickets</span>
          </NavLink>

          <NavLink to="/new-ticket" className="nav-item">
            <i className="ri-add-line"></i>
            <span>New Ticket</span>
          </NavLink>

          <NavLink to="/workspace/assets" className="nav-item">
            <i className="ri-database-2-line"></i>
            <span>Assets</span>
          </NavLink>

          <NavLink to="/workspace/changes" className="nav-item">
            <i className="ri-refresh-line"></i>
            <span>Changes</span>
          </NavLink>

          <NavLink to="/workspace/cmdb" className="nav-item">
            <i className="ri-stack-line"></i>
            <span>CMDB</span>
          </NavLink>

          <NavLink to="/knowledge" className="nav-item">
            <i className="ri-book-open-line"></i>
            <span>Knowledge Base</span>
          </NavLink>

          <NavLink to="/admin" className="nav-item">
            <i className="ri-settings-3-line"></i>
            <span>Admin</span>
          </NavLink>

        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <div className="page-watermark">
          <img src="/s3-watermark.png" alt="S3 Technologies" />
        </div>

        {children}
      </main>

    </div>
  );
}
