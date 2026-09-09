// src/pages/assets/AssetsList.jsx
import React, { useEffect, useState } from "react";

export default function AssetsList() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        // Replace with your real API call
        const res = await fetch("/api/assets");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (mounted) setAssets(data);
      } catch (err) {
        if (mounted) setError(err.message || "Failed to load");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div>Loading assets…</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  return (
    <div className="assets-list">
      <h1>Assets</h1>
      {assets.length === 0 ? (
        <div>No assets found.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Asset Tag</th>
              <th>Serial</th>
              <th>Model</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((a) => (
              <tr key={a._id || a.assetTag}>
                <td>{a.assetTag}</td>
                <td>{a.serialNumber}</td>
                <td>{a.modelId}</td>
                <td>{a.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
