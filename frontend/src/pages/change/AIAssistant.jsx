import React, { useState } from "react";
import api from "../../api/apiClient";
import "../../styles/changeQuantum.css";

export default function AIAssistant() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSummarize = async () => {
    setLoading(true);
    try {
      const res = await api.post("/ai/summarize", { text: input });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setResult({ error: "AI request failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="quantum-page">
      <div className="quantum-page-header">
        <h2>AI Assistant</h2>
        <p className="muted">Generate descriptions, summaries and suggested approvals</p>
      </div>

      <div className="quantum-page-body">
        <div className="quantum-card" style={{ gridColumn: "1 / -1" }}>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={6} placeholder="Paste change description or CI impact details" />
          <div style={{ marginTop: 8 }}>
            <button onClick={onSummarize} disabled={loading}>Summarize</button>
          </div>
          {loading && <div className="muted">Thinking…</div>}
          {result && <div style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>{result.error ? <span className="error">{result.error}</span> : result.summary}</div>}
        </div>
      </div>
    </div>
  );
}
