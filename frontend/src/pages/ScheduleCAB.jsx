import React, { useState } from "react";

export default function ScheduleCAB({ onSchedule }) {
  const [date, setDate] = useState("");
  const [agenda, setAgenda] = useState("");
  const [attendees, setAttendees] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const newMeeting = {
      date,
      status: "Upcoming",
      agenda,
      attendees: attendees.split(",").map(a => a.trim()),
      signedOff: false
    };
    onSchedule(newMeeting); // push into CAB timeline state
  };

  return (
    <form className="quantum-form" onSubmit={handleSubmit}>
      <label>Date/Time</label>
      <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} required />

      <label>Agenda</label>
      <input type="text" value={agenda} onChange={e => setAgenda(e.target.value)} required />

      <label>Attendees (comma separated)</label>
      <input type="text" value={attendees} onChange={e => setAttendees(e.target.value)} />

      <button type="submit" className="quantum-button">Schedule CAB</button>
    </form>
  );
}
