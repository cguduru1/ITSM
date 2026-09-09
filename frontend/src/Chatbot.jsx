// Chatbot.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const navigate = useNavigate();

  function parseCommand(text) {
    // Very small command parser. Extend as needed.
    const t = text.trim().toLowerCase();
    if (t.startsWith('open tickets') || t.startsWith('show tickets')) {
      navigate('/tickets', { state: { filter: t.includes('open') ? { status: 'open' } : null } });
      return 'Opening Tickets';
    }
    if (t.startsWith('open assets') || t.startsWith('show assets')) {
      navigate('/assets');
      return 'Opening Assets';
    }
    if (t.startsWith('open change') || t.startsWith('show changes')) {
      navigate('/changes');
      return 'Opening Changes';
    }
    if (t.startsWith('open cmdb')) {
      navigate('/cmdb');
      return 'Opening CMDB';
    }
    if (t.startsWith('open kb') || t.startsWith('search kb')) {
      navigate('/kb');
      return 'Opening Knowledgebase';
    }
    return "Sorry I didn't understand. Try 'open tickets' or 'open assets'.";
  }

  function onSubmit(e) {
    e.preventDefault();
    const response = parseCommand(input);
    setInput('');
    // Optionally show response in UI; for brevity we use alert
    alert(response);
    setOpen(false);
  }

  return (
    <>
      <button
        className="chatbot-btn"
        aria-label="Open chatbot"
        onClick={() => setOpen(true)}
      >
        💬
      </button>

      {open && (
        <div className="chatbot-panel" role="dialog" aria-label="Chatbot" aria-modal="true">
          <header className="chatbot-header">
            <strong>Assistant</strong>
            <button aria-label="Close chatbot" onClick={() => setOpen(false)}>✕</button>
          </header>
          <form className="chatbot-form" onSubmit={onSubmit}>
            <label htmlFor="chatInput" className="sr-only">Chat command</label>
            <input
              id="chatInput"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Try: open tickets, open assets"
              aria-label="Chat command"
              autoFocus
            />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </>
  );
}
