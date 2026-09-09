import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/apiClient";
import "../styles/changeQuantum.css";
import "../styles/cmdb.css";
import "../styles/ticket.css"; 

const SUGGESTED_PROMPTS = [
  "Show active production servers",
  "Which CIs are down or critical?",
  "Show dependencies for PaymentGateway",
  "List unassigned infrastructure items"
];

export default function CMDBChatbot() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hello! I am your CMDB Assistant. Ask me anything about CIs, relationships, health, or impact analysis.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (queryText) => {
    const textToSend = queryText || question;
    if (!textToSend.trim() || loading) return;

    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const userMsg = { role: "user", text: textToSend, timestamp: time };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion("");
    setLoading(true);

    try {
      // In CMDBChatbot.jsx inside handleSend
      const res = await apiClient.post("/api/cmdb/chatbot/query", { query: textToSend });
      const botAnswer = res?.data?.answer || "I couldn't process that query. Please try rephrasing.";

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: botAnswer,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } catch (err) {
      console.error("CMDB Chatbot Error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "⚠️ System Error: Unable to fetch CMDB data. Check your connection or backend services.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isError: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "bot",
        text: "Chat history cleared. How else can I assist you with the CMDB?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
  };

  return (
    <div className="quantum-page" style={{ maxWidth: "900px", margin: "0 auto" }}>
      {/* Header */}
      <div className="ticket-header"> 

      <header className="quantum-header quantum-flex-between">
        <div>
          <h1>🤖 CMDB AI Assistant</h1>
          <p>
            Real-time CI insights, dependency lookups & health checks
          </p>
        </div>

        <Link to="/cmdb-dashboard" className="quantum-link" style={{ color: '#ffffff' }}>
                      ← Back to Dashboard
                  </Link>

        <button onClick={clearChat} className="quantum-btn quantum-btn-secondary">
          Clear History
        </button>
      </header>
      </div>

      {/* Chat Window */}
     <section className="quantum-panel" style={{ height: "450px" }}>
        <div className="quantum-card quantum-chat-window">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`quantum-chat-bubble ${
                msg.role === "user" ? "quantum-chat-user" : msg.isError ? "quantum-chat-error" : "quantum-chat-bot"
              }`}
            >
              <div className="quantum-chat-text">{msg.text}</div>
              <span className="quantum-chat-meta">
                {msg.role === "user" ? "You" : "CMDB Bot"} • {msg.timestamp}
              </span>
            </div>
          ))}

          {loading && (
            <div className="quantum-chat-bubble quantum-chat-bot">
              <div className="quantum-chat-text muted">
                Analyzing CMDB infrastructure... ⏳
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </section>

      {/* Quick Prompts */}
      <section className="quantum-panel">
        <h3 className="quantum-heading">Suggestions</h3>
        <div className="quantum-card quantum-flex-wrap">
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              disabled={loading}
              className="quantum-btn quantum-btn-light"
            >
              {prompt}
            </button>
          ))}
        </div>
      </section>

      {/* Input Controls */}
      <section className="quantum-panel quantum-flex">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question (Enter to send, Shift+Enter for new line)..."
          disabled={loading}
          rows={2}
          className="quantum-input quantum-textarea"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !question.trim()}
          className={`quantum-btn ${loading || !question.trim() ? "quantum-btn-disabled" : "quantum-btn-primary"}`}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </section>
    </div>
  );
}