import React, { useEffect, useState, useRef } from "react";
import api from "../api/apiClient";
import Gantt from "frappe-gantt";

export default function ChangeCalendar() {
  const [events, setEvents] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const ganttRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    // Fetch changes/calendar items from existing endpoints
    Promise.allSettled([
      api.get("/api/changes"),
      api.get("/api/analytics/calendar")
    ])
      .then(([changesRes, analyticsRes]) => {
        if (!isMounted) return;

        // 1. Process items table data
        const rawAnalytics = analyticsRes.status === "fulfilled" ? analyticsRes.value?.data || [] : [];
        setItems(rawAnalytics);

        // 2. Fallback strategy for Gantt data: use /api/changes, or analytics if empty
        const rawChanges = changesRes.status === "fulfilled" 
          ? changesRes.value?.data?.changes || changesRes.value?.data || [] 
          : rawAnalytics;

        // Format raw items into Gantt-compliant event objects
        const formattedEvents = rawChanges.map((item) => ({
          id: String(item._id || item.id || Math.random()),
          title: item.title || item.changeNumber || "Change Request",
          start: item.scheduledStart || item.createdAt || new Date().toISOString(),
          end: item.scheduledEnd || item.scheduledStart || new Date().toISOString(),
          status: item.state || item.status || "Open"
        }));

        setEvents(formattedEvents);
      })
      .catch((err) => console.warn("Error fetching calendar data:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Render Frappe Gantt Chart
  useEffect(() => {
    if (!ganttRef.current || events.length === 0) return;

    ganttRef.current.innerHTML = "";

    const tasks = events.map((e) => {
      const start = e.start ? new Date(e.start).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
      const end = e.end ? new Date(e.end).toISOString().split("T")[0] : start;

      return {
        id: String(e.id),
        name: e.title,
        start: start,
        end: end,
        progress: 100,
        custom_class: e.status ? String(e.status).toLowerCase().replace(/\s+/g, "-") : "normal"
      };
    });

    try {
      new Gantt(ganttRef.current, tasks, {
        view_mode: "Week",
        on_click: (task) => {
          if (task?.id) {
            window.location.href = `/changes/${task.id}`;
          }
        }
      });
    } catch (err) {
      console.error("Error initializing Frappe Gantt:", err);
    }
  }, [events]);

  if (loading) {
    return (
      <div style={{ padding: 24, color: "#64748b" }}>
        <h3>Loading Change Calendar...</h3>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, width: "100%", boxSizing: "border-box" }}>
      <h2 style={{ marginBottom: 16, color: "#1e293b" }}>Change Calendar</h2>

      {/* GANTT CHART */}
      <div
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 16,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          marginBottom: 32,
          overflowX: "auto"
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 16, color: "#334155" }}>
          Schedule Timeline
        </h3>
        
        {events.length === 0 ? (
          <p style={{ color: "#94a3b8" }}>No scheduled change records found.</p>
        ) : (
          <svg ref={ganttRef} id="change-gantt" style={{ minWidth: "100%" }} />
        )}
      </div>

      {/* CALENDAR TABLE */}
      <div
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 16,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 16, color: "#334155" }}>
          Calendar Records
        </h3>

        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e2e8f0", color: "#64748b" }}>
              <th style={{ padding: "10px 12px" }}>Title</th>
              <th style={{ padding: "10px 12px" }}>State</th>
              <th style={{ padding: "10px 12px" }}>Start</th>
              <th style={{ padding: "10px 12px" }}>End</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: 12, color: "#94a3b8" }}>
                  No calendar records available.
                </td>
              </tr>
            ) : (
              items.map((i) => (
                <tr key={i._id || i.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px" }}>{i.title || "—"}</td>
                  <td style={{ padding: "12px" }}>{i.state || "—"}</td>
                  <td style={{ padding: "12px" }}>
                    {i.scheduledStart ? new Date(i.scheduledStart).toLocaleString() : "—"}
                  </td>
                  <td style={{ padding: "12px" }}>
                    {i.scheduledEnd ? new Date(i.scheduledEnd).toLocaleString() : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}