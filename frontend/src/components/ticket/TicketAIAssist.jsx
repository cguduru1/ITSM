// src/components/ticket/TicketAIAssist.jsx
import React, { useEffect, useState } from "react";
// import api from "../../api/api";
import apiClient from "../../api/apiClient";
import "../../styles/ticket.css";

export default function TicketAIAssist({ ticketId }) {
  const [ai, setAi] = useState(null);
  const [suggested, setSuggested] = useState([]);

  useEffect(() => {
    api.get(`/api/tickets/ai/${ticketId}`).then(res => setAi(res.data));
  }, [ticketId]);

  useEffect(() => {
    if (!ai || !ai.hints || ai.hints.length === 0) return;

    const query = ai.hints[0]; // use first hint or ticket title
    api.get(`/api/knowledge/ai/suggest?q=${encodeURIComponent(query)}`)
      .then(res => setSuggested(res.data));
  }, [ai]);

  if (!ai) return null;

  return (
    <div className="ticket-panel quantum">
      <h2>AI & Agent Assist</h2>

      <h3>AI Hints</h3>
      <ul>
        {ai.hints.map((h, idx) => (
          <li key={idx}>{h}</li>
        ))}
      </ul>

      {suggested.length > 0 && (
        <>
          <h3>Suggested Knowledge Articles</h3>
          <ul>
            {suggested.map(a => (
              <li key={a._id}>
                <strong>{a.title}</strong>
                <p>{a.content.slice(0, 120)}...</p>
                <a
                  href={`/knowledge/${a._id}`}
                  className="ticket-link"
                >
                  View Article
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
