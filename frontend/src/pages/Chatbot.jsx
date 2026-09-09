import { useState } from "react";
import api from "../api/api";
import MainLayout from "../layouts/MainLayout";

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMsg = { sender: "user", text: input };
    setMessages(prev => [...prev, userMsg]);

    try {
      // Backend expects: { message: "..." }
      const res = await api.post("/api/chat", { message: input });

      const botMsg = { sender: "bot", text: res.data.reply };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error("Chatbot error:", err);
      setMessages(prev => [
        ...prev,
        { sender: "bot", text: "Chatbot service unavailable." }
      ]);
    }

    setInput("");
  };

  return (
    <MainLayout>
      <div className="chat-ui">
        <h2 className="chat-title">AI Chatbot</h2>

        <div className="chat-window">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`chat-bubble ${msg.sender === "user" ? "user" : "bot"}`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        <div className="chat-input-area">
          <input
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
          />
          <button className="chat-send" onClick={sendMessage}>
            Ask
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
