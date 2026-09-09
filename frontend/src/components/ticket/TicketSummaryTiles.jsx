import React from "react";

export default function TicketSummaryTiles({ analytics }) {
  if (!analytics) return null;

  // SAFE: Default to an empty array if byType is missing or undefined
  const totalFromTypes = (analytics?.byType || []).reduce((acc, t) => acc + (t.count || 0), 0);

  return (
    <div className="ticket-panel quantum">
      <h2>Summary</h2>
      <div className="ticket-tile-grid">
        <div className="ticket-tile">
          <h3>Total Tickets (by Type)</h3>
          <p>{totalFromTypes}</p>
        </div>
        <div className="tile">
          <h3>Total</h3>
          <p>{analytics.total ?? 0}</p>
        </div>
        <div className="tile">
          <h3>Open</h3>
          <p>{analytics.open ?? 0}</p>
        </div>
        <div className="tile">
          <h3>Closed</h3>
          <p>{analytics.closed ?? 0}</p>
        </div>
        <div className="ticket-tile">
          <h3>SLA Breaches</h3>
          <p>{analytics.slaBreached ?? 0}</p>
        </div>
      </div>
    </div>
  );
}
