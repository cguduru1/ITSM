// src/components/ticket/TicketWorkNotes.jsx
import React, { useState } from "react";
// import api from "../../api/api";
import apiClient from "../../api/apiClient";


export default function TicketWorkNotes({ ticket, setTicket, user }) {
  const [text, setText] = useState("");

  const addNote = async () => {
    if (!user.permissions.ticket?.includes("update")) return;
    const res = await api.post(`/api/tickets/${ticket._id}/work-note`, {
      text,
      type: "internal"
    });
    setTicket(res.data);
    setText("");
  };

  return (
    <div className="ticket-panel quantum">
      <h2>Work Notes</h2>
      <ul>
        {ticket.workNotes?.map(n => (
          <li key={n._id}>
            <strong>{n.authorName}</strong> — {n.text}  
            <span className="ticket-note-meta">
              {new Date(n.createdAt).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>

      {user.permissions.ticket?.includes("update") && (
        <>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Add internal work note..."
          />
          <button className="ticket-btn" onClick={addNote}>Add Note</button>
        </>
      )}
    </div>
  );
}
