export default function CILifecycleTimelineSN({ ci }) {
  const phases = [
    { key: "createdAt", label: "Created" },
    { key: "last_attested", label: "Last Attested" },
    { key: "updatedAt", label: "Updated" },
    { key: "retiredAt", label: "Retired" }
  ];

  return (
    <div className="sn-timeline">
      <h3>Lifecycle Timeline</h3>

      <div className="sn-timeline-line">
        {phases.map((p, idx) => {
          const value = ci[p.key];
          return (
            <div key={idx} className="sn-timeline-item">
              <div className="sn-timeline-dot"></div>
              <div className="sn-timeline-label">
                <strong>{p.label}</strong>
                <p>{value ? new Date(value).toLocaleString() : "—"}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
