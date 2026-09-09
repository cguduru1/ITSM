import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/apiClient";
import TicketSummaryTiles from "../components/ticket/TicketSummaryTiles";
import TicketAnalyticsCharts from "../components/ticket/TicketAnalyticsCharts";
import "../styles/ticket.css";

// Temporary fallback component if RequestCatalogPanel isn't imported yet
function RequestCatalogPanel({ user }) {
  return (
    <div className="catalog-panel" style={{ marginTop: "1rem" }}>
      <h3>Request Catalog</h3>
      <p style={{ color: "#94a3b8" }}>Available requests for {user?.name || "User"}</p>
    </div>
  );
}

function MajorIncidentPanel() {
  const [majors, setMajors] = useState([]);

  useEffect(() => {
    apiClient.get("/api/tickets/major-incidents")
      .then((res) => {
        const data = res?.data ?? res;
        setMajors(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Failed to load major incidents:", err));
  }, []);

  if (!majors.length) return null;

  return (
    <div style={{ marginTop: "1rem" }}>
      <h2>⚠️ Major Incidents</h2>
      <ul>
        {majors.map((m) => (
          <li key={m._id || m.id}>
            <Link to={`/tickets/${m._id}`}>
            {m.number} — {m.title} 
            </Link>
            · {m.priority} · {m.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -----------------------------
   Ticket List with CRUD + Assign
------------------------------ */
function TicketList({ user }) {
  const [tickets, setTickets] = useState([]);
  const [editingTicket, setEditingTicket] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", status: "New", priority: "Medium" });

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const res = await apiClient.get("/api/tickets");
      setTickets(res.data || []);
    } catch (err) {
      console.error("Failed to load tickets:", err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTicket) {
        await apiClient.put(`/api/tickets/${editingTicket._id}`, form);
      } else {
        await apiClient.post("/api/tickets", form);
      }
      setForm({ title: "", description: "", status: "New", priority: "Medium" });
      setEditingTicket(null);
      loadTickets();
    } catch (err) {
      console.error("Failed to save ticket:", err);
    }
  };

  const handleEdit = (ticket) => {
    setEditingTicket(ticket);
    setForm({
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority
    });
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/api/tickets/${id}`);
      setTickets(tickets.filter(t => t._id !== id));
    } catch (err) {
      console.error("Failed to delete ticket:", err);
    }
  };

  const handleAssign = async (id, assigneeId) => {
    try {
      await apiClient.put(`/api/tickets/${id}/assign`, { assigneeId });
      loadTickets();
    } catch (err) {
      console.error("Failed to assign ticket:", err);
    }
  };

  return (
    <div className="ticket-panel quantum">
      <h2>Tickets</h2>

      {/* Ticket Form */}
       <form onSubmit={handleSubmit} style={{ marginBottom: "1.5rem", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Title"
        />
        <input
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
        />
        <select name="status" value={form.status} onChange={handleChange}>
          <option value="New">New</option>
          <option value="Assess">Assess</option>
          <option value="Authorize">Authorize</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Implement">Implement</option>
          <option value="Review">Review</option>
          <option value="Closed">Closed</option>
        </select>
        <select name="priority" value={form.priority} onChange={handleChange}>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <button type="submit">{editingTicket ? "Update Ticket" : "Add Ticket"}</button>
        {editingTicket && <button type="button" onClick={() => { setEditingTicket(null); setForm({ title: "", description: "", status: "New", priority: "Medium" }); }}>Cancel</button>}
      </form>

      {/* Ticket Table */}
      <table>
        <thead>
          <tr>
            <th>Number</th><th>Title</th><th>Status</th><th>Priority</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map(t => (
            <tr key={t._id}>
              <td>{t.number}</td>
              <td>{t.title}</td>
              <td>{t.status}</td>
              <td>{t.priority}</td>
              <td>
                <button onClick={() => handleEdit(t)}>Edit</button>
                <button onClick={() => handleDelete(t._id)}>Delete</button>
                {user?.role === "admin" && (
                  <button onClick={() => handleAssign(t._id, "someUserId")}>Assign</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* -----------------------------
   Main Dashboard
------------------------------ */
export default function TicketDashboard({ user }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get("/api/tickets/analytics")
      .then((res) => setAnalytics(res?.data ?? res))
      .catch((err) => console.error("Failed to load analytics:", err));
  }, []);

  const ticketPermissions = user?.permissions?.ticket || [];
  const canViewAnalytics = ticketPermissions.includes("analytics");
  const canCreateTicket = ticketPermissions.includes("create");
  const canUpdateTicket = ticketPermissions.includes("update");
  const canDeleteTicket = ticketPermissions.includes("delete");

  return (
    <div className="ticket-root">
      <div className="ticket-header">
        <h1>🎛 Ticket Operations</h1>
        <p>Incidents, Service Requests, Problems</p>
      </div>

      {/* <MajorIncidentPanel />
      <RequestCatalogPanel user={user} />
      <TicketList user={user} /> */}

      <div className="ticket-panel quantum" style={{ marginTop: "2rem" }}>
        {canCreateTicket && (
          <Link to="/tickets/new" className="ticket-btn">➕ Add Ticket</Link>
        )}
        <Link to="/tickets" className="ticket-btn">📋 View Tickets</Link>
        {/* {canUpdateTicket && (
          <Link to="/tickets/edit" className="ticket-btn">✏️ Edit Ticket</Link>
        )}
        {canDeleteTicket && (
          <Link to="/tickets/delete" className="ticket-btn">🗑 Delete Ticket</Link>
        )} */}
      </div>

      {canViewAnalytics && analytics && (
      <div className="ticket-grid">
        {analytics && <TicketSummaryTiles analytics={analytics} />}
        {analytics && <TicketAnalyticsCharts analytics={analytics} />}
      </div>

      )}
    </div>
  );
}
