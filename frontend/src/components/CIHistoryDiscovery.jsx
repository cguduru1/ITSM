export default function CIHistoryDiscovery({ history = [] }) {
  if (!Array.isArray(history)) return <p>No history available</p>;

  return (
    <div className="ci-history">
      <h3>Discovery History</h3>

      {history.length === 0 && <p>No discovery history found.</p>}

      {history.map(ci => (
        <div key={ci._id} className="ci-history-item">
          <strong>{ci.name}</strong> — {ci.ip} — {ci.category}
          <br />
          <small>Discovered at: {new Date(ci.discovered_at).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}
