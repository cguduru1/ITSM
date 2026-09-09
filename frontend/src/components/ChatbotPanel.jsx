import { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
// import api from "../api/api";
import apiClient from "../api/apiClient";


export default function ChatbotPanel({ open, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  const userId = localStorage.getItem("userId");
  const bodyRef = useRef();

  // ⭐ Load latest chat history when panel opens
  useEffect(() => {
    if (open) {
      api.get(`/api/chat/${userId}`).then(res => {
        setMessages(res.data.messages || []);
        setSessionId(res.data.sessionId || null);
      });
    }
  }, [open]);

  // ⭐ Save chat history to backend whenever messages change
  useEffect(() => {
    if (sessionId) {
      api.post("/api/chat/save", {
        userId,
        sessionId,
        messages
      });
    }
  }, [messages]);

  // ⭐ Auto-scroll to bottom
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages]);

  if (!open) return null; // Prevent DOM leakage

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMsg = {
      sender: "user",
      text: input,
      time: Date.now()
    };

    const botMsg = {
      sender: "bot",
      text: "Thinking...",
      time: Date.now()
    };

    setMessages(prev => [...prev, userMsg, botMsg]);
    setInput("");

    // ⭐ Typing indicator
    setTyping(true);

    setTimeout(() => {
      setTyping(false);

      setMessages(prev =>
        prev.map((m, i) =>
          i === prev.length - 1
            ? { ...m, text: "This is a sample AI response.", time: Date.now() }
            : m
        )
      );
    }, 800);
  };

  // ⭐ Export chat as PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    messages.forEach((m, i) => {
      doc.text(
        `${m.sender.toUpperCase()} (${new Date(m.time).toLocaleTimeString()}): ${m.text}`,
        10,
        10 + i * 10
      );
    });
    doc.save("chat-history.pdf");
  };

  return (
    <div className="chatbot-panel">
      <div className="chatbot-header">
        <h3>AI Assistant</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="chatbot-body" ref={bodyRef}>
        {messages.map((m, i) => (
          <div key={i} className={`chat-msg ${m.sender}`}>
            <div className="msg-text">{m.text}</div>
            <div className="msg-time">
              {new Date(m.time).toLocaleTimeString()}
            </div>
          </div>
        ))}

        {typing && (
          <div className="typing-indicator">AI is typing…</div>
        )}
      </div>

      <div className="chatbot-footer">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
        <button onClick={exportPDF}>PDF</button>
      </div>
    </div>
  );
}
