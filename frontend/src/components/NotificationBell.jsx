import { useEffect, useState } from "react";
// import api from "../api/api";
import apiClient from "../api/apiClient";


export default function NotificationBell() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get("/notifications/me")
      .then((res) => setItems(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="notification-bell">
      🔔 {items.filter(i => !i.read).length}
    </div>
  );
}
