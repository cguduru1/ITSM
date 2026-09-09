import { useEffect, useState } from "react";
// import api from "../api/api";
import apiClient from "../api/apiClient";

export default function MainLayout({ children }) {
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <div className="layout">
      <Sidebar setNotifOpen={setNotifOpen} />
      <NotificationsPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
      <div className="content-area">{children}</div>
    </div>
  );

export default function NotificationsPanel({ open, onClose }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!open) return;

    const load = async () => {
      try {
        const res = await api.get("/notifications");
        setNotifications(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, [open]);

  return (
    <div className={`notif-panel ${open ? "notif-open" : ""}`}>

      {/* Header */}
      <div className="notif-header">
        <h2>Notifications</h2>
        <button className="notif-close-btn" onClick={onClose}>
          <i className="ri-close-line"></i>
        </button>
      </div>

      {/* List */}
      <div className="notif-list">
        {notifications.length === 0 && (
          <p className="notif-empty">No new notifications</p>
        )}

        {notifications.map((n, i) => (
          <div className="notif-item" key={i}>
            <div className="notif-icon">
              <i className={n.icon || "ri-notification-3-line"}></i>
            </div>

            <div className="notif-content">
              <h4>{n.title}</h4>
              <p>{n.message}</p>
              <span className="notif-time">
                {new Date(n.timestamp).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
