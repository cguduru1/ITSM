import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
// import api from "../api/api";
import apiClient from "../api/apiClient";
import { Link } from "react-router-dom";

export default function Tickets() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/tickets");
        setTickets(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, []);

  return (
    <MainLayout>
      <div className="tickets-page">

        {/* Watermark */}
        <div className="page-watermark">
          <img src="/s3-watermark.png" alt="S3 Technologies" />
        </div>

        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Tickets</h1>
          <p className="page-subtitle">All tickets assigned or created by you</p>

          <Link to="/tickets/new" className="btn-primary">
            + Create Ticket
          </Link>
        </div>

        {/* Tickets Grid */}
        <div className="tickets-grid">
          {tickets.map((t, i) => (
            <Link to={`/tickets/${t._id}`} className="ticket-card" key={i}>
              <div className="ticket-card-header">
                <h3>{t.title}</h3>
                <span className={`status-badge status-${t.status || "open"}`}>
                  {t.status || "Open"}
                </span>
              </div>

              <p className="ticket-desc">{t.description}</p>

              <div className="ticket-meta">
                <span>Category: {t.category}</span>
                <span>Priority: {t.priority}</span>
                <span>Assigned: {t.assignedTo || "Unassigned"}</span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </MainLayout>
  );
}
