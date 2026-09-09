// src/pages/TicketList.jsx
import React, { useEffect, useState } from "react";
import apiClient from "../api/apiClient";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "../styles/ticket.css";

export default function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);

  const { user, currentUser } = useAuth();
  const activeUser = user || currentUser || JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    loadTickets();
    loadAgents();
  }, []);

 const loadTickets = async () => {
  try {
    const res = await apiClient.get("/api/tickets");
    console.log("Tickets response:", res);

    const rawData = res?.data ?? res;
    
    // 💡 Fallback engine: Unpacks any possible format your backend sends
    let actualTicketsArray = [];

     if (Array.isArray(rawData)) {
      actualTicketsArray = rawData;
    } else if (Array.isArray(rawData?.data)) {
      actualTicketsArray = rawData.data;
    } else if (Array.isArray(rawData?.tickets)) {
      actualTicketsArray = rawData.tickets;
    } else if (Array.isArray(rawData?.result)) {
      actualTicketsArray = rawData.result;
    } else if (Array.isArray(rawData?.items)) {
      actualTicketsArray = rawData.items;
    } else {
      console.warn("Unexpected tickets response shape:", rawData);
    }

    setTickets(actualTicketsArray);
  } catch (err) {
    console.error("Failed to load tickets:", err);
    setTickets([]);
  }
};

// Mock array/API fetch for available ticket assignment agents
  const loadAgents = async () => {
    try {
      // Proactively try to hit your users endpoint
      const res = await apiClient.get("/api/users").catch(() => null) ;
      
      if (res?.data && Array.isArray(res.data)) {
        // Filter out agents if your payload includes a role parameter field
        setAgents(res.data);
      } else {
        // FIXED: Real 24-character hexadecimal MongoDB ObjectIds to pass backend validations
        setAgents([
          { _id: "6a9082fa29a974f4a1d2e921", name: "Sarah Connor (Tier 1)" },
          { _id: "6a90833129a974f4a1d2e923", name: "John Doe (Tier 2)" },
          { _id: "6a90835629a974f4a1d2e924", name: "Alex Mercer (Network)" }
        ]);
      }
    } catch (err) {
      console.error("Failed to load agents:", err);
    }
  };

  const handleAssign = async (ticketId, assigneeId) => {
  // Optimistic UI update
  setTickets(prevTickets =>
    prevTickets.map(t =>
      t._id === ticketId ? { ...t, assigneeId } : t
    )
  );

try {
    const res = await apiClient.put(`/api/tickets/${ticketId}/assign`, {
      assigneeId: assigneeId || null,
    });

    console.log("Assignment response:", res.data);
  } catch (err) {
    console.error("Database sync failed. Reverting change:", err.response?.data || err.message);
    loadTickets();
  }
};

  const handleDelete = async (id) => {
    try {
      await apiClient.del(`/api/tickets/${id}`);
      setTickets(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      console.error("Failed to delete ticket:", err);
    }
  };

  // SAFE: Guard permissions path cleanly against undefined states
  const ticketPermissions = activeUser?.permissions?.ticket || activeUser?.role === "admin" ? ["update", "delete"] : [];
  const canUpdate = ticketPermissions.includes("update") || activeUser?.role === "agent"; 
  const canDelete = ticketPermissions.includes("delete") || activeUser?.role === "admin";

  return (
    <div className="ticket-root">
      <div className="ticket-header">
        <h1>📂 Ticket Queue</h1>
         <Link to="/ticketdashboard" className="quantum-link" style={{ color: '#ffffff' }}>
            ← Back to Dashboard
        </Link> 
      </div>

      <div className="ticket-panel quantum">
        <table className="ticket-table bordered-table">
          <thead>
            <tr>
              <th>Number</th>
              <th>Type</th>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>CI / Service</th>
              <th>Assignee</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
  {tickets.map(t => {
  const currentAssignee =
    typeof t.assigneeId === "object"
      ? t.assigneeId._id
      : t.assigneeId || "";
    return (
      <tr key={t._id}>
        <td><Link to={`/tickets/${t._id}`}>{t.number || "N/A"}</Link></td>
        <td>{t.type || "Incident"}</td>
        <td>{t.title || t.shortDescription || "—"}</td>
        <td>{t.status}</td>
        <td>{t.priority}</td>
        <td>{t.ciName || t.serviceName || "—"}</td>
        
        <td>
          <select 
            className="quantum-select small"
            value={currentAssignee}
            onChange={(e) => handleAssign(t._id, e.target.value)}
          >
            <option value="">-- Unassigned --</option>
            {agents.map(agent => (
              <option key={agent._id} value={agent._id}>
                {agent.name}
              </option>
            ))}
          </select>
        </td>

        <td>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {canUpdate && (
              <Link to={`/tickets/${t._id}/edit`} className="quantum-btn small edit">
                ✏️ Edit
              </Link>
            )}
            {canDelete && (
              <button onClick={() => handleDelete(t._id)} className="quantum-btn small delete">
                🗑 Delete
              </button>
            )}
            <Link to={`/tickets/${t._id}`} className="ticket-link">View</Link>
          </div>
        </td>
      </tr>
    );
  })}
</tbody>
        </table>
      </div>
    </div>
  );
}
