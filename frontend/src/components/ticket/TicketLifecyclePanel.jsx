// src/components/ticket/TicketLifecyclePanel.jsx
import React from "react";
// import api from "../../api/api";
import apiClient from "../../api/apiClient";


const stages = ["New", "InProgress", "OnHold", "Resolved", "Closed"];

export default function TicketLifecyclePanel({ ticket, setTicket, user }) {
  const changeStatus = async (status) => {
    if (!user.permissions.ticket?.includes("update")) return;
    const res = await api.put(`/api/tickets/${ticket._id}`, { status });
    setTicket(res.data);
  };

  return (
    <div className="ticket-panel quantum">
      <h2>Lifecycle</h2>
      <div className="ticket-lifecycle">
        {stages.map(s => (
          <button
            key={s}
            className={`ticket-stage ${ticket.status === s ? "active" : ""}`}
            onClick={() => changeStatus(s)}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
