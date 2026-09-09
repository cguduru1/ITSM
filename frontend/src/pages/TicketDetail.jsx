// src/pages/TicketDetail.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import { useParams } from "react-router-dom";
import TicketLifecyclePanel from "../components/ticket/TicketLifecyclePanel";
import TicketWorkNotes from "../components/ticket/TicketWorkNotes";
import TicketAIAssist from "../components/ticket/TicketAIAssist";
import "../styles/ticket.css";

function ProblemIncidentsPanel({ ticket }) {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    api.get(`/api/tickets/${ticket._id}/incidents`).then(res => setIncidents(res.data));
  }, [ticket._id]);

  return (
    <div className="ticket-panel quantum">
      <h2>Linked Incidents</h2>
      <ul>
        {incidents.map(i => (
          <li key={i._id}>{i.number} — {i.title} ({i.status})</li>
        ))}
      </ul>
    </div>
  );
}

export default function TicketDetail({ user }) {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    api.get(`/api/tickets/${id}`).then(res => setTicket(res.data));
  }, [id]);

  if (!ticket) return null;

  return (
    <div className="ticket-root">
      <div className="ticket-header">
        <h1>{ticket.number} — {ticket.title}</h1>
        <p>{ticket.type} · {ticket.status} · {ticket.priority}</p>
        <Link to="/ticketdashboard" className="quantum-link" style={{ color: '#ffffff' }}>
          ← Back to Dashboard
      </Link> 
      </div>

      <div className="ticket-grid">
        <div className="ticket-panel quantum">
          <h2>Overview</h2>
          <p>Requester: {ticket.requesterName}</p>
          <p>Assignee: {ticket.assigneeName || "Unassigned"}</p>
          <p>Channel: {ticket.channel}</p>
          <p>CI: {ticket.ciName}</p>
          <p>Service: {ticket.serviceName}</p>
          <p>Impact: {ticket.impact}</p>
          <p>Urgency: {ticket.urgency}</p>
        </div>

        <TicketLifecyclePanel ticket={ticket} setTicket={setTicket} user={user} />

        <TicketWorkNotes ticket={ticket} setTicket={setTicket} user={user} />

        {user.permissions.ticket?.includes("ai") && (
          <TicketAIAssist ticketId={ticket._id} />
        )}
      </div>
    </div>
  );
}
