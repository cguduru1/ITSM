import { useEffect, useState } from "react";
// import api from "../api/api";
import apiClient from "../api/apiClient";


export default function CIAutoDiscoverySN() {
  const [status, setStatus] = useState(null);
  const [lastRun, setLastRun] = useState(null);
  const [discoveries, setDiscoveries] = useState([]);
  const [results, setResults] = useState([]);

  const load = async () => {
  try {
    const res = await api.get("/api/cmdb/discovery/status");
    setStatus(res.data.status);
    setLastRun(res.data.lastRun);
    setDiscoveries(res.data.newItems || []);
  } catch (err) {
    console.error("Status load failed:", err);
  }
};

  useEffect(() => {
    load();
  }, []);

  const runDiscovery = async () => {
  try {
    const res = await api.post("/api/cmdb/discovery/run");
    setResults(res.data.newItems || []);
    load();
  } catch (err) {
    console.error("Discovery failed:", err);
    setResults([]);
  }
};

  return (
    <div className="sn-discovery">
      <h2>Auto‑Discovery Agent</h2>

      <button onClick={runDiscovery} className="btn btn-primary">
        Run Discovery
      </button>

      <div className="sn-discovery-status">
        <p><strong>Status:</strong> {status || "Unknown"}</p>
        <p><strong>Last Run:</strong> {lastRun ? new Date(lastRun).toLocaleString() : "Never"}</p>
      </div>

      <div className="discovery-grid">
        {results.map((d) => (
          <div key={d._id} className={`ci-box teal`}>
            <h4>{d.name}</h4>
            <p>{d.category}</p>
            <p>{d.environment}</p>
          </div>
        ))}
      </div>

      <div className="sn-discovery-results">
        <h3>Newly Discovered CIs</h3>
        {discoveries.length === 0 && <p>No new items</p>}
        {discoveries.map(ci => (
          <div key={ci._id} className="sn-discovery-item">
            <strong>{ci.name}</strong> — {ci.category} ({ci.environment})
          </div>
        ))}
      </div>
    </div>
  );
}
