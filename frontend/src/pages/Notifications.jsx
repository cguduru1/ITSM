import { useEffect, useState } from "react";
import api from "../api/api";
import MainLayout from "../layouts/MainLayout";

export default function Notifications() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get("/notifications/me")
      .then((res) => setItems(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <MainLayout>
      <h1>Notifications</h1>

      {items.map(n => (
        <div key={n._id} className="notification-card">
          <h3>{n.title}</h3>
          <p>{n.message}</p>
          <p><em>{new Date(n.timestamp).toLocaleString()}</em></p>
        </div>
      ))}
    </MainLayout>
  );
}
