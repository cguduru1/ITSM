import React, { useMemo } from "react";

export default function CABAutomation({ cabMeetings }) {
  const { upcoming, pendingSignOffs } = useMemo(() => {
    const upcoming = cabMeetings?.filter(m => m.status === "Upcoming") || [];
    const pendingSignOffs = upcoming.filter(m => !m.signedOff).length;
    return { upcoming, pendingSignOffs };
  }, [cabMeetings]);

  return (
    <section className="quantum-panel">
      <h3 className="quantum-heading">Automation</h3>
      <div className="quantum-card">
        <p>Agendas auto‑generated, reminders sent, and sign‑off tracking enabled.</p>
        <p>
          {pendingSignOffs > 0
            ? `${pendingSignOffs} upcoming CAB meetings awaiting sign‑off.`
            : "All upcoming CAB meetings are signed off."}
        </p>
        <p>
          {upcoming.length > 0
            ? `Next CAB scheduled on ${upcoming[0].date}.`
            : "No upcoming CAB meetings scheduled."}
        </p>
      </div>
    </section>
  );
}
