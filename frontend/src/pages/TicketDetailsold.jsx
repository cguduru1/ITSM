import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
// import api from "../api/api";
import apiClient from "../api/apiClient";

export default function TicketDetails() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/tickets/${id}`);
        setTicket(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, [id]);

  if (!ticket) {
    return (
      <MainLayout>
        <p>Loading ticket...</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="ticket-details-page">

        {/* Watermark */}
        <div className="page-watermark">
          <img src="/s3-watermarko.png" alt="S3 Technologies" />
        </div>

        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">{ticket.title}</h1>
          <span className={`status-badge status-${ticket.status || "open"}`}>
            {ticket.status || "Open"}
          </span>
        </div>

        {/* Meta Info */}
        <div className="ticket-details-meta">
          <p><strong>Category:</strong> {ticket.category}</p>
          <p><strong>Priority:</strong> {ticket.priority}</p>
          <p><strong>Assigned To:</strong> {ticket.assignedTo || "Unassigned"}</p>
          <p><strong>Created:</strong> {new Date(ticket.createdAt).toLocaleString()}</p>
        </div>

        {/* Description */}
        <div className="ticket-details-card">
          <h2>Description</h2>
          <p>{ticket.description}</p>
        </div>

      </div>
    </MainLayout>
  );
}
